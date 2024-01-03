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
  @state(UInt64) totalSupply = State<UInt64>();

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
    const sender = this.sender;
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndAssertEquals();

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
  // should be separate from init?
  // can mint alone? check for root
  @method mintNFT(item: NFT, keyWitness: MerkleMapWitness) {
    const sender = this.sender;
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndAssertEquals();

    // check the initial state matches what we expect
    // should be empty

    const [rootBefore, key] = keyWitness.computeRootAndKey(
      Poseidon.hash(NFT.toFields(item))
    );

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(item.id);

    this.token.mint({ address: sender, amount: UInt64.one });

    // update liquidity supply
    let liquidity = this.totalSupply.getAndAssertEquals();

    this.totalSupply.set(liquidity.add(1));
  }

  @method transferOwner(
    item: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness
  ) {
    const sender = this.sender;
    sender.assertEquals(item.owner);

    const initialRoot = this.treeRoot.getAndAssertEquals();

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
