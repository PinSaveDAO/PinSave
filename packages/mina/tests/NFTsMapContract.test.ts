import { MerkleMap, PrivateKey } from 'o1js';

import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import {
  generateDummyCollectionMap,
  generateDummyNFTMetadata,
} from '../src/components/NFT/dummy.js';
import { createNFT } from '../src/components/NFT/NFT.js';
import {
  deployApp,
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
  const zkAppPrivateKey: PrivateKey = PrivateKey.random();

  const zkAppInstance: NFTContract = new NFTContract(
    zkAppPrivateKey.toPublicKey()
  );

  const { nftArray: nftArray } = generateDummyCollectionMap(pubKeyAdmin, map);

  const map256: MerkleMap = new MerkleMap();

  const { nftArray: nftArray256 } = generateDummyCollectionMap(
    pubKeyAdmin,
    map256,
    256
  );

  const compile: boolean = false;

  it('deploys app', async () => {
    await deployApp(pkAdmin, zkAppPrivateKey, proofsEnabled, live);
  });

  it('fails to init app root: over max supply', async () => {
    try {
      await initAppRoot(
        pkAdmin,
        pkSender,
        map256,
        zkAppInstance,
        nftArray256.length,
        live
      );
    } catch (error) {
      const errorString = String(error);
      expect(errorString.substring(0, 25)).toBe('Error: max supply reached');
    }
  });

  it('inits app root', async () => {
    await initAppRoot(
      pkAdmin,
      pkSender,
      map,
      zkAppInstance,
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
        zkAppInstance,
        nftArray.length,
        compile,
        live
      );
    } catch (error) {
      const errorString = String(error);
      expect(errorString.substring(0, 23)).toBe('Error: root initialized');
    }
  });

  it('fails to update fee: not admin', async () => {
    try {
      await setNFTContractFee(pk2, zkAppInstance);
    } catch (error) {
      expect(String(error).substring(0, 23)).toBe('Error: sender not admin');
    }
  });

  it('sucessfully updated fee', async () => {
    await setNFTContractFee(pkAdmin, zkAppInstance);
  });

  it('minted NFT', async () => {
    await mintNFTwithMap(
      pkAdmin,
      pkAdmin,
      nftArray[0],
      zkAppInstance,
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
        zkAppInstance,
        map,
        compile,
        live
      );
    } catch (error) {
      const data = String(error).substring(0, 21);
      expect(data).toBe('Error: Already Minted');
    }
  });

  it('inited NFT', async () => {
    const nft = generateDummyNFTMetadata(3, pubKeyAdmin);
    const nftStruct = createNFT(nft);

    await initNFT(
      pkAdmin,
      pkAdmin,
      nftStruct,
      zkAppInstance,
      map,
      compile,
      live
    );
  });

  it('failed to initialize NFT: already exists', async () => {
    const nft = generateDummyNFTMetadata(3, pubKeyAdmin);
    const nftStruct = createNFT(nft);

    try {
      await initNFT(
        pkAdmin,
        pkAdmin,
        nftStruct,
        zkAppInstance,
        map,
        compile,
        live
      );
    } catch (error) {
      const stringError = String(error);
      expect(stringError.substring(0, 26)).toBe('Error: does not match root');
    }
  });

  it('inits NFT', async () => {
    const balance = getMinaBalance(pubKey2);
    expect(balance).toEqual(1000000000000n);
    const nftNew = generateDummyNFTMetadata(4, pubKey2);
    const nftStructNew = createNFT(nftNew);

    await initNFT(
      pkAdmin,
      pk2,
      nftStructNew,
      zkAppInstance,
      map,
      compile,
      live
    );
  });

  it('fails to init NFT: not correct nft id', async () => {
    const nftNew = generateDummyNFTMetadata(10, pubKey2);
    const nftStructNew = createNFT(nftNew);
    try {
      await initNFT(
        pkAdmin,
        pk2,
        nftStructNew,
        zkAppInstance,
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
    const nft = generateDummyNFTMetadata(3, pubKeyAdmin);
    const nftStruct = createNFT(nft);
    await transferNFT(
      pkAdmin,
      pkAdmin,
      pubKey2,
      nftStruct,
      zkAppInstance,
      map,
      live
    );
  });

  it('mints and transfers nft: from user to a new user', async () => {
    const nftNew = generateDummyNFTMetadata(4, pubKey2);
    const nftStruct = createNFT(nftNew);
    await mintNFTwithMap(
      pkAdmin,
      pk2,
      nftStruct,
      zkAppInstance,
      map,
      compile,
      live
    );

    await transferNFT(
      pkAdmin,
      pk2,
      pubKey3,
      nftStruct,
      zkAppInstance,
      map,
      live
    );
  });

  it('transfer fails: not item owner', async () => {
    const nftNew = generateDummyNFTMetadata(4, pubKey3);
    const nftStruct = createNFT(nftNew);
    nftStruct.mint();

    try {
      await transferNFT(
        pkAdmin,
        pkAdmin,
        pubKey2,
        nftStruct,
        zkAppInstance,
        map,
        live
      );
    } catch (error) {
      const messageError = String(error).substring(0, 28);
      expect(messageError).toBe('Error: sender not item owner');
    }
  });
});
