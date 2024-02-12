import {
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
  MerkleMap,
  MerkleMapWitness,
  Field,
  VerificationKey,
  UInt64,
  Signature,
} from 'o1js';
import dotenv from 'dotenv';

import { MerkleMapContract } from '../NFTsMapContract.js';
import { compareLogStates } from './AppState.js';
import { logTokenBalances, getTokenBalances } from './TokenBalances.js';
import { NFTtoHash, Nft } from './Nft.js';

export function getEnvAccount() {
  dotenv.config();
  const pk: PrivateKey = PrivateKey.fromBase58(
    process.env.deployerKey as string
  );
  const pubKey: PublicKey = pk.toPublicKey();
  return { pubKey: pubKey, pk: pk };
}

export function getAppDeployer() {
  const pubKeyString: string =
    'B62qqpPjKKgp8G2kuB82g9NEgfg85vmEAZ84to3FfyQeL4MuFm5Ybc9';
  const pubKey: PublicKey = PublicKey.fromBase58(pubKeyString);
  return pubKey;
}

export function getAppString() {
  const appPubString: string =
    'B62qmfcFo5LorqmpFVh5Cv4oXGRGjNctnr55JzaVqr5i5bGUYWa7bb2';
  return appPubString;
}

export function getAppPublic() {
  const appPubString = getAppString();
  const appPubKey: PublicKey = PublicKey.fromBase58(appPubString);
  return appPubKey;
}

export function getAppContract() {
  const zkAppAddress = getAppPublic();
  const zkApp: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  return zkApp;
}

