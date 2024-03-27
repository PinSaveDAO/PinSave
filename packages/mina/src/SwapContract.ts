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
} from 'o1js';

import { NFT } from './components/NFT/NFT.js';
import { MerkleMapContract } from './NFTsMapContract.js';

export class NFTmeta extends Struct({
  nft: NFT,
  owner: PublicKey,
  contract: PublicKey,
  ask: UInt64,
}) {
  changeOwner(newOwner: PublicKey) {
    this.owner = newOwner;
  }
  toFields(): Field[] {
    return NFTmeta.toFields(this);
  }
  hash(): Field {
    return Poseidon.hash(NFTmeta.toFields(this));
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
    'swapped-nft': Field,
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

  @method public initRoot(
    thisAppSignature: Signature,
    initSwapState: InitSwapState
  ): Bool {
    this.checkNotInitialized();
    super.init();
    thisAppSignature.verify(this.address, initSwapState.toFields());
    const { sender: sender } = this.verifySenderSignature();
    this.admin.set(sender);
    this.root.getAndRequireEquals();
    this.updateFee(initSwapState.feeAmount);
    this.updateRoot(initSwapState.initialRoot);
    return Bool(true);
  }

  @method public setFee(newFeeAmount: UInt64): Bool {
    this.checkInitialized();
    this.verifyAdminSignature();
    this.updateFee(newFeeAmount);
    return Bool(true);
  }

  @method public supplyNFT(
    item: NFTmeta,
    localKeyWitness: MerkleMapWitness,
    nftKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    adminSignature: Signature
  ): Bool {
    this.checkInitialized();
    this.verifyAdminItemSignature(item, localAdminSignature);
    this.verifyTreeLeafWithSender(item, localKeyWitness);
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

  @method public swap(
    item: NFTmeta,
    localKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature
  ) {
    this.checkInitialized();
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { senderUpdate, sender } = this.verifyTreeLeaf(item, localKeyWitness);
    senderUpdate.send({ to: this, amount: item.ask });
    item.changeOwner(sender);
    const [rootAfter] = localKeyWitness.computeRootAndKey(item.hash());
    this.updateRoot(rootAfter);
  }

  @method public withdrawNFT(
    item: NFTmeta,
    localKeyWitness: MerkleMapWitness,
    nftKeyWitness: MerkleMapWitness,
    localAdminSignature: Signature,
    adminSignature: Signature
  ): Bool {
    this.checkInitialized();
    this.verifyAdminItemSignature(item, localAdminSignature);
    const { sender: sender } = this.verifyTreeLeafWithSender(
      item,
      localKeyWitness
    );
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

  private verifyTreeLeaf(item: NFTmeta, keyWitness: MerkleMapWitness) {
    const { sender: sender, senderUpdate: senderUpdate } =
      this.verifySenderSignature();
    const initialRoot = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(item.hash());
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.nft.id);
    return { sender: sender, senderUpdate: senderUpdate };
  }

  private verifyTreeLeafWithSender(
    item: NFTmeta,
    keyWitness: MerkleMapWitness
  ) {
    const { sender: sender } = this.verifySenderSignature();
    sender.assertEquals(item.owner);
    const initialRoot = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(item.hash());
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.nft.id);
    return { sender: sender };
  }

  private verifyAdminSignature() {
    const admin = this.admin.getAndRequireEquals();
    const sender = this.sender;
    sender.assertEquals(admin);
    const senderUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  private verifyAdminItemSignature(item: NFTmeta, adminSignature: Signature) {
    const admin = this.admin.getAndRequireEquals();
    adminSignature.verify(admin, item.toFields());
  }

  private verifySenderSignature() {
    const sender = this.sender;
    const senderUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    return { senderUpdate: senderUpdate, sender: sender };
  }

  private checkInitialized() {
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertTrue();
  }

  private checkNotInitialized() {
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertFalse();
  }
}
