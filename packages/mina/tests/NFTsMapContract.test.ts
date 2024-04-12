import { MerkleMap, PrivateKey, PublicKey } from 'o1js';

import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import {
  generateDummyCollectionMap,
  generateDummyNFTMetadata,
} from '../src/components/NFT/dummy.js';
import { NFT, NFTMetadata, createNFT } from '../src/components/NFT/NFT.js';
import {
  deployNFTContract,
  initAppRoot,
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

  const { privateKey: pkAdmin, publicKey: pubKeyAdmin } = testAccounts[0];
  const { privateKey: pkSender, publicKey: senderPub } = testAccounts[1];
  const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[2];
  const { publicKey: pubKey3 } = testAccounts[3];

  const map: MerkleMap = new MerkleMap();

  const nftContractPrivateKey: PrivateKey = PrivateKey.random();
  const nftContractPub: PublicKey = nftContractPrivateKey.toPublicKey();
  const nftContract: NFTContract = new NFTContract(nftContractPub);

  const { nftArray: nftArray } = generateDummyCollectionMap(pubKeyAdmin, map);

  const map256: MerkleMap = new MerkleMap();

  const { nftArray: nftArray256 } = generateDummyCollectionMap(
    pubKeyAdmin,
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
  });

  it('fails to init app root: over max supply', async () => {
    try {
      await initAppRoot(
        pkAdmin,
        pkSender,
        map256,
        nftContract,
        nftArray256.length,
        live
      );
    } catch (error) {
      const errorString: string = String(error);
      expect(errorString.substring(0, 25)).toBe('Error: max supply reached');
    }
  });

  it('inits app root', async () => {
    await initAppRoot(
      pkAdmin,
      pkSender,
      map,
      nftContract,
      nftArray.length,
      live
    );
  });

  it('fails to init app root: it already exists', async () => {
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
      const errorString: string = String(error);
      expect(errorString.substring(0, 23)).toBe('Error: root initialized');
    }
  });

  it('fails to update fee: not admin', async () => {
    try {
      await setNFTContractFee(pk2, nftContract);
    } catch (error) {
      const errorString: string = String(error);
      expect(errorString.substring(0, 23)).toBe('Error: sender not admin');
    }
  });

  it('sucessfully updated fee', async () => {
    await setNFTContractFee(pkAdmin, nftContract);
  });

  it('minted NFT', async () => {
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

  it('failed to mint the same NFT ', async () => {
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
      const errorMessage: string = String(error).substring(0, 21);
      expect(errorMessage).toBe('Error: Already Minted');
    }
  });

  it('inited NFT', async () => {
    const nft: NFTMetadata = generateDummyNFTMetadata(3, pubKeyAdmin);
    const nftStruct: NFT = createNFT(nft);

    await initNFT(pkAdmin, pkAdmin, nftStruct, nftContract, map, compile, live);
  });

  it('failed to initialize NFT: already exists', async () => {
    const nft: NFTMetadata = generateDummyNFTMetadata(3, pubKeyAdmin);
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
      const stringError: string = String(error);
      expect(stringError.substring(0, 26)).toBe('Error: does not match root');
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
      const stringError = String(error);
      expect(stringError.substring(0, 35)).toBe(
        'Error: keyWitness not matches order'
      );
    }
  });

  it('transfers nft: from admin to a new user', async () => {
    const nft: NFTMetadata = generateDummyNFTMetadata(3, pubKeyAdmin);
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

  it('transfer fails: not item owner', async () => {
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
      const messageError: string = String(error).substring(0, 28);
      expect(messageError).toBe('Error: sender not item owner');
    }
  });
});