export function startBerkeleyClient(
  endpoint: string = 'https://mina-berkeley-graphql.aurowallet.com/graphql'
) {
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

// improve further
export async function setFee(
  zkAppPrivateKey: PrivateKey,
  deployerPk: PrivateKey,
  contract: MerkleMapContract,
  fee: UInt64 = UInt64.from(1)
) {
  const deployerAddress: PublicKey = deployerPk.toPublicKey();
  const feeSignature: Signature = Signature.create(
    zkAppPrivateKey,
    fee.toFields()
  );

  const txn: Mina.Transaction = await Mina.transaction(deployerAddress, () => {
    contract.setFee(fee, feeSignature);
  });

  await sendWaitTx(txn, deployerPk, false);
}

export async function initNft(
  pubKey: PublicKey,
  pk: PrivateKey,
  _NFT: Nft,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  live: boolean = true
) {
  if (live) {
    await MerkleMapContract.compile();
  }

  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  const txOptions = createTxOptions(pubKey, live);

  const init_mint_tx: Mina.Transaction = await Mina.transaction(
    txOptions,
    () => {
      zkAppInstance.initNft(_NFT, witnessNFT);
    }
  );

  await sendWaitTx(init_mint_tx, pk, live);

  // the tx should execute before we set the map value
  merkleMap.set(nftId, NFTtoHash(_NFT));

  if (!live) {
    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function mintNftFromMap(
  pk: PrivateKey,
  _NFT: Nft,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  live = true
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  await mintNFT(pk, _NFT, zkAppInstance, witnessNFT, live);

  if (!live) {
    logTokenBalances(pubKey, zkAppInstance);
    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function mintNFT(
  pk: PrivateKey,
  _NFT: Nft,
  zkAppInstance: MerkleMapContract,
  merkleMapWitness: MerkleMapWitness,
  live = true
) {
  if (live) {
    await MerkleMapContract.compile();
  }
  const pubKey: PublicKey = pk.toPublicKey();
  const txOptions = createTxOptions(pubKey, live);

  const mint_tx = await createMintTx(
    pubKey,
    zkAppInstance,
    _NFT,
    merkleMapWitness,
    txOptions
  );

  await sendWaitTx(mint_tx, pk, live);
}

export async function createMintTx(
  pubKey: PublicKey,
  zkAppInstance: MerkleMapContract,
  _NFT: Nft,
  merkleMapWitness: MerkleMapWitness,
  txOptions: TxOptions
) {
  const recipientBalance = getTokenBalances(pubKey, zkAppInstance);
  let mint_tx: Mina.Transaction;

  if (recipientBalance > 0) {
    mint_tx = await Mina.transaction(txOptions, () => {
      zkAppInstance.mintNft(_NFT, merkleMapWitness);
    });
  } else {
    mint_tx = await Mina.transaction(txOptions, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.mintNft(_NFT, merkleMapWitness);
    });
  }
  return mint_tx;
}

export async function transferNft(
  pk: PrivateKey,
  recipient: PublicKey,
  _NFT: Nft,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  zkAppPrivateKey: PrivateKey,
  live: boolean = true
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  const transferSignature: Signature = Signature.create(
    zkAppPrivateKey,
    Nft.toFields(_NFT)
  );

  const recipientBalance = getTokenBalances(recipient, zkAppInstance);

  let nft_transfer_tx: Mina.Transaction;
  if (recipientBalance > 0) {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      zkAppInstance.transfer(_NFT, recipient, witnessNFT, transferSignature);
    });
  } else {
    nft_transfer_tx = await Mina.transaction(pubKey, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.transfer(_NFT, recipient, witnessNFT, transferSignature);
    });
  }

  await sendWaitTx(nft_transfer_tx, pk, live);

  _NFT.changeOwner(recipient);

  merkleMap.set(nftId, NFTtoHash(_NFT));

  if (!live) {
    logTokenBalances(pubKey, zkAppInstance);
    logTokenBalances(recipient, zkAppInstance);

    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function initRootWithApp(
  pk: PrivateKey,
  zkAppPub: PublicKey,
  merkleMap: MerkleMap,
  totalInited: number,
  live: boolean = true
) {
  if (live) {
    await MerkleMapContract.compile();
  }
  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppPub);
  await initAppRoot(pk, zkAppInstance, merkleMap, totalInited, live);
}

export async function initAppRoot(
  pk: PrivateKey,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  totalInited: number,
  live: boolean = true
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const rootBefore: Field = merkleMap.getRoot();
  const totalSupplied: UInt64 = UInt64.from(totalInited);

  const txOptions = createTxOptions(pubKey, live);

  const init_tx: Mina.Transaction = await Mina.transaction(txOptions, () => {
    zkAppInstance.initRoot(rootBefore, totalSupplied);
  });

  await sendWaitTx(init_tx, pk, live);

  if (!live) {
    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function deployApp(
  pk: PrivateKey,
  live: boolean = true
): Promise<{
  merkleMap: MerkleMap;
  zkAppInstance: MerkleMapContract;
  zkAppPk: PrivateKey;
}> {
  let verificationKey: VerificationKey | undefined;

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

  await sendWaitTx(deployTx, pk, live);

  compareLogStates(zkAppInstance, merkleMap);

  return {
    merkleMap: merkleMap,
    zkAppInstance: zkAppInstance,
    zkAppPk: zkAppPrivateKey,
  };
}

async function sendWaitTx(
  tx: Mina.Transaction,
  pk: PrivateKey,
  live: boolean = true
) {
  await tx.prove();
  tx.sign([pk]);

  let pendingTx = await tx.send();

  if (live) {
    console.log(`Got pending transaction with hash ${pendingTx.hash()}`);

    // Wait until transaction is included in a block
    await pendingTx.wait();
    if (!pendingTx.isSuccess) {
      throw new Error('tx not successful');
    }
  }
}

export function createTxOptions(
  pubKey: PublicKey,
  live: boolean = true,
  fee: number = 100_000_000
) {
  const txOptions: { sender: PublicKey; fee?: number } = {
    sender: pubKey,
  };
  if (live) {
    txOptions.fee = fee;
  }
  return txOptions;
}

export type TxOptions = {
  sender: PublicKey;
  fee?: number | undefined;
};
