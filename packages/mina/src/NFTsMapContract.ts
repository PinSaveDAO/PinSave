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
} from 'o1js';

import { NFT } from './components/NFT/NFT.js';

export class MerkleMapContract extends SmartContract {
  events = {
    'update-merkle-root': Field,
    'update-fee': UInt64,
    'update-total-supply': UInt64,
    'update-inited-amount': Field,
    'init-max-supply': Field,
  };
  @state(Field) root = State<Field>();
  @state(UInt64) totalSupply = State<UInt64>();
  @state(Field) totalInited = State<Field>();
  @state(Field) maxSupply = State<Field>();
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

    const { sender: sender } = this.checkSenderSignature();
    this.admin.set(sender);
  }

  @method public initRoot(
    _initialRoot: Field,
    _totalInited: Field,
    _feeAmount: UInt64,
    _maxSupply: Field
  ): void {
    this.checkNotInitialized();
    this.checkAdminSignature();

    super.init();

    this.account.tokenSymbol.set('PINSAV');
    this.account.zkappUri.set('https://pinsave.app/uri.json');

    this.root.getAndRequireEquals();

    this.initMaxSupply(_maxSupply);
    this.updateInitedAmount(_totalInited);
    this.updateFee(_feeAmount);
    this.updateRoot(_initialRoot);
  }

  @method public setFee(newFeeAmount: UInt64): Bool {
    this.checkInitialized();
    this.checkAdminSignature();
    this.updateFee(newFeeAmount);
    return Bool(true);
  }

  @method public initNFT(item: NFT, keyWitness: MerkleMapWitness): Bool {
    this.checkInitialized();
    this.checkAdminSignature();
    const { senderUpdate: senderUpdate } = this.checkSenderSignature();

    const initedAmount = this.totalInited.getAndRequireEquals();
    const maxSupply = this.maxSupply.getAndRequireEquals();
    initedAmount.assertLessThanOrEqual(maxSupply);

    const fee = this.fee.getAndRequireEquals();
    const initialRoot = this.root.getAndRequireEquals();

    const [rootBefore, key] = keyWitness.computeRootAndKey(Field(0));

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);
    key.assertEquals(initedAmount);

    senderUpdate.send({ to: this, amount: fee });

    const [rootAfter, keyAfter] = keyWitness.computeRootAndKey(item.hash());
    key.assertEquals(keyAfter);

    this.updateInitedAmount(Field(1));
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public mintNFT(item: NFT, keyWitness: MerkleMapWitness): Bool {
    const { key: key } = this.verifyTreeLeaf(item, keyWitness);
    item.mint();

    const [rootAfter, keyAfter] = keyWitness.computeRootAndKey(item.hash());
    key.assertEquals(keyAfter);

    this.token.mint({
      address: item.owner,
      amount: UInt64.from(1_000_000_000),
    });

    this.updateTotalSupply();
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public transfer(
    item: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness
  ): Bool {
    const { key: key, sender: sender } = this.verifyTreeLeaf(item, keyWitness);
    item.changeOwner(newOwner);

    const [rootAfter, keyAfter] = keyWitness.computeRootAndKey(item.hash());
    key.assertEquals(keyAfter);

    this.token.send({
      from: sender,
      to: newOwner,
      amount: UInt64.from(1_000_000_000),
    });
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  private initMaxSupply(_maxSupply: Field) {
    this.maxSupply.getAndRequireEquals();
    this.maxSupply.set(_maxSupply);
    this.emitEvent('init-max-supply', _maxSupply);
  }

  private updateInitedAmount(amount: Field) {
    const initedAmount = this.totalInited.getAndRequireEquals();
    const newTotalInited = initedAmount.add(amount);
    this.totalInited.set(newTotalInited);
    this.emitEvent('update-inited-amount', newTotalInited);
  }

  private updateTotalSupply() {
    const liquidity = this.totalSupply.getAndRequireEquals();
    const newTotalSypply = liquidity.add(1);
    this.totalSupply.set(newTotalSypply);
    this.emitEvent('update-total-supply', newTotalSypply);
  }

  private updateFee(newFeeAmount: UInt64) {
    this.fee.getAndRequireEquals();
    this.fee.set(newFeeAmount);
    this.emitEvent('update-fee', newFeeAmount);
  }

  private updateRoot(root: Field) {
    this.root.set(root);
    this.emitEvent('update-merkle-root', root);
  }

  private verifyTreeLeaf(item: NFT, keyWitness: MerkleMapWitness) {
    this.checkInitialized();
    this.checkAdminSignature();
    const { sender: sender } = this.checkSenderSignature();
    sender.assertEquals(item.owner);

    const initialRoot = this.root.getAndRequireEquals();

    const [rootBefore, key] = keyWitness.computeRootAndKey(item.hash());
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    return { key: key, sender: sender };
  }

  private checkAdminSignature() {
    const admin = this.admin.getAndRequireEquals();
    const senderUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  private checkInitialized() {
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertTrue();
  }

  private checkNotInitialized() {
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertFalse();
  }

  private checkSenderSignature() {
    const sender = this.sender;
    const senderUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    return { senderUpdate: senderUpdate, sender: sender };
  }
}
