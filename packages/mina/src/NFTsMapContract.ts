import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Permissions,
  DeployArgs,
  MerkleMapWitness,
  Struct,
  PublicKey,
  Poseidon,
  UInt64,
  Signature,
} from 'o1js';

export class NFT extends Struct({
  name: Field,
  description: Field,
  id: Field,
  cid: Field,
  owner: PublicKey,
}) {
  changeOwner(newAddress: PublicKey) {
    this.owner = newAddress;
  }
}

export class MerkleMapContract extends SmartContract {
  // collection single tree root
  @state(Field) treeRoot = State<Field>();
  // amount minted
  @state(UInt64) totalSupply = State<UInt64>();
  // amount initialized
  // @state(UInt64) totalInited = State<UInt64>();
  // fee for minting
  @state(UInt64) fee = State<UInt64>();

  // optional max amount

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

  //
  // test for other addresses
  // if we need to
  // add protection for admin with signature
  //
  // also get the number of leaves passed
  // and store in totalInited
  @method initRoot(initialRoot: Field) {
    // ensures we can only initialize once
    this.treeRoot.requireEquals(Field.from(''));
    this.treeRoot.set(initialRoot);
  }

  @method setFee(amount: UInt64, adminSignature: Signature) {
    adminSignature.verify(this.address, amount.toFields()).assertTrue();
    this.fee.set(amount);
  }

  // inits nft
  // we do not change NFT to Field
  // because we want to ensure that sender inits to own account

  @method initNFT(item: NFT, keyWitness: MerkleMapWitness) {
    const sender = this.sender;
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // check the initial state matches what we expect
    // should be empty

    const [rootBefore, key] = keyWitness.computeRootAndKey(Field(0));

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    // compute the root after incrementing
    const [rootAfter, _] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );

    // set the new root
    this.treeRoot.set(rootAfter);

    /*     // update liquidity supply
    let initedAmount = this.totalInited.getAndRequireEquals();
    this.totalInited.set(initedAmount.add(1)); */
  }

  // mints nft
  // Unlike init expects the NFT metadata to be in place

  // change NFT to Field
  // so that anybody can sponsor mint
  @method mintNFT(item: NFT, keyWitness: MerkleMapWitness) {
    //const sender = this.sender;
    //sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // check the leaf state
    // should contain correct metadata

    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    this.token.mint({ address: item.owner, amount: UInt64.one });

    // update liquidity supply
    let liquidity = this.totalSupply.getAndRequireEquals();

    this.totalSupply.set(liquidity.add(1));
  }

  // we can also pass only a hash here
  // but we use struct to change an owner unlike in mint method
  // we should ensure that the ownership is saved on the local db

  @method transferOwner(
    item: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness
  ) {
    const sender = this.sender;
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndRequireEquals();

    // check the initial state matches what we expect
    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    item.changeOwner(newOwner);

    // compute the root after incrementing
    const [rootAfter, _] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );

    this.treeRoot.set(rootAfter);

    this.token.send({ from: sender, to: newOwner, amount: UInt64.one });
  }
}
