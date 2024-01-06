import {
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
  MerkleMap,
  MerkleMapWitness,
  Field,
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
  const nftId = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(Field(nftId));
  const init_mint_txn2 = await Mina.transaction(pubKey, () => {
    zkAppInstance.initNFT(_NFT, witnessNFT);
  });

  await init_mint_txn2.prove();
  await init_mint_txn2.sign([pk]).send();

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
  const nftId = _NFT.id;
  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(Field(nftId));

  const mint_txn = await Mina.transaction(pubKey, () => {
    AccountUpdate.fundNewAccount(pubKey);
    zkAppInstance.mintNFT(_NFT, witnessNFT);
  });

  await mint_txn.prove();
  await mint_txn.sign([pk]).send();

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
    const nft_transfer_txn2 = await Mina.transaction(pubKey, () => {
      AccountUpdate.fundNewAccount(recipient);
      zkAppInstance.transferOwner(_NFT, recipient, witnessNFT);
    });

    await nft_transfer_txn2.prove();
    await nft_transfer_txn2.sign([pk, recipientPk]).send();
  } catch (e) {
    const nft_transfer_txn2 = await Mina.transaction(pubKey, () => {
      zkAppInstance.transferOwner(_NFT, recipient, witnessNFT);
    });

    await nft_transfer_txn2.prove();
    await nft_transfer_txn2.sign([pk, recipientPk]).send();
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
  const rootBefore = merkleMap.getRoot();
  const init_txn = await Mina.transaction(pubKey, () => {
    zkAppInstance.initRoot(rootBefore);
  });

  await init_txn.prove();
  await init_txn.sign([pk]).send();

  logStates(zkAppInstance, merkleMap);
}

export async function deployApp(pk: PrivateKey, proofsEnabled: boolean) {
  let verificationKey: any;

  if (proofsEnabled) {
    ({ verificationKey } = await MerkleMapContract.compile());
    console.log('compiled');
  }

  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();

  const zkAppInstance = new MerkleMapContract(zkAppAddress);

  const merkleMap: MerkleMap = new MerkleMap();
  const pubKey = pk.toPublicKey();

  const deployTxn = await Mina.transaction(pubKey, () => {
    AccountUpdate.fundNewAccount(pubKey);
    zkAppInstance.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
  });

  await deployTxn.prove();
  await deployTxn.sign([pk]).send();

  logStates(zkAppInstance, merkleMap);

  return { merkleMap: merkleMap, zkAppInstance: zkAppInstance };
}
