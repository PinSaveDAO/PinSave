import { MerkleMap, PrivateKey } from 'o1js';

import { startLocalBlockchainClient } from '../src/components/utilities/client.js';
import { SwapContract } from '../src/SwapContract.js';
import {
  deploySwapContract,
  initSwapContractRoot,
  setSwapContractFee,
} from '../src/components/transactionsSwap.js';

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

  it('deploys swap contract', async () => {
    await deploySwapContract(pkAdmin, zkAppPrivateKey, proofsEnabled, live);
  });

  it('inits swap contract', async () => {
    await initSwapContractRoot(pkAdmin, pkSender, map, zkAppInstance, live);
  });

  it('fails to init app root: it already exists', async () => {
    try {
      await initSwapContractRoot(pkAdmin, pkSender, map, zkAppInstance, live);
    } catch (error) {
      const errorString = String(error);
      expect(errorString.substring(0, 23)).toBe('Error: root initialized');
    }
  });

  it('fails to initialize fee: not admin', async () => {
    try {
      await setSwapContractFee(pk2, zkAppInstance);
    } catch (error) {
      expect(String(error).substring(0, 23)).toBe('Error: sender not admin');
    }
  });

  it('sucessfully updated fee', async () => {
    await setSwapContractFee(pkAdmin, zkAppInstance);
  });
});
