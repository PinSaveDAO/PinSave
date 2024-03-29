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
import { MerkleMapContract } from './NFTsMapContract.js';

export class NFTforMina extends Struct({
  nft: NFT,
  owner: PublicKey,
  contract: PublicKey,
  askAmount: UInt64,
}) {
  changeOwner(newOwner: PublicKey) {
    this.owner = newOwner;
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
}) {
  changeOwner(newOwner: PublicKey) {
    this.owner = newOwner;
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

export class SwapContract extends SmartContract {
  events = {
    'update-merkle-root': Field,
    'update-fee': UInt64,
    'sold-nft': Field,
  };
  @state(Field) root = State<Field>();
  @state(UInt64) fee = State<UInt64>();
  @state(PublicKey) admin = State<PublicKey>();

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
    const emptyMerkleMapRoot = new MerkleMap().getRoot();
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

  @method public supplyNFTMina(
    item: NFTforMina,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, localAdminSignature);
    this.verifyTreeLeaf(item, localKeyWitness);
    const contract = new MerkleMapContract(item.contract);
    const itemIn = contract.transfer(
      item.nft,
      this.address,
      nftKeyWitness,
      adminSignature
    );
    item.nft.changeOwner(this.address);
    itemIn.hash().assertEquals(item.nft.hash());
    const [rootAfter] = localKeyWitness.computeRootAndKey(item.hash());
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public supplyNFTforNFT(
    item: NFTforNFT,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, localAdminSignature);
    this.verifyTreeLeaf(item, localKeyWitness);
    const contract = new MerkleMapContract(item.contract);
    const itemIn = contract.transfer(
      item.nft,
      this.address,
      nftKeyWitness,
      adminSignature
    );
    item.nft.changeOwner(this.address);
    itemIn.hash().assertEquals(item.nft.hash());
    const [rootAfter] = localKeyWitness.computeRootAndKey(item.hash());
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public buyNFT(
    item: NFTforMina,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { senderUpdate, sender } = this.verifyTreeLeaf(item, localKeyWitness);
    senderUpdate.send({ to: sender, amount: item.askAmount });
    item.changeOwner(sender);
    const itemHash = item.hash();
    const [rootAfter] = localKeyWitness.computeRootAndKey(itemHash);
    this.updateRoot(rootAfter);
    this.emitEvent('sold-nft', itemHash);
    return Bool(true);
  }

  @method public swapNFT(
    item: NFTforNFT,
    askedNFT: NFT,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { sender } = this.verifyTreeLeaf(item, localKeyWitness);
    const contract = new MerkleMapContract(item.contract);
    item.askNFTId.assertEquals(askedNFT.id);
    const itemIn = contract.transfer(
      askedNFT,
      item.owner,
      nftKeyWitness,
      adminSignature
    );
    itemIn.hash().assertEquals(askedNFT.hash());
    item.changeOwner(sender);
    const itemHash = item.hash();
    const [rootAfter] = localKeyWitness.computeRootAndKey(itemHash);
    this.updateRoot(rootAfter);
    this.emitEvent('sold-nft', itemHash);
    return Bool(true);
  }

  @method public withdrawNFTMina(
    item: NFTforMina,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { sender: sender } = this.verifyTreeLeaf(item, localKeyWitness);
    const contract = new MerkleMapContract(item.contract);
    const itemIn = contract.transfer(
      item.nft,
      sender,
      nftKeyWitness,
      adminSignature
    );
    item.nft.changeOwner(sender);
    itemIn.hash().assertEquals(item.nft.hash());
    const [rootAfter] = localKeyWitness.computeRootAndKey(item.hash());
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public withdrawNFTforNFT(
    item: NFTforNFT,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    nftKeyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { sender: sender } = this.verifyTreeLeaf(item, localKeyWitness);
    const contract = new MerkleMapContract(item.contract);
    const itemIn = contract.transfer(
      item.nft,
      sender,
      nftKeyWitness,
      adminSignature
    );
    item.nft.changeOwner(sender);
    itemIn.hash().assertEquals(item.nft.hash());
    const [rootAfter] = localKeyWitness.computeRootAndKey(item.hash());
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  private updateFee(newFeeAmount: UInt64) {
    this.fee.getAndRequireEquals();
    this.fee.set(newFeeAmount);
    this.emitEvent('update-fee', newFeeAmount);
  }

  private updateRoot(newRoot: Field) {
    this.root.set(newRoot);
    this.emitEvent('update-merkle-root', newRoot);
  }

  private verifyTreeLeaf(
    item: NFTforMina | NFTforNFT,
    keyWitness: MerkleMapWitness
  ) {
    const { sender: sender, senderUpdate: senderUpdate } =
      this.verifySenderSignature();
    sender.assertEquals(item.owner);
    const initialRoot = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(item.hash());
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.nft.id);
    return { sender: sender, senderUpdate: senderUpdate };
  }

  private verifyAdminSignature() {
    const admin = this.admin.getAndRequireEquals();
    const sender = this.sender;
    sender.assertEquals(admin);
    const senderUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  private verifyAdminItemSignature(
    item: NFTforMina | NFTforNFT,
    adminSignature: Signature
  ) {
    const admin = this.admin.getAndRequireEquals();
    adminSignature.verify(admin, item.toFields());
  }

  private verifySenderSignature() {
    const sender = this.sender;
    const senderUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    return { senderUpdate: senderUpdate, sender: sender };
  }
}
