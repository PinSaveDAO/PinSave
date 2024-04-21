import { MerkleMap, PrivateKey, PublicKey, UInt64 } from 'o1js';

import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import {
  generateDummyCollectionMap,
  generateDummyNFTMetadata,
} from '../src/components/NFT/dummy.js';
import { NFT, NFTMetadata, createNFT } from '../src/components/NFT/NFT.js';
import {
  deployNFTContract,
  initNFTContractRoot,
  initRootWithCompile,
  setNFTContractFee,
  transferNFT,
  mintNFTwithMap,
  initNFT,
} from '../src/components/transactions.js';
import { NFTContract } from '../src/NFTsMapContract.js';
import { getMinaBalance } from '../src/index.js';

const proofsEnabled: boolean = false;
const enforceTransactionLimits: boolean = true;

const live: boolean = false;

describe('PinSave NFTs on Local Blockchain', () => {
  const testAccounts = startLocalBlockchainClient(
    proofsEnabled,
    enforceTransactionLimits
  );

  const { privateKey: pkAdmin, publicKey: pubAdmin } = testAccounts[0];
  const { privateKey: pkSender, publicKey: pubSender } = testAccounts[1];
  const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[2];
  const { publicKey: pubKey3 } = testAccounts[3];

  const map: MerkleMap = new MerkleMap();

  const nftContractPrivateKey: PrivateKey = PrivateKey.random();
  const nftContractPub: PublicKey = nftContractPrivateKey.toPublicKey();
  const nftContract: NFTContract = new NFTContract(nftContractPub);

  const { nftArray: nftArray } = generateDummyCollectionMap(pubAdmin, map);

  const map256: MerkleMap = new MerkleMap();
  const { nftArray: nftArray256 } = generateDummyCollectionMap(
    pubAdmin,
    map256,
    256
  );

  const compile: boolean = false;

  it('deploys app', async () => {
    await deployNFTContract(
      pkAdmin,
      nftContractPrivateKey,
      proofsEnabled,
      live
    );
    expect(nftContract.admin.get().toBase58()).toBe(pubAdmin.toBase58());
    expect(nftContract.root.get().toString()).toBe(
      new MerkleMap().getRoot().toString()
    );
  });

  it('fails to init app root: over max supply', async () => {
    let errorMessage: string = '';
    try {
      await initNFTContractRoot(
        pkAdmin,
        pkSender,
        map256,
        nftContract,
        nftArray256.length,
        live
      );
    } catch (error) {
      errorMessage = String(error).substring(0, 24);
    }
    expect(errorMessage).toBe('Error: maxSupply reached');
  });

  it('inits app root', async () => {
    await initNFTContractRoot(
      pkAdmin,
      pkSender,
      map,
      nftContract,
      nftArray.length,
      live
    );
    expect(nftContract.root.get().toString()).toBe(map.getRoot().toString());
  });

  it('fails to init app root: it already exists', async () => {
    let errorMessage: string = '';
    try {
      await initRootWithCompile(
        pkAdmin,
        pkSender,
        map,
        nftContract,
        nftArray.length,
        compile,
        live
      );
    } catch (error) {
      errorMessage = String(error).substring(0, 24);
    }
    expect(errorMessage).toBe('Error: root: initialized');
  });

  it('updates fee', async () => {
    await setNFTContractFee(pkAdmin, nftContract);
    expect(nftContract.fee.get().toString()).toBe(UInt64.one.toString());
  });

  it('fails to update fee: not admin', async () => {
    try {
      await setNFTContractFee(pk2, nftContract);
    } catch (error) {
      const errorMessage: string = String(error).substring(0, 27);
      expect(errorMessage).toBe('Error: sender: not an admin');
    }
  });

  it('mints NFT', async () => {
    await mintNFTwithMap(
      pkAdmin,
      pkAdmin,
      nftArray[0],
      nftContract,
      map,
      compile,
      live
    );
  });

  it('fails to mint the same NFT ', async () => {
    try {
      await mintNFTwithMap(
        pkAdmin,
        pkAdmin,
        nftArray[0],
        nftContract,
        map,
        compile,
        live
      );
    } catch (error) {
      const errorMessage: string = String(error).substring(0, 26);
      expect(errorMessage).toBe('Error: nft: already minted');
    }
  });

  it('inits NFT', async () => {
    const nft: NFTMetadata = generateDummyNFTMetadata(3, pubAdmin);
    const nftStruct: NFT = createNFT(nft);

    await initNFT(pkAdmin, pkAdmin, nftStruct, nftContract, map, compile, live);
  });

  it('fails to initialize NFT: already exists', async () => {
    const nft: NFTMetadata = generateDummyNFTMetadata(3, pubAdmin);
    const nftStruct: NFT = createNFT(nft);

    try {
      await initNFT(
        pkAdmin,
        pkAdmin,
        nftStruct,
        nftContract,
        map,
        compile,
        live
      );
    } catch (error) {
      const errorMessage: string = String(error).substring(0, 26);
      expect(errorMessage).toBe('Error: roots: do not match');
    }
  });

  it('inits NFT', async () => {
    const balance: bigint = getMinaBalance(pubKey2);
    expect(balance).toEqual(1000000000000n);
    const nftNew: NFTMetadata = generateDummyNFTMetadata(4, pubKey2);
    const nftStructNew: NFT = createNFT(nftNew);

    await initNFT(pkAdmin, pk2, nftStructNew, nftContract, map, compile, live);
  });

  it('fails to init NFT: not correct nft id', async () => {
    const nftNew: NFTMetadata = generateDummyNFTMetadata(10, pubKey2);
    const nftStructNew: NFT = createNFT(nftNew);
    try {
      await initNFT(
        pkAdmin,
        pk2,
        nftStructNew,
        nftContract,
        map,
        compile,
        live
      );
    } catch (error) {
      const messageError = String(error).substring(0, 32);
      expect(messageError).toBe('Error: key: not matches order id');
    }
  });

  it('transfers nft: from admin to a new user', async () => {
    const nft: NFTMetadata = generateDummyNFTMetadata(3, pubAdmin);
    const nftStruct: NFT = createNFT(nft);
    await transferNFT(
      pkAdmin,
      pkAdmin,
      pubKey2,
      nftStruct,
      nftContract,
      map,
      live
    );
  });

  it('mints and transfers nft: from user to a new user', async () => {
    const nftNew: NFTMetadata = generateDummyNFTMetadata(4, pubKey2);
    const nftStruct: NFT = createNFT(nftNew);
    await mintNFTwithMap(
      pkAdmin,
      pk2,
      nftStruct,
      nftContract,
      map,
      compile,
      live
    );

    await transferNFT(pkAdmin, pk2, pubKey3, nftStruct, nftContract, map, live);
  });

  it('transfer fails: not nft owner', async () => {
    const nftNew: NFTMetadata = generateDummyNFTMetadata(4, pubKey3);
    const nftStruct: NFT = createNFT(nftNew);
    nftStruct.mint();

    try {
      await transferNFT(
        pkAdmin,
        pkAdmin,
        pubKey2,
        nftStruct,
        nftContract,
        map,
        live
      );
    } catch (error) {
      const messageError: string = String(error).substring(0, 31);
      expect(messageError).toBe('Error: sender: not an nft owner');
    }
  });
});
