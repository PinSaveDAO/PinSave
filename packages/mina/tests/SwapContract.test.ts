import {
  Field,
  MerkleMap,
  MerkleMapWitness,
  PrivateKey,
  PublicKey,
  UInt64,
  Signature,
} from 'o1js';

import { generateDummyCollectionWithMap } from '../src/components/NFT/dummy.js';
import { NFT } from '../src/components/NFT/NFT.js';
import { NFTforMina, createNFTforMina } from '../src/components/Swap/BidNFT.js';
import {
  NFTforMinaOrder,
  createNFTforMinaOrder,
  createNFTforNFTOrder,
} from '../src/components/Swap/SupplyNFT.js';
import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import {
  deployNFTContract,
  initNFTContractRoot,
  mintNFTwithMap,
} from '../src/components/transactions.js';
import {
  buyNFTSwapContract,
  deploySwapContract,
  initSwapContractRoot,
  setSwapContractFee,
  supplyNFTforMinaSwapContract,
  supplyNFTforNFTSwapContract,
} from '../src/components/transactionsSwap.js';
import { NFTContract } from '../src/NFTsMapContract.js';
import { SwapContract } from '../src/SwapContract.js';

const proofsEnabled: boolean = true;
const enforceTransactionLimits: boolean = true;

const live: boolean = false;

describe('PinSave Swap Contract on Local Blockchain', () => {
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

  let nftForMinaOrderData: NFTforMinaOrder;

  it('deploys nft contract', async () => {
    await deployNFTContract(pkNFTAdmin, nftContractPrivateKey);
    await initNFTContractRoot(
      pkNFTAdmin,
      pkNFTAdmin,
      nftContractMap,
      nftContract,
      nftArray.length
    );
    await mintNFTwithMap(
      pkNFTAdmin,
      pkNFTAdmin,
      nftArray[0],
      nftContract,
      nftContractMap
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
      expect(String(error).substring(0, 27)).toBe(
        'Error: sender: not an admin'
      );
    }
  });

  it('updates fee', async () => {
    await setSwapContractFee(pkSwapAdmin, swapContract);
  });

  it('supplies nft for mina', async () => {
    const totalOrdersInited: Field = swapContract.totalOrdersInited.get();

    const nft: NFT = nftArray[0];
    const askAmount: UInt64 = UInt64.from(100);
    const nftForMinaOrder = createNFTforMina(
      nft,
      pubNFTAdmin,
      nftContractPub,
      askAmount
    );

    const swapMerkleWitness: MerkleMapWitness =
      swapContractMap.getWitness(totalOrdersInited);

    const swapContractNFTOrderAdminSignature: Signature = Signature.create(
      pkSwapAdmin,
      nftForMinaOrder.toFields()
    );

    const nftKeyWitness: MerkleMapWitness = nftContractMap.getWitness(nft.id);
    const nftContractNFTAdminSignature: Signature = Signature.create(
      pkNFTAdmin,
      nft.toFields()
    );

    nftForMinaOrderData = createNFTforMinaOrder(
      totalOrdersInited,
      nftForMinaOrder,
      swapMerkleWitness,
      swapContractNFTOrderAdminSignature,
      nftKeyWitness,
      nftContractNFTAdminSignature
    );

    await supplyNFTforMinaSwapContract(
      pkNFTAdmin,
      nftForMinaOrderData,
      swapContract
    );

    nft.changeOwner(swapContractPublicKey);
    nftContractMap.set(nft.id, nft.hash());

    const nftContractRoot: Field = nftContract.root.get();
    expect(nftContractRoot.toString()).toBe(
      nftContractMap.getRoot().toString()
    );

    swapContractMap.set(totalOrdersInited, nftForMinaOrder.hash());

    const swapContractRoot: Field = swapContract.root.get();
    expect(swapContractRoot.toString()).toBe(
      swapContractMap.getRoot().toString()
    );
  });

  it('buy nft for mina', async () => {
    const swapMerkleWitness: MerkleMapWitness = swapContractMap.getWitness(
      nftForMinaOrderData.merkleMapId
    );

    const swapContractNFTOrderAdminSignature: Signature = Signature.create(
      pkSwapAdmin,
      nftForMinaOrderData.nftOrder.toFields()
    );

    await buyNFTSwapContract(
      pkSender,
      nftForMinaOrderData.merkleMapId,
      nftForMinaOrderData.nftOrder,
      swapMerkleWitness,
      swapContractNFTOrderAdminSignature,
      swapContract
    );
  });
});
