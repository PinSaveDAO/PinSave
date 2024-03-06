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
  Poseidon,
  UInt64,
  AccountUpdate,
} from 'o1js';

import { NFT } from './components/NFT/NFT.js';

export class MerkleMapContract extends SmartContract {
  // collection single tree root
  @state(Field) treeRoot = State<Field>();
  // amount minted
  @state(UInt64) totalSupply = State<UInt64>();
  // amount initialized
  @state(Field) totalInited = State<Field>();
  // fee for minting
  @state(UInt64) fee = State<UInt64>();
  // max amount
  @state(Field) maxSupply = State<Field>();

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

  @method initRoot(
    _initialRoot: Field,
    _totalInited: Field,
    _feeAmount: UInt64,
    _maxSupply: Field
  ) {
    this.checkNotInitialized();
    this.checkThisSignature();

    const sender = this.sender;
    const senderUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();

    this.admin.getAndRequireEquals();
    this.admin.set(sender);

    super.init();

    this.account.tokenSymbol.set('PINSAV');
    this.account.zkappUri.set('https://pinsave.app/uri.json');

    this.treeRoot.getAndRequireEquals();
    this.totalInited.getAndRequireEquals();
    this.fee.getAndRequireEquals();
    this.maxSupply.getAndRequireEquals();

    this.treeRoot.set(_initialRoot);
    this.totalInited.set(_totalInited);

    this.fee.set(_feeAmount);
    this.maxSupply.set(_maxSupply);
  }

  @method setFee(amount: UInt64) {
    this.checkInitialized();
    this.checkAdminSignature();

    this.fee.getAndRequireEquals();
    this.fee.set(amount);
  }

  @method initNFT(item: NFT, keyWitness: MerkleMapWitness) {
    this.checkInitialized();
    this.checkAdminSignature();
    const { senderUpdate: senderUpdate } = this.checkSenderSignature();

    const fee = this.fee.getAndRequireEquals();

    const initedAmount = this.totalInited.getAndRequireEquals();
    const maxSupply = this.maxSupply.getAndRequireEquals();
    initedAmount.assertLessThanOrEqual(maxSupply);

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // checks the initial leaf state is empty
    const [rootBefore, key] = keyWitness.computeRootAndKey(Field(0));

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);
    key.assertEquals(initedAmount);

    senderUpdate.send({ to: this, amount: fee });

    // compute the root after incrementing
    const [rootAfter, keyAfter] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );
    key.assertEquals(keyAfter);

    // set the new root
    this.treeRoot.set(rootAfter);

    // update liquidity supply
    this.totalInited.set(initedAmount.add(1));
  }

  @method mintNFT(item: NFT, keyWitness: MerkleMapWitness) {
    const { key: key } = this.verifyTreeLeaf(item, keyWitness);
    item.mint();
    // compute the root after incrementing
    const [rootAfter, keyAfter] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );
    key.assertEquals(keyAfter);
    this.treeRoot.set(rootAfter);
    this.token.mint({
      address: item.owner,
      amount: UInt64.from(1_000_000_000),
    });

    // update liquidity supply
    const liquidity = this.totalSupply.getAndRequireEquals();

    this.totalSupply.set(liquidity.add(1));
  }

  @method transfer(
    item: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness
  ) {
    const { key: key, sender: sender } = this.verifyTreeLeaf(item, keyWitness);
    item.changeOwner(newOwner);
    // compute the root after incrementing
    const [rootAfter, keyAfter] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );
    key.assertEquals(keyAfter);

    this.treeRoot.set(rootAfter);
    this.token.send({
      from: sender,
      to: newOwner,
      amount: UInt64.from(1_000_000_000),
    });
  }

  verifyTreeLeaf(item: NFT, keyWitness: MerkleMapWitness) {
    this.checkInitialized();
    this.checkAdminSignature();
    const { sender: sender } = this.checkSenderSignature();
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndRequireEquals();
    const itemFieldsArray = NFT.toFields(item);

    // check the initial state matches what we expect
    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(itemFieldsArray)
    );
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    return { key: key, sender: sender };
  }

  checkAdminSignature() {
    const admin = this.admin.getAndRequireEquals();
    const senderUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  checkThisSignature() {
    const address = this.address;
    const senderUpdate = AccountUpdate.create(address);
    senderUpdate.requireSignature();
  }

  checkInitialized() {
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertTrue();
  }

  checkNotInitialized() {
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertFalse();
  }

  checkSenderSignature() {
    const sender = this.sender;
    const senderUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    return { senderUpdate: senderUpdate, sender: sender };
  }
}
