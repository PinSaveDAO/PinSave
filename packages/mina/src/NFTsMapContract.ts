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
  Provable,
} from 'o1js';

import { Nft } from './components/Nft.js';

export class MerkleMapContract extends SmartContract {
  // collection single tree root
  @state(Field) treeRoot = State<Field>();
  // amount minted
  @state(UInt64) totalSupply = State<UInt64>();
  // amount initialized
  @state(UInt64) totalInited = State<UInt64>();
  // fee for minting
  @state(UInt64) fee = State<UInt64>();
  // max amount
  @state(UInt64) maxSupply = State<UInt64>();

  deploy(args?: DeployArgs) {
    super.deploy(args);

    const permissionToEdit = Permissions.proof();

    this.account.permissions.set({
      ...Permissions.default(),
      access: permissionToEdit,
      editState: permissionToEdit,
      setTokenSymbol: permissionToEdit,
      send: permissionToEdit,
      receive: permissionToEdit,
    });
  }

  // test for other addresses
  // if we need to
  // add protection for admin with signature

  @method initRoot(
    _initialRoot: Field,
    _totalInited: UInt64,
    _feeAmount: UInt64,
    _maxSupply: UInt64
  ) {
    // ensures that we can only initialize once
    this.account.provedState.requireEquals(this.account.provedState.get());
    this.account.provedState.get().assertFalse();
    
    super.init()

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
    this.fee.getAndRequireEquals();
    adminSignature.verify(this.address, UInt64.toFields(amount)).assertTrue();
    this.fee.set(amount);
  }

  @method initNft(item: Nft, keyWitness: MerkleMapWitness) {
    const initedAmount = this.totalInited.getAndRequireEquals();
    const maxSupply = this.maxSupply.getAndRequireEquals();
    initedAmount.assertLessThanOrEqual(maxSupply);

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // checks the initial state is empty

    const [rootBefore, key] = keyWitness.computeRootAndKey(Field(0));

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    // ask for fee here

    // compute the root after incrementing
    const [rootAfter, _] = keyWitness.computeRootAndKey(
      Poseidon.hash(Nft.toFields(item))
    );

    // set the new root
    this.treeRoot.set(rootAfter);

    // update liquidity supply
    this.totalInited.set(initedAmount.add(1));
  }

  @method mintNft(item: Nft, keyWitness: MerkleMapWitness) {
    const initialRoot = this.treeRoot.getAndRequireEquals();

    // check the leaf state
    // should contain correct metadata

    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(Nft.toFields(item))
    );

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    this.token.mint({ address: item.owner, amount: UInt64.one });

    // update liquidity supply
    const liquidity = this.totalSupply.getAndRequireEquals();

    this.totalSupply.set(liquidity.add(1));
  }

  // we use nft struct to change an owner
  // we should ensure that the ownership is saved on the local db

  @method transfer(
    item: Nft,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ) {
    const itemFeldsArray = Nft.toFields(item);
    adminSignature.verify(this.address, Nft.toFields(item)).assertTrue();

    const sender = this.sender;
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // check the initial state matches what we expect
    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(itemFeldsArray)
    );

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    item.changeOwner(newOwner);

    // compute the root after incrementing
    const [rootAfter, _] = keyWitness.computeRootAndKey(
      Poseidon.hash(Nft.toFields(item))
    );

    this.treeRoot.set(rootAfter);

    this.token.send({ from: sender, to: newOwner, amount: UInt64.one });
  }
}
