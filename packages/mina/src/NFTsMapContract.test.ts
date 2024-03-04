import {
  mintNFTFromMap,
  initNFT,
} from './components/localBlockchain/transactions.js';
import { startLocalBlockchainClient } from './components/utilities/client.js';
import {
  createNFT,
  generateDummyCollectionMap,
  generateDummyNFTMetadata,
} from './components/NFT.js';
import { logMinaBalance } from './components/TokenBalances.js';
import {
  deployApp,
  initAppRoot,
  setFee,
  transferNFT,
} from './components/transactions.js';

const displayLogs = true;

const proofsEnabled = false;
const enforceTransactionLimits = true;

const live = false;

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
} = await deployApp(pk1, proofsEnabled, live, displayLogs);

const compile = false;

console.log('deployed app');

const { nftArray: nftArray } = generateDummyCollectionMap(pubKey1, map);

console.log('initing app root');

await initAppRoot(
  zkAppPrivateKey,
  pk1,
  zkAppInstance,
  map,
  nftArray.length,
  live,
  displayLogs
);

try {
  await initAppRoot(
    zkAppPrivateKey,
    pk1,
    zkAppInstance,
    map,
    nftArray.length,
    live,
    displayLogs
  );
} catch {
  console.log(
    'failed sucessfully to initialize App root again which already exists'
  );
}

console.log('changing fee amount');

await setFee(pk1, zkAppInstance);

console.log('set fee');

await mintNFTFromMap(
  zkAppPrivateKey,
  pk1,
  nftArray[0],
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('minted NFT');

const nft = generateDummyNFTMetadata(3, pubKey1);
const nftStruct = createNFT(nft);

await initNFT(
  zkAppPrivateKey,
  pk1,
  nftStruct,
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('inited NFT');

try {
  await initNFT(
    zkAppPrivateKey,
    pk1,
    nftStruct,
    zkAppInstance,
    map,
    compile,
    live,
    displayLogs
  );
} catch {
  console.log('failed sucessfully to initialize NFT which already exists');
}

const nftNew = generateDummyNFTMetadata(4, pubKey2);
const nftStructNew = createNFT(nftNew);

await initNFT(
  zkAppPrivateKey,
  pk2,
  nftStructNew,
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('inited NFT - 2 sucessfully');

try {
  const nftNew = generateDummyNFTMetadata(10, pubKey2);
  const nftStructNew = createNFT(nftNew);

  await initNFT(
    zkAppPrivateKey,
    pk2,
    nftStructNew,
    zkAppInstance,
    map,
    compile,
    live,
    displayLogs
  );
} catch {
  console.log('fails successfully. Not correct nft id');
}

await mintNFTFromMap(
  zkAppPrivateKey,
  pk1,
  nftStruct,
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('mints sucessfully');

await mintNFTFromMap(
  zkAppPrivateKey,
  pk2,
  nftStructNew,
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('mints sucessfully');

await transferNFT(
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

await transferNFT(
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

logMinaBalance(zkAppInstance.address);
