import { MerkleMap, PrivateKey } from 'o1js';

import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import { SwapContract } from '../src/SwapContract.js';
import { deploySwapApp } from '../src/components/transactionsSwap.js';

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

  const zkAppInstance: SwapContract = new SwapContract(
    zkAppPrivateKey.toPublicKey()
  );

  const compile: boolean = false;

  it('deploys app', async () => {
    deploySwapApp(pkAdmin, zkAppPrivateKey, proofsEnabled, live);
  });
});
