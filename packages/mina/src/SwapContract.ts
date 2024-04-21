import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Permissions,
  DeployArgs,
  MerkleMapWitness,
  PublicKey,
  UInt64,
  Bool,
  AccountUpdate,
  Signature,
  MerkleMap,
} from 'o1js';

import { NFTforMina, NFTforNFT } from './components/Swap/BidNFT.js';
import { InitSwapState } from './components/Swap/InitSwap.js';
import {
  NFTforMinaOrder,
  NFTforNFTOrder,
} from './components/Swap/SupplyNFT.js';
import { NFTContract } from './NFTsMapContract.js';

export class SwapContract extends SmartContract {
  events = {
    'sold-nft': Field,
    'supplied-nft': Field,
    'updated-fee': UInt64,
    'updated-root': Field,
    'updated-total-orders-inited': Field,
    'withdrawn-nft': Field,
  };
  @state(PublicKey) admin = State<PublicKey>();
  @state(Field) root = State<Field>();
  @state(Field) totalOrdersInited = State<Field>();
  @state(UInt64) fee = State<UInt64>();

  deploy(args?: DeployArgs) {
    super.deploy(args);
    const permissionToEdit = Permissions.proof();
    this.account.permissions.set({
      ...Permissions.default(),
      editState: permissionToEdit,
      setTokenSymbol: permissionToEdit,
      setZkappUri: permissionToEdit,
    });
  }

  init() {
    super.init();
    const { sender: sender } = this.verifySenderSignature();
    this.admin.set(sender);
    const emptyMerkleMapRoot: Field = new MerkleMap().getRoot();
    this.root.set(emptyMerkleMapRoot);
  }

  @method public initRoot(
    initSwapState: InitSwapState,
    swapContractAdminSignature: Signature
  ): Bool {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    swapContractAdminSignature.verify(admin, initSwapState.toFields());

    const root: Field = this.root.getAndRequireEquals();
    const emptyMerkleMapRoot: Field = new MerkleMap().getRoot();
    root.assertEquals(emptyMerkleMapRoot, 'root: already initialized');

    this.updateFee(initSwapState.feeAmount);
    this.updateRoot(initSwapState.initialRoot);
    this.initTotalOrdersInited(initSwapState.initialOrdersAmount);
    return Bool(true);
  }

  @method public setFee(newFeeAmount: UInt64): Bool {
    this.verifyAdminSignature();
    this.updateFee(newFeeAmount);
    return Bool(true);
  }

  @method public supplyNFTforMina(supplyNFT: NFTforMinaOrder): Field {
    const nftOrderHash: Field = this.supplyNFT(supplyNFT);
    return nftOrderHash;
  }

  @method public supplyNFTforNFT(supplyNFT: NFTforNFTOrder): Field {
    const nftOrderHash: Field = this.supplyNFT(supplyNFT);
    return nftOrderHash;
  }

  @method public buyNFT(
    merkleMapId: Field,
    nftOrder: NFTforMina,
    swapContractKeyWitness: MerkleMapWitness,
    swapContractAdminSignature: Signature
  ): Field {
    const { sender, senderUpdate } = this.verifySenderSignature();
    this.verifyAdminSignatureNFTSaleStruct(
      nftOrder,
      swapContractAdminSignature
    );

    this.verifyTreeLeaf(merkleMapId, nftOrder, swapContractKeyWitness);
    nftOrder.isCompleted.assertFalse('nftOrder: already completed');

    const feeAmount: UInt64 = this.fee.getAndRequireEquals();
    senderUpdate.send({ to: this.address, amount: feeAmount });
    senderUpdate.send({ to: sender, amount: nftOrder.askAmount });

    nftOrder.changeOwner(sender);
    nftOrder.completeTransaction();

    const nftOrderHash: Field = nftOrder.hash();
    const [rootAfter] = swapContractKeyWitness.computeRootAndKey(nftOrderHash);

    this.updateRoot(rootAfter);
    this.emitEvent('sold-nft', nftOrderHash);
    return nftOrderHash;
  }

  @method public swapNFT(nftOrderData: NFTforNFTOrder): Field {
    const nftOrder: NFTforNFT = nftOrderData.nftOrder;
    const { sender } = this.verifySenderSignature();
    this.verifyAdminSignatureNFTSaleStruct(
      nftOrder,
      nftOrderData.swapContractNFTOrderAdminSignature
    );

    this.verifyTreeLeaf(
      nftOrderData.merkleMapId,
      nftOrder,
      nftOrderData.swapContractNFTOrderKeyWitness
    );

    const contract: NFTContract = new NFTContract(nftOrder.nftContractAddress);
    const NFTresponse: Bool = contract.transferNFT(
      nftOrder.nft,
      nftOrder.owner,
      nftOrderData.nftContractKeyWitness,
      nftOrderData.nftContractNFTAdminSignature
    );
    NFTresponse.assertTrue('nft: not transferred');

    nftOrder.isCompleted.assertFalse('nftOrder: already completed');
    nftOrder.changeOwner(sender);
    nftOrder.completeTransaction();

    const nftOrderHash: Field = nftOrder.hash();
    const [rootAfter] =
      nftOrderData.swapContractNFTOrderKeyWitness.computeRootAndKey(
        nftOrderHash
      );

    this.updateRoot(rootAfter);
    this.emitEvent('sold-nft', nftOrderHash);
    return nftOrderHash;
  }

  @method public withdrawNFTMina(nftOrder: NFTforMinaOrder): Field {
    const nftOrderHash: Field = this.withdrawNFT(nftOrder);
    return nftOrderHash;
  }

