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
  Signature,
  AccountUpdate,
} from 'o1js';

import { NFT } from './components/NFT.js';

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

  deploy(args?: DeployArgs) {
    super.deploy(args);

    const permissionToEdit = Permissions.proof();

    this.account.permissions.set({
      ...Permissions.default(),
      access: permissionToEdit,
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
    _maxSupply: Field,
    adminSignature: Signature
  ) {
    // ensures that we can only initialize once
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertFalse();

    adminSignature.verify(this.address, this.address.toFields()).assertTrue();

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

  @method setFee(amount: UInt64, adminSignature: Signature) {
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertTrue();

    adminSignature.verify(this.address, amount.toFields()).assertTrue();

    this.fee.getAndRequireEquals();
    this.fee.set(amount);
  }

  @method initNft(item: NFT, keyWitness: MerkleMapWitness) {
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

    // ask for fee here
    const senderUpdate = AccountUpdate.create(this.sender);
    senderUpdate.requireSignature();
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

  @method mintNft(item: NFT, keyWitness: MerkleMapWitness) {
    const initialRoot = this.treeRoot.getAndRequireEquals();

    item.owner.assertEquals(this.sender);

    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    let senderUpdate = AccountUpdate.create(this.sender);
    senderUpdate.requireSignature();
    this.token.mint({
      address: item.owner,
      amount: UInt64.from(1_000_000_000),
    });

    // update liquidity supply
    const liquidity = this.totalSupply.getAndRequireEquals();

    this.totalSupply.set(liquidity.add(1));
  }

  // we use nft struct to change an owner
  // we should ensure that the ownership is saved on the local db

  @method transfer(
    item: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ) {
    const itemFeldsArray = NFT.toFields(item);
    adminSignature.verify(this.address, NFT.toFields(item)).assertTrue();

    const sender = this.sender;
    sender.assertEquals(item.owner);

    let senderUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // check the initial state matches what we expect
    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(itemFeldsArray)
    );
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

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
}
