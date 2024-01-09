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

import { MerkleMapContract, NFT } from '../NFTsMapContract.js';
import { logStates } from './AppState.js';
import { logTokenBalances } from './TokenBalances.js';
import { NFTtoHash } from './NFT.js';

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

export async function mintNFT(
  pubKey: PublicKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap
) {
  const nftId: Field = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  try {
    const mint_tx: Mina.Transaction = await Mina.transaction(pubKey, () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.mintNFT(_NFT, witnessNFT);
    });

    await mint_tx.prove();
    await mint_tx.sign([pk]).send();
  } catch (e) {
    const mint_tx: Mina.Transaction = await Mina.transaction(pubKey, () => {
      zkAppInstance.mintNFT(_NFT, witnessNFT);
    });

    await mint_tx.prove();
    await mint_tx.sign([pk]).send();
  }

  logTokenBalances(pubKey, zkAppInstance);
  logStates(zkAppInstance, merkleMap);
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

export async function initAppRoot(
  pubKey: PublicKey,
  pk: PrivateKey,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap
) {
  const rootBefore: Field = merkleMap.getRoot();
  const init_tx: Mina.Transaction = await Mina.transaction(pubKey, () => {
    zkAppInstance.initRoot(rootBefore);
  });

  await init_tx.prove();
  await init_tx.sign([pk]).send();

  logStates(zkAppInstance, merkleMap);
}

export async function deployApp(
  pk: PrivateKey,
  proofsEnabled: boolean,
  live?: boolean
): Promise<{ merkleMap: MerkleMap; zkAppInstance: MerkleMapContract }> {
  let verificationKey: any | undefined;

  if (proofsEnabled) {
    ({ verificationKey } = await MerkleMapContract.compile());
    console.log('compiled');
  }

  const zkAppPrivateKey: PrivateKey = PrivateKey.random();
  const zkAppAddress: PublicKey = zkAppPrivateKey.toPublicKey();

  const zkAppInstance: MerkleMapContract = new MerkleMapContract(zkAppAddress);
  const merkleMap: MerkleMap = new MerkleMap();
  const pubKey: PublicKey = pk.toPublicKey();

  const deployTxnOptions: { sender: PublicKey; fee?: number } = {
    sender: pubKey,
  };
  if (live) {
    deployTxnOptions.fee = 11_000_000;
  }

  const deployTx: Mina.Transaction = await Mina.transaction(
    deployTxnOptions,
    () => {
      AccountUpdate.fundNewAccount(pubKey);
      zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
    }
  );

  await deployTx.prove();
  deployTx.sign([pk]);

  let pendingTx = await deployTx.send();
  console.log(`Got pending transaction with hash ${pendingTx.hash()}`);

  // Wait until transaction is included in a block
  await pendingTx.wait();

  if (live) {
    await fetchAccount({ publicKey: zkAppAddress });
  }

  logStates(zkAppInstance, merkleMap);

  return { merkleMap: merkleMap, zkAppInstance: zkAppInstance };
}