  @method public withdrawNFTforNFT(nftOrder: NFTforNFTOrder): Field {
    const nftOrderHash: Field = this.withdrawNFT(nftOrder);
    return nftOrderHash;
  }

  private supplyNFT(supplyNFT: NFTforMinaOrder | NFTforNFTOrder): Field {
    this.verifyAdminSignatureNFTSaleStruct(
      supplyNFT.nftOrder,
      supplyNFT.swapContractNFTOrderAdminSignature
    );
    this.verifyEmptyTreeLeaf(
      supplyNFT.merkleMapId,
      supplyNFT.nftOrder,
      supplyNFT.swapContractNFTOrderKeyWitness
    );

    const nftContract: NFTContract = new NFTContract(
      supplyNFT.nftOrder.nftContractAddress
    );
    const NFTresponse: Bool = nftContract.transferNFT(
      supplyNFT.nftOrder.nft,
      this.address,
      supplyNFT.nftContractKeyWitness,
      supplyNFT.nftContractNFTAdminSignature
    );
    NFTresponse.assertTrue('nft: not transferred');
    supplyNFT.nftOrder.nft.changeOwner(this.address);

    const nftOrderHash: Field = supplyNFT.nftOrder.hash();
    const [rootAfter] =
      supplyNFT.swapContractNFTOrderKeyWitness.computeRootAndKey(nftOrderHash);

    this.emitEvent('supplied-nft', nftOrderHash);
    this.incrementTotalOrdersInited();
    this.updateRoot(rootAfter);
    return nftOrderHash;
  }

  private withdrawNFT(nftOrderData: NFTforMinaOrder | NFTforNFTOrder): Field {
    const nftOrder: NFTforNFT | NFTforMina = nftOrderData.nftOrder;
    const { sender } = this.verifySenderSignature();
    this.verifyAdminSignatureNFTSaleStruct(
      nftOrder,
      nftOrderData.swapContractNFTOrderAdminSignature
    );
    this.verifyTreeLeaf(
      nftOrderData.merkleMapId,
      nftOrder,
      nftOrderData.swapContractNFTOrderKeyWitness
    );

    const nftContract: NFTContract = new NFTContract(
      nftOrder.nftContractAddress
    );
    const NFTresponse: Bool = nftContract.transferNFT(
      nftOrder.nft,
      sender,
      nftOrderData.nftContractKeyWitness,
      nftOrderData.nftContractNFTAdminSignature
    );
    NFTresponse.assertTrue('nft: not transferred');
    nftOrder.nft.changeOwner(sender);

    const nftOrderHash: Field = nftOrder.hash();
    const [rootAfter] =
      nftOrderData.swapContractNFTOrderKeyWitness.computeRootAndKey(
        nftOrderHash
      );

    this.emitEvent('withdrawn-nft', nftOrderHash);
    this.updateRoot(rootAfter);
    return nftOrderHash;
  }

  private initTotalOrdersInited(amount: Field): void {
    this.totalOrdersInited.getAndRequireEquals();
    this.totalOrdersInited.set(amount);
    this.emitEvent('updated-total-orders-inited', amount);
  }

  private incrementTotalOrdersInited(): void {
    const totalOrdersInited: Field =
      this.totalOrdersInited.getAndRequireEquals();
    const totalOrdersInitedNew: Field = totalOrdersInited.add(1);
    this.totalOrdersInited.set(totalOrdersInitedNew);
    this.emitEvent('updated-total-orders-inited', totalOrdersInitedNew);
  }

  private updateFee(newFeeAmount: UInt64): void {
    this.fee.getAndRequireEquals();
    this.fee.set(newFeeAmount);
    this.emitEvent('updated-fee', newFeeAmount);
  }

  private updateRoot(newRoot: Field): void {
    this.root.set(newRoot);
    this.emitEvent('updated-root', newRoot);
  }

  private verifyEmptyTreeLeaf(
    merkleMapId: Field,
    nftOrder: NFTforMina | NFTforNFT,
    keyWitness: MerkleMapWitness
  ): void {
    const { sender } = this.verifySenderSignature();
    const isNFTOwner: Bool = sender.equals(nftOrder.owner);
    isNFTOwner.assertTrue('sender: not an nft owner');

    const initialRoot: Field = this.root.getAndRequireEquals();
    const totalOrdersInited: Field =
      this.totalOrdersInited.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(Field(0));
    rootBefore.assertEquals(initialRoot, 'roots: do not match');
    key.assertEquals(totalOrdersInited, 'key: not matches totalOrdersInited');
    key.assertEquals(merkleMapId, 'key: not matches merkleMapId');
  }

  private verifyTreeLeaf(
    merkleMapId: Field,
    nftOrder: NFTforMina | NFTforNFT,
    keyWitness: MerkleMapWitness
  ): void {
    const initialRoot: Field = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(nftOrder.hash());
    rootBefore.assertEquals(initialRoot, 'roots: do not match');
    key.assertEquals(merkleMapId, 'key: not matches merkle map id');
  }

  private verifyAdminSignature(): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    const sender: PublicKey = this.sender;
    const isAdmin: Bool = sender.equals(admin);
    isAdmin.assertTrue('sender: not an admin');
    const senderUpdate: AccountUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  private verifyAdminSignatureNFTSaleStruct(
    nftOrder: NFTforMina | NFTforNFT,
    adminSignature: Signature
  ): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    adminSignature.verify(admin, nftOrder.toFields());
  }

  private verifySenderSignature(): {
    senderUpdate: AccountUpdate;
    sender: PublicKey;
  } {
    const sender: PublicKey = this.sender;
    const senderUpdate: AccountUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    return { senderUpdate: senderUpdate, sender: sender };
  }
}
