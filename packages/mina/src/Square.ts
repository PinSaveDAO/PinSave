import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Permissions,
  DeployArgs,
  UInt64,
} from 'o1js';

export class Square extends SmartContract {
  @state(UInt64) totalAmountInCirculation = State<UInt64>();

  deploy(args: DeployArgs) {
    super.deploy(args);

    const permissionToEdit = Permissions.proof();
    //const permissionToEdit = Permissions.none();

    this.account.permissions.set({
      ...Permissions.default(),
      editState: permissionToEdit,
      setTokenSymbol: permissionToEdit,
      send: permissionToEdit,
      receive: permissionToEdit,
    });
    this.totalAmountInCirculation.set(UInt64.from(63));
  }

  @method update() {
    this.account.tokenSymbol.set('BLA');
    this.totalAmountInCirculation.set(UInt64.from(100));
  }
}
