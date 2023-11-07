import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Permissions,
  DeployArgs,
  MerkleMapWitness,
} from 'o1js';

export class MerkleMapContract extends SmartContract {
  @state(Field) mapRoot = State<Field>();
  @state(Field) treeRoot = State<Field>();

  deploy(args: DeployArgs) {
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
    this.mapRoot.set(initialRoot);
  }

  @method update(
    keyWitness: MerkleMapWitness,
    keyToChange: Field,
    valueBefore: Field,
    incrementAmount: Field
  ) {
    const initialRoot = this.mapRoot.getAndAssertEquals();

    // check the initial state matches what we expect
    const [rootBefore, key] = keyWitness.computeRootAndKey(valueBefore);

    rootBefore.assertEquals(initialRoot);
    key.assertEquals(keyToChange);

    // compute the root after incrementing
    const [rootAfter, _] = keyWitness.computeRootAndKey(
      valueBefore.add(incrementAmount)
    );

    // set the new root
    this.treeRoot.set(rootAfter);
  }
}
