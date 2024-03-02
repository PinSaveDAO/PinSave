import {
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
  MerkleMap,
  MerkleMapWitness,
  Field,
} from 'o1js';

import { MerkleMapContract } from '../../NFTsMapContract.js';
import { compareLogStates, getTreeRoot } from '../AppState.js';
import { NFT, NFTtoHash } from '../NFT.js';
import { logTokenBalances, getTokenBalances } from '../TokenBalances.js';
import { createTxOptions, sendWaitTx, TxOptions } from '../transactions.js';

export async function mintNFTFromMap(
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = false,
  displayLogs: boolean = false
) {
  const pubKey: PublicKey = pk.toPublicKey();
  const nftId: Field = _NFT.id;

  // ensure that local map matches on-chain
  if (displayLogs) {
    const match =
      merkleMap.getRoot().toString() ===
      (await getTreeRoot(zkAppInstance)).toString();
    console.log('it is a tree root state match', match);
  }

  const witnessNFT: MerkleMapWitness = merkleMap.getWitness(nftId);

  await mintNFT(pk, _NFT, zkAppInstance, witnessNFT, compile, live);

  if (displayLogs) {
    logTokenBalances(pubKey, zkAppInstance);
    compareLogStates(zkAppInstance, merkleMap);
  }
}

export async function mintNFT(
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMapWitness: MerkleMapWitness,
  compile: boolean = false,
  live = false
) {
  if (compile) {
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

  await sendWaitTx(mint_tx, [pk], live);
}

export async function createMintTx(
  pubKey: PublicKey,
  zkAppInstance: MerkleMapContract,
  _NFT: NFT,
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

export async function initNFT(
  pubKey: PublicKey,
  pk: PrivateKey,
  _NFT: NFT,
  zkAppInstance: MerkleMapContract,
  merkleMap: MerkleMap,
  compile: boolean = false,
  live: boolean = false,
  displayLogs: boolean = false
) {
  if (compile) {
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

  await sendWaitTx(init_mint_tx, [pk], live);

  // the tx should execute before we set the map value
  merkleMap.set(nftId, NFTtoHash(_NFT));

  if (displayLogs) {
    compareLogStates(zkAppInstance, merkleMap);
  }
}
