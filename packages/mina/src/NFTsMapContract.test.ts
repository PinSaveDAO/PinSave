import {
  createNft,
  generateDummyCollectionMap,
  generateDummyNftMetadata,
} from './components/NFT.js';
import {
  deployApp,
  initAppRoot,
  initNft,
  mintNftFromMap,
  startLocalBlockchainClient,
  transferNFT,
} from './components/transactions.js';

const proofsEnabled: boolean = false;
const enforceTransactionLimits: boolean = true;

const live: boolean = false;

const testAccounts = await startLocalBlockchainClient(
  proofsEnabled,
  enforceTransactionLimits
);

const { privateKey: pk1, publicKey: pubKey1 } = testAccounts[0];
const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[1];
const { privateKey: pk3, publicKey: pubKey3 } = testAccounts[2];

const { merkleMap: map, zkAppInstance: zkAppInstance } = await deployApp(
  pk1,
  proofsEnabled
);

console.log('deployed app');

// add some initial values into the map

const { nftArray: nftArray, nftMetadata: nftMetadata } =
  generateDummyCollectionMap(pubKey1, map);

await initAppRoot(pk1, zkAppInstance, map, live);

console.log('initialized root');

await mintNftFromMap(pk1, nftArray[0], zkAppInstance, map, live);

console.log('minted NFT');

// init nft on the contract
const nft = generateDummyNftMetadata(1, pubKey1);
const nftStruct = createNft(nft);

await initNft(pubKey1, pk1, nftStruct, zkAppInstance, map, live);

console.log('inited NFT');

try {
  await initNft(pubKey1, pk1, nftStruct, zkAppInstance, map, live);
} catch {
  console.log('failed sucessfully to initialize NFT which already exists');
}

const nftNew = generateDummyNftMetadata(2, pubKey2);
const nftStructNew = createNft(nftNew);

await initNft(pubKey2, pk2, nftStructNew, zkAppInstance, map, live);

console.log('inited NFT - 2 sucessfully');

await mintNftFromMap(pk1, nftStruct, zkAppInstance, map, live);

console.log('mints sucessfully');

await mintNftFromMap(pk2, nftStructNew, zkAppInstance, map, live);

console.log('mints sucessfully');

await transferNFT(pubKey1, pk1, pubKey2, pk2, nftStruct, zkAppInstance, map);

console.log('transfered ownership sucessfully');

await transferNFT(pubKey2, pk2, pubKey3, pk3, nftStructNew, zkAppInstance, map);

console.log('transfered ownership sucessfully');
