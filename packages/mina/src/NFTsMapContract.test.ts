import {
  mintNFTWithMapAndLogs,
  initNFTWithLogs,
} from './components/localBlockchain/transactions.js';
import { startLocalBlockchainClient } from './components/utilities/client.js';
import {
  generateDummyCollectionMap,
  generateDummyNFTMetadata,
} from './components/NFT/dummy.js';
import { createNFT } from './components/NFT/NFT.js';
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

const { privateKey: pkAdmin, publicKey: pubKeyAdmin } = testAccounts[0];
const { privateKey: pk2, publicKey: pubKey2 } = testAccounts[1];
const { publicKey: pubKey3 } = testAccounts[2];

const {
  merkleMap: map,
  zkAppInstance: zkAppInstance,
  zkAppPk: zkAppPrivateKey,
} = await deployApp(pkAdmin, proofsEnabled, live, displayLogs);

const compile = false;

console.log('deployed app');

const { nftArray: nftArray } = generateDummyCollectionMap(pubKeyAdmin, map);

console.log('initing app root');

await initAppRoot(
  zkAppPrivateKey,
  pkAdmin,
  zkAppInstance,
  map,
  nftArray.length,
  live,
  displayLogs
);

try {
  await initAppRoot(
    zkAppPrivateKey,
    pkAdmin,
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

await setFee(pkAdmin, zkAppInstance);

console.log('set fee');

await mintNFTWithMapAndLogs(
  pkAdmin,
  pkAdmin,
  nftArray[0],
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('minted NFT');

const nft = generateDummyNFTMetadata(3, pubKeyAdmin);
const nftStruct = createNFT(nft);

await initNFTWithLogs(
  pkAdmin,
  pkAdmin,
  nftStruct,
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('inited NFT');

try {
  await initNFTWithLogs(
    pkAdmin,
    pkAdmin,
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

await initNFTWithLogs(
  pkAdmin,
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

  await initNFTWithLogs(
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

await mintNFTWithMapAndLogs(
  pkAdmin,
  pkAdmin,
  nftStruct,
  zkAppInstance,
  map,
  compile,
  live,
  displayLogs
);

console.log('mints sucessfully');

await mintNFTWithMapAndLogs(
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
  pkAdmin,
  pkAdmin,
  pubKey2,
  nftStruct,
  zkAppInstance,
  map,
  live,
  displayLogs
);

console.log('transfered ownership sucessfully');

await transferNFT(
  pkAdmin,
  pk2,
  pubKey3,
  nftStructNew,
  zkAppInstance,
  map,
  live,
  displayLogs
);

console.log('transfered ownership sucessfully');

logMinaBalance(zkAppInstance.address);
