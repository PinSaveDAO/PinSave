import { MerkleMap, PrivateKey, PublicKey } from 'o1js';

import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import { SwapContract } from '../src/SwapContract.js';
import {
  deploySwapContract,
  initSwapContractRoot,
  setSwapContractFee,
  supplyNFTMinaSwapContract,
} from '../src/components/transactionsSwap.js';
import {
  deployNFTContract,
  initNFTContractRoot,
} from '../src/components/transactions.js';
import { NFTContract } from '../src/NFTsMapContract.js';
import { generateDummyCollectionWithMap } from '../src/components/NFT/dummy.js';

const proofsEnabled: boolean = false;
const enforceTransactionLimits: boolean = true;

const live: boolean = false;

describe('PinSave NFTs on Local Blockchain', () => {
  const testAccounts = startLocalBlockchainClient(
    proofsEnabled,
    enforceTransactionLimits
  );

  const { privateKey: pkSwapAdmin, publicKey: pubSwapAdmin } = testAccounts[0];
  const { privateKey: pkNFTAdmin, publicKey: pubNFTAdmin } = testAccounts[1];
  const { privateKey: pkSender, publicKey: senderPub } = testAccounts[2];
  const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[3];

  const swapContractMap: MerkleMap = new MerkleMap();

  const swapContractPrivateKey: PrivateKey = PrivateKey.random();
  const swapContractPublicKey: PublicKey = swapContractPrivateKey.toPublicKey();
  const swapContract: SwapContract = new SwapContract(swapContractPublicKey);

  const nftContractPrivateKey: PrivateKey = PrivateKey.random();
  const nftContractPub: PublicKey = nftContractPrivateKey.toPublicKey();
  const nftContract: NFTContract = new NFTContract(nftContractPub);

  const { nftArray: nftArray, map: nftContractMap } =
    generateDummyCollectionWithMap(pubNFTAdmin);

  it('deploys nft contract', async () => {
    await deployNFTContract(pkNFTAdmin, nftContractPrivateKey);
    await initNFTContractRoot(
      pkNFTAdmin,
      pkNFTAdmin,
      nftContractMap,
      nftContract,
      nftArray.length
    );
  });

  it('deploys swap contract', async () => {
    await deploySwapContract(
      pkSwapAdmin,
      swapContractPrivateKey,
      proofsEnabled,
      live
    );
  });

  it('inits swap contract', async () => {
    await initSwapContractRoot(
      pkSwapAdmin,
      pkSender,
      swapContractMap,
      swapContract,
      live
    );
  });

  it('fails to init app root: it already exists', async () => {
    try {
      await initSwapContractRoot(
        pkSwapAdmin,
        pkSender,
        swapContractMap,
        swapContract,
        live
      );
    } catch (error) {
      const errorString = String(error);
      expect(errorString.substring(0, 23)).toBe('Error: root initialized');
    }
  });

  it('fails to initialize fee: not admin', async () => {
    try {
      await setSwapContractFee(pk2, swapContract);
    } catch (error) {
      expect(String(error).substring(0, 23)).toBe('Error: sender not admin');
    }
  });

  it('updated fee', async () => {
    await setSwapContractFee(pkSwapAdmin, swapContract);
  });

  it('supplies nft for mina', async () => {
    //await supplyNFTMinaSwapContract(pkNFTAdmin, )
  });
});
