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

  // optional max amount
  @state(UInt64) maxSupply = new UInt64('255');

  deploy(args?: DeployArgs) {
    super.deploy(args);

    const permissionToEdit = Permissions.proof();

    this.account.permissions.set({
      ...Permissions.default(),
      editState: permissionToEdit,
      setTokenSymbol: permissionToEdit,
      send: permissionToEdit,
      receive: permissionToEdit,
    });
  }

  // test for other addresses
  // if we need to
  // add protection for admin with signature

  @method initRoot(initialRoot: Field, totalInited: UInt64) {
    // ensures we can only initialize once
    this.treeRoot.requireEquals(Field.from(''));
    this.totalInited.requireEquals(UInt64.zero);

    this.treeRoot.set(initialRoot);
    this.totalInited.set(totalInited);
  }

  @method setFee(amount: UInt64, adminSignature: Signature) {
    adminSignature.verify(this.address, amount.toFields()).assertTrue();
    this.fee.set(amount);
  }

  // inits nft
  // we want to ensure that sender inits to own account

  @method initNFT(item: Nft, keyWitness: MerkleMapWitness) {
    let initedAmount = this.totalInited.getAndRequireEquals();
    initedAmount.assertLessThanOrEqual(this.maxSupply);

    const sender = this.sender;
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // check the initial state matches what we expect
    // should be empty

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

  // mints nft
  // Unlike init, expects metadata to be in place
  // anybody can sponsor mint

  @method mintNFT(item: Nft, keyWitness: MerkleMapWitness) {
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
    let liquidity = this.totalSupply.getAndRequireEquals();

    this.totalSupply.set(liquidity.add(1));
  }

  // we use nft struct to change an owner
  // we should ensure that the ownership is saved on the local db

  @method transferOwner(
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
