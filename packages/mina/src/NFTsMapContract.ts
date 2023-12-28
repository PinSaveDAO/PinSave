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
  @state(Field) treeRoot = State<Field>();

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

  @method initRoot(initialRoot: Field) {
    this.treeRoot.assertEquals(Field.from(''));
    this.treeRoot.set(initialRoot);
  }

  // inits nft collection at once
  @method initNFT(item: NFT, keyWitness: MerkleMapWitness) {
    const initialRoot = this.treeRoot.getAndAssertEquals();

    // check the owner
    const sender = this.sender;
    sender.assertEquals(item.owner);

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
  }

  // mints nft
  @method mintNFT(item: NFT, keyWitness: MerkleMapWitness) {
    const initialRoot = this.treeRoot.getAndAssertEquals();

    // check the owner
    const sender = this.sender;
    sender.assertEquals(item.owner);

    // check the initial state matches what we expect
    // should be empty

    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    //add transfer
  }

  @method transferOwner(
    item: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness
  ) {
    const initialRoot = this.treeRoot.getAndAssertEquals();

    // check the owner
    const sender = this.sender;
    sender.assertEquals(item.owner);

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

    // set the new root
    this.treeRoot.set(rootAfter);
  }
}
