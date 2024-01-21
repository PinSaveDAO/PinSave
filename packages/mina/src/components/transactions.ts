import {
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
  MerkleMap,
  MerkleMapWitness,
  Field,
  fetchAccount,
} from 'o1js';
import dotenv from 'dotenv';

import { MerkleMapContract, NFT } from '../NFTsMapContract.js';
import { logStates } from './AppState.js';
import { logTokenBalances } from './TokenBalances.js';
import { NFTtoHash } from './NFT.js';

export function getEnvAddresses() {
  const deployerKey: PrivateKey = PrivateKey.fromBase58(
    process.env.deployerKey as string
  );

  const pubKey: PublicKey = deployerKey.toPublicKey();

  console.log('deployer address', pubKey.toBase58());
  return { pubKey: pubKey, deployerKey: deployerKey };
}

export async function startBerkeleyClient(
  endpoint: string = 'https://proxy.berkeley.minaexplorer.com/graphql'
) {
  dotenv.config();

  const Berkeley = Mina.Network(endpoint);

  Mina.setActiveInstance(Berkeley);
}

export async function startLocalBlockchainClient(
  proofsEnabled: boolean = false,
  enforceTransactionLimits: boolean = false
) {
  const Local = Mina.LocalBlockchain({
    proofsEnabled: proofsEnabled,
    enforceTransactionLimits: enforceTransactionLimits,
  });

  Mina.setActiveInstance(Local);
  const accounts = Local.testAccounts;
  return accounts;
}

export async function initNFT(
  pubKey: PublicKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap
) {
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);
  const init_mint_tx: Mina.Transaction = await Mina.transaction(pubKey, () => {
    zkAppInstance.initNFT(_NFT, witnessNFT);
  });

  await init_mint_tx.prove();
  await init_mint_tx.sign([pk]).send();

  // the tx should execute before we set the map value
  merkleMap.set(nftId, NFTtoHash(_NFT));

  logStates(zkAppInstance, merkleMap);
}

export async function mintNFTfromMap(
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  live = true
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  await mintNFT(pk, _NFT, zkAppInstance, witnessNFT, live);

  logTokenBalances(pubKey, zkAppInstance);
  logStates(zkAppInstance, merkleMap);
}

export async function mintNFT(
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMapWitness: MerkleMapWitness,
  live = true
) {
  await MerkleMapContract.compile();
  const pubKey: PublicKey = pk.toPublicKey();

  const txOptions = createTxOptions(pubKey, live);

  try {
    const mint_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.mintNFT(_NFT, merkleMapWitness);
    });

    await sendWaitTx(mint_tx, pk);
  } catch (e) {
    const mint_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
      zkAppInstance.mintNFT(_NFT, merkleMapWitness);
    });

    await sendWaitTx(mint_tx, pk);
  }
}

export async function transferNFT(
  pubKey: PublicKey,
  pk: PrivateKey,
  recipient: PublicKey,
  recipientPk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap
) {
  const nftId = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  try {
    const nft_transfer_tx: Mina.Transaction = await Mina.transaction(
      pubKey,
      () => {
        AccountUpdate.fundNewAccount(recipient);
        zkAppInstance.transferOwner(_NFT, recipient, witnessNFT);
      }
    );

    await nft_transfer_tx.prove();
    await nft_transfer_tx.sign([pk, recipientPk]).send();
  } catch (e) {
    const nft_transfer_tx: Mina.Transaction = await Mina.transaction(
      pubKey,
      () => {
        zkAppInstance.transferOwner(_NFT, recipient, witnessNFT);
      }
    );

    await nft_transfer_tx.prove();
    await nft_transfer_tx.sign([pk, recipientPk]).send();
  }

  _NFT.changeOwner(recipient);

  merkleMap.set(nftId, NFTtoHash(_NFT));

  logTokenBalances(pubKey, zkAppInstance);
  logTokenBalances(recipient, zkAppInstance);

  logStates(zkAppInstance, merkleMap);
}

export async function initRootWithApp(
  pk: PrivateKey,
  zkAppPub: PublicKey,
  merkleMap: MerkleMap
) {
  await MerkleMapContract.compile();
  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppPub);

  await initAppRoot(pk, zkAppInstance, merkleMap, true);
}

export async function initAppRoot(
  pk: PrivateKey,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  live?: boolean
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const rootBefore: Field = merkleMap.getRoot();

  const txOptions = createTxOptions(pubKey, live);

  const init_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(rootBefore);
  });

  await sendWaitTx(init_tx, pk);

  logStates(zkAppInstance, merkleMap);
}

export async function deployApp(
  pk: PrivateKey,
  live?: boolean
): Promise<{ merkleMap: MerkleMap; zkAppInstance: MerkleMapContract }> {
  let verificationKey: any | undefined;

  if (live) {
    ({ verificationKey } = await MerkleMapContract.compile());
    console.log('compiled');
  }

  const zkAppPrivateKey: PrivateKey = PrivateKey.random();
  const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();

  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  const merkleMap: MerkleMap = new MerkleMap();
  const pubKey: PublicKey = pk.toPublicKey();

  const deployTxnOptions = createTxOptions(pubKey, live);

  const deployTx: Mina.Transaction = await Mina.transaction(
    deployTxnOptions,
    () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
    }
  );

  await sendWaitTx(deployTx, pk);

  if (live) {
    await fetchAccount({ publicKey: zkAppAddress });
  }

  logStates(zkAppInstance, merkleMap);

  return { merkleMap: merkleMap, zkAppInstance: zkAppInstance };
}

async function sendWaitTx(tx: Mina.Transaction, pk: PrivateKey) {
  await tx.prove();
  tx.sign([pk]);

  let pendingTx = await tx.send();
  console.log(`Got pending transaction with hash ${pendingTx.hash()}`);

  // Wait until transaction is included in a block
  await pendingTx.wait();
  if (!pendingTx.isSuccess) {
    throw new Error();
  }
}

function createTxOptions(
  pubKey: PublicKey,
  live?: boolean,
  fee: number = 10_000_000
) {
  const txOptions: { sender: PublicKey; fee?: number } = {
    sender: pubKey,
  };
  if (live) {
    txOptions.fee = fee;
  }
  return txOptions;
}
