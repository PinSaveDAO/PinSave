import {
  createNft,
  generateDummyCollectionMap,
  generateDummyNftMetadata,
} from './components/Nft.js';
import {
  deployApp,
  initAppRoot,
  initNft,
  mintNftFromMap,
  setFee,
  startLocalBlockchainClient,
  transferNft,
} from './components/transactions.js';

const proofsEnabled = true;
const enforceTransactionLimits = true;

const live = false;
const displayLogs = false

const testAccounts = await startLocalBlockchainClient(
  proofsEnabled,
  enforceTransactionLimits
);

const { privateKey: pk1, publicKey: pubKey1 } = testAccounts[0];
const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[1];
const { publicKey: pubKey3 } = testAccounts[2];

const {
  merkleMap: map,
  zkAppInstance: zkAppInstance,
  zkAppPk: zkAppPrivateKey,
} = await deployApp(pk1, proofsEnabled, live);

const compile = false;

console.log('deployed app');

// add some initial values into the map

const { nftArray: nftArray } = generateDummyCollectionMap(pubKey1, map);

console.log('initing app root');

await initAppRoot(pk1, zkAppInstance, map, nftArray.length, live, displayLogs);

console.log('changing fee amount');

await setFee(zkAppPrivateKey, pk1, zkAppInstance);

console.log('set fee');

await mintNftFromMap(pk1, nftArray[0], zkAppInstance, map, compile, live, displayLogs);

console.log('minted NFT');

// init nft on the contract
const nft = generateDummyNftMetadata(3, pubKey1);
const nftStruct = createNft(nft);

await initNft(pubKey1, pk1, nftStruct, zkAppInstance, map, compile, live, displayLogs);

console.log('inited NFT');

try {
  await initNft(pubKey1, pk1, nftStruct, zkAppInstance, map, compile, live, displayLogs);
} catch {
  console.log('failed sucessfully to initialize NFT which already exists');
}

const nftNew = generateDummyNftMetadata(4, pubKey2);
const nftStructNew = createNft(nftNew);

await initNft(pubKey2, pk2, nftStructNew, zkAppInstance, map, compile, live, displayLogs);

console.log('inited NFT - 2 sucessfully');

await mintNftFromMap(pk1, nftStruct, zkAppInstance, map, compile, live, displayLogs);

console.log('mints sucessfully');

await mintNftFromMap(pk2, nftStructNew, zkAppInstance, map, live, displayLogs);

console.log('mints sucessfully');

await transferNft(
  pk1,
  pubKey2,
  nftStruct,
  zkAppInstance,
  map,
  zkAppPrivateKey,
  live, 
  displayLogs
);

console.log('transfered ownership sucessfully');

await transferNft(
  pk2,
  pubKey3,
  nftStructNew,
  zkAppInstance,
  map,
  zkAppPrivateKey,
  live,
  displayLogs
);

console.log('transfered ownership sucessfully');
