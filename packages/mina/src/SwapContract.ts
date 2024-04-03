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
  Struct,
  Poseidon,
  MerkleMap,
} from 'o1js';

import { NFT } from './components/NFT/NFT.js';
import { NFTContract } from './NFTsMapContract.js';

export class NFTforMina extends Struct({
  nft: NFT,
  owner: PublicKey,
  contract: PublicKey,
  askAmount: UInt64,
  isCompleted: Bool,
}) {
  changeOwner(newOwner: PublicKey) {
    this.owner = newOwner;
  }
  complete() {
    this.isCompleted = Bool(true);
  }
  toFields(): Field[] {
    return NFTforMina.toFields(this);
  }
  hash(): Field {
    return Poseidon.hash(NFTforMina.toFields(this));
  }
}

export class NFTforNFT extends Struct({
  nft: NFT,
  owner: PublicKey,
  contract: PublicKey,
  askNFTId: Field,
  isCompleted: Bool,
}) {
  changeOwner(newOwner: PublicKey) {
    this.owner = newOwner;
  }
  complete() {
    this.isCompleted = Bool(true);
  }
  toFields(): Field[] {
    return NFTforNFT.toFields(this);
  }
  hash(): Field {
    return Poseidon.hash(NFTforNFT.toFields(this));
  }
}

export class InitSwapState extends Struct({
  initialRoot: Field,
  feeAmount: UInt64,
}) {
  toFields(): Field[] {
    return InitSwapState.toFields(this);
  }
}

export class supplyNFTforMina extends Struct({
  item: NFTforMina,
  localKeyWitness: MerkleMapWitness,
  localAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  adminSignature: Signature,
}) {}

export class supplyNFTforNFT extends Struct({
  item: NFTforNFT,
  localKeyWitness: MerkleMapWitness,
  localAdminSignature: Signature,
  nftKeyWitness: MerkleMapWitness,
  adminSignature: Signature,
}) {}

export class SwapContract extends SmartContract {
  events = {
    'updated-merkle-root': Field,
    'updated-fee': UInt64,
    'supplied-nft': Field,
    'sold-nft': Field,
    'withdrawn-nft': Field,
  };
  @state(PublicKey) admin = State<PublicKey>();
  @state(Field) root = State<Field>();
  @state(UInt64) fee = State<UInt64>();

