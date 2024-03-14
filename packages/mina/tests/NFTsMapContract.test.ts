import { MerkleMap, PrivateKey } from 'o1js';

import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import {
  generateDummyCollectionMap,
  generateDummyNFTMetadata,
} from '../src/components/NFT/dummy.js';
import { createNFT } from '../src/components/NFT/NFT.js';
import {
  deployApp,
  initRootWithApp,
  setFee,
  transferNFT,
  mintNFTwithMap,
  initNFT,
} from '../src/components/transactions.js';
import { MerkleMapContract } from '../src/NFTsMapContract.js';

const proofsEnabled = false;
const enforceTransactionLimits = true;

const live = false;

describe('SoulboundToken', () => {
  const testAccounts = startLocalBlockchainClient(
    proofsEnabled,
    enforceTransactionLimits
  );

  const { privateKey: pkAdmin, publicKey: pubKeyAdmin } = testAccounts[0];
  const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[1];
  const { publicKey: pubKey3 } = testAccounts[2];

  const map = new MerkleMap();
  const zkAppPrivateKey: PrivateKey = PrivateKey.random();

  const zkAppInstance: MerkleMapContract = new MerkleMapContract(
    zkAppPrivateKey.toPublicKey()
  );

  const { nftArray: nftArray } = generateDummyCollectionMap(pubKeyAdmin, map);

  const compile = false;

  it('deploys app', async () => {
    await deployApp(pkAdmin, zkAppPrivateKey, proofsEnabled, live);
  });

  it('init app root', async () => {
    await initRootWithApp(
      zkAppPrivateKey,
      pkAdmin,
      map,
      nftArray.length,
      compile,
      live
    );
  });

  it('failed sucessfully to initialize App root again which already exists', async () => {
    try {
      await initRootWithApp(
        zkAppPrivateKey,
        pkAdmin,
        map,
        nftArray.length,
        live
      );
    } catch (error) {
      expect(String(error)).toBe('Error: Bool.assertFalse(): true != false');
    }
  });

  it('failed sucessfully to initialize fee; not admin', async () => {
    try {
      await setFee(pk2, zkAppInstance);
    } catch (error) {
      expect(String(error).substring(0, 28)).toBe(
        'Error: Field.assertEquals():'
      );
    }
  });

  it('sucessfully initialized fee', async () => {
    await setFee(pkAdmin, zkAppInstance);
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

  it('failed sucessfully to initialize NFT which already exists', async () => {
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
      expect(String(error).substring(0, 28)).toBe(
        'Error: Field.assertEquals():'
      );
    }
  });

  it('inited NFT: not admin user', async () => {
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

  it('initializing nft fails successfully. Not correct nft id', async () => {
    const nftNew = generateDummyNFTMetadata(10, pubKey2);
    const nftStructNew = createNFT(nftNew);
    try {
      await initNFT(
        zkAppPrivateKey,
        pk2,
        nftStructNew,
        zkAppInstance,
        map,
        compile,
        live
      );
    } catch (error) {
      expect(String(error).substring(0, 28)).toBe(
        'Error: Field.assertEquals():'
      );
    }
  });

  it('transfer nft: from admin to new User', async () => {
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

  it('Mint and transfer nft: from user to new User', async () => {
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
});