  deploy(args?: DeployArgs) {
    super.deploy(args);
    const permissionToEdit = Permissions.proof();
    this.account.permissions.set({
      ...Permissions.default(),
      editState: permissionToEdit,
      setTokenSymbol: permissionToEdit,
      setZkappUri: permissionToEdit,
      send: permissionToEdit,
      receive: permissionToEdit,
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
    thisAppSignature: Signature,
    initSwapState: InitSwapState
  ): Bool {
    thisAppSignature.verify(this.address, initSwapState.toFields());
    this.root.getAndRequireEquals();
    this.updateFee(initSwapState.feeAmount);
    this.updateRoot(initSwapState.initialRoot);
    return Bool(true);
  }

  @method public setFee(newFeeAmount: UInt64): Bool {
    this.verifyAdminSignature();
    this.updateFee(newFeeAmount);
    return Bool(true);
  }

  @method public supplyNFTMina(supplyNFT: supplyNFTforMina): Field {
    const itemHash: Field = this.supplyNFT(supplyNFT);
    return itemHash;
  }

  @method public supplyNFTforNFT(supplyNFT: supplyNFTforNFT): Field {
    const itemHash: Field = this.supplyNFT(supplyNFT);
    return itemHash;
  }

  @method public buyNFT(
    item: NFTforMina,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature
  ): Field {
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { senderUpdate, sender } = this.verifyTreeLeaf(item, localKeyWitness);
    senderUpdate.send({ to: sender, amount: item.askAmount });
    item.isCompleted.assertFalse('order is already completed');
    item.changeOwner(sender);
    item.complete();
    const itemHash: Field = item.hash();
    const [rootAfter] = localKeyWitness.computeRootAndKey(itemHash);
    this.updateRoot(rootAfter);
    this.emitEvent('sold-nft', itemHash);
    return itemHash;
  }

  @method public swapNFT(
    item: NFTforNFT,
    askedNFT: NFT,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Field {
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { sender } = this.verifyTreeLeaf(item, localKeyWitness);
    const contract: NFTContract = new NFTContract(item.contract);
    item.askNFTId.assertEquals(askedNFT.id, 'nft ids do not match');
    const NFTresponse: Bool = contract.transfer(
      askedNFT,
      item.owner,
      nftKeyWitness,
      adminSignature
    );
    NFTresponse.assertEquals(true, 'nfts not transferred');
    item.isCompleted.assertFalse('order is already completed');
    item.changeOwner(sender);
    item.complete();
    const itemHash: Field = item.hash();
    const [rootAfter] = localKeyWitness.computeRootAndKey(itemHash);
    this.updateRoot(rootAfter);
    this.emitEvent('sold-nft', itemHash);
    return itemHash;
  }

  @method public withdrawNFTMina(
    item: NFTforMina,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Field {
    const itemHash: Field = this.withdrawNFT(
      item,
      localKeyWitness,
      localAdminSignature,
      nftKeyWitness,
      adminSignature
    );
    return itemHash;
  }

  @method public withdrawNFTforNFT(
    item: NFTforNFT,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Field {
    const itemHash: Field = this.withdrawNFT(
      item,
      localKeyWitness,
      localAdminSignature,
      nftKeyWitness,
      adminSignature
    );
    return itemHash;
  }

  private supplyNFT(supplyNFT: supplyNFTforMina | supplyNFTforNFT): Field {
    this.verifyAdminItemSignature(
      supplyNFT.item,
      supplyNFT.localAdminSignature
    );
    this.verifyTreeLeaf(supplyNFT.item, supplyNFT.localKeyWitness);
    const contract: NFTContract = new NFTContract(supplyNFT.item.contract);
    const NFTresponse: Bool = contract.transfer(
      supplyNFT.item.nft,
      this.address,
      supplyNFT.nftKeyWitness,
      supplyNFT.adminSignature
    );
    NFTresponse.assertEquals(true, 'nfts not transferred');
    supplyNFT.item.nft.changeOwner(this.address);
    const itemHash: Field = supplyNFT.item.hash();
    const [rootAfter] = supplyNFT.localKeyWitness.computeRootAndKey(itemHash);
    this.updateRoot(rootAfter);
    this.emitEvent('supplied-nft', itemHash);
    return itemHash;
  }

  private withdrawNFT(
    item: NFTforNFT | NFTforMina,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Field {
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { sender: sender } = this.verifyTreeLeaf(item, localKeyWitness);
    const contract: NFTContract = new NFTContract(item.contract);
    const NFTresponse: Bool = contract.transfer(
      item.nft,
      sender,
      nftKeyWitness,
      adminSignature
    );
    NFTresponse.assertEquals(true, 'nfts not transferred');
    item.nft.changeOwner(sender);
    const itemHash: Field = item.hash();
    const [rootAfter] = localKeyWitness.computeRootAndKey(itemHash);
    this.updateRoot(rootAfter);
    this.emitEvent('withdrawn-nft', itemHash);
    return itemHash;
  }

  private updateFee(newFeeAmount: UInt64): void {
    this.fee.getAndRequireEquals();
    this.fee.set(newFeeAmount);
    this.emitEvent('updated-fee', newFeeAmount);
  }

  private updateRoot(newRoot: Field): void {
    this.root.set(newRoot);
    this.emitEvent('updated-merkle-root', newRoot);
  }

  private verifyTreeLeaf(
    item: NFTforMina | NFTforNFT,
    keyWitness: MerkleMapWitness
  ) {
    const { sender: sender, senderUpdate: senderUpdate } =
      this.verifySenderSignature();
    const isItemOwner: Bool = sender.equals(item.owner);
    isItemOwner.assertEquals(true, 'sender not item owner');
    const initialRoot: Field = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(item.hash());
    rootBefore.assertEquals(initialRoot, 'roots do not match');
    key.assertEquals(item.nft.id, 'nft id and key do not match');
    return { sender: sender, senderUpdate: senderUpdate };
  }

  private verifyAdminSignature(): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    const sender: PublicKey = this.sender;
    const isAdmin: Bool = sender.equals(admin);
    isAdmin.assertEquals(true, 'sender not admin');
    const senderUpdate: AccountUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  private verifyAdminItemSignature(
    item: NFTforMina | NFTforNFT,
    adminSignature: Signature
  ): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    adminSignature.verify(admin, item.toFields());
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
