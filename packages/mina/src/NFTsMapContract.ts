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
  Signature,
  MerkleMap,
} from 'o1js';

import { NFT } from './components/NFT/NFT.js';
import { InitState } from './components/NFT/InitState.js';

export class NFTContract extends SmartContract {
  events = {
    'updated-merkle-root': Field,
    'updated-fee': UInt64,
    'updated-total-supply': UInt64,
    'updated-inited-amount': Field,
    'inited-max-supply': Field,
    'inited-nft': Field,
    'minted-nft': Field,
    'transferred-nft': Field,
  };
  @state(PublicKey) admin = State<PublicKey>();
  @state(Field) root = State<Field>();
  @state(Field) totalInited = State<Field>();
  @state(Field) maxSupply = State<Field>();
  @state(UInt64) fee = State<UInt64>();
  @state(UInt64) totalSupply = State<UInt64>();

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

  init() {
    super.init();
    const { sender: sender } = this.verifySenderSignature();
    this.admin.set(sender);
    const emptyMerkleMapRoot: Field = new MerkleMap().getRoot();
    this.root.set(emptyMerkleMapRoot);
    this.account.tokenSymbol.set('PINSAV');
    this.account.zkappUri.set('https://pinsave.app/uri.json');
  }

  @method public initRoot(
    initState: InitState,
    adminSignature: Signature
  ): Bool {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    const isAdmin: Bool = adminSignature.verify(admin, initState.toFields());
    isAdmin.assertEquals(true, 'initState signature: not admin');
    const root: Field = this.root.getAndRequireEquals();
    const emptyMerkleMapRoot: Field = new MerkleMap().getRoot();
    root.assertEquals(emptyMerkleMapRoot, 'root initialized');
    const maxSupply: Field = this.maxSupply.getAndRequireEquals();
    maxSupply.assertEquals(0, 'max supply initialized');
    const initedAmount: Field = this.totalInited.getAndRequireEquals();
    initedAmount.assertEquals(0, 'initalized amount of nfts');
    this.initMaxSupply(initState.maxSupply);
    this.updateInitedAmount(Field(0), initState.totalInited);
    initState.maxSupply.assertGreaterThanOrEqual(
      initState.totalInited,
      'max supply reached'
    );
    this.updateFee(initState.feeAmount);
    this.updateRoot(initState.initialRoot);
    return Bool(true);
  }

  @method public setFee(newFeeAmount: UInt64): Bool {
    this.verifyAdminSignature();
    this.updateFee(newFeeAmount);
    return Bool(true);
  }

  @method public initNFT(
    item: NFT,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, adminSignature);
    const { senderUpdate: senderUpdate } = this.verifySenderSignature();
    const initedAmount: Field = this.totalInited.getAndRequireEquals();
    const maxSupply: Field = this.maxSupply.getAndRequireEquals();
    maxSupply.assertGreaterThan(initedAmount, 'maximum supply reached');
    const fee: UInt64 = this.fee.getAndRequireEquals();
    const initialRoot: Field = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(Field(0));
    rootBefore.assertEquals(initialRoot, 'does not match root');
    key.assertEquals(item.id, 'keyWitness not matches nft id');
    key.assertEquals(initedAmount, 'keyWitness not matches order');
    senderUpdate.send({ to: this, amount: fee });
    const itemHash: Field = item.hash();
    const [rootAfter] = keyWitness.computeRootAndKey(itemHash);
    this.emitEvent('inited-nft', itemHash);
    this.updateInitedAmount(initedAmount, 1);
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public mintNFT(
    item: NFT,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, adminSignature);
    this.verifyTreeLeaf(item, keyWitness);
    item.isMinted.assertEquals(0, 'Already Minted');
    item.mint();
    const [rootAfter] = keyWitness.computeRootAndKey(item.hash());
    this.token.mint({
      address: item.owner,
      amount: UInt64.from(1_000_000_000),
    });
    this.emitEvent('minted-nft', item.id);
    this.incrementTotalSupply();
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public transfer(
    item: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminItemSignature(item, adminSignature);
    const sender: PublicKey = this.verifyTreeLeaf(item, keyWitness);
    item.changeOwner(newOwner);
    const itemHash: Field = item.hash();
    const [rootAfter] = keyWitness.computeRootAndKey(itemHash);
    this.token.send({
      from: sender,
      to: newOwner,
      amount: UInt64.from(1_000_000_000),
    });
    this.emitEvent('transferred-nft', itemHash);
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  private initMaxSupply(_maxSupply: Field): void {
    this.maxSupply.set(_maxSupply);
    this.emitEvent('inited-max-supply', _maxSupply);
  }

  private updateInitedAmount(
    initedAmount: Field,
    dAmount: number | Field
  ): void {
    const newTotalInited: Field = initedAmount.add(dAmount);
    this.totalInited.set(newTotalInited);
    this.emitEvent('updated-inited-amount', newTotalInited);
  }

  private incrementTotalSupply(): void {
    const liquidity: UInt64 = this.totalSupply.getAndRequireEquals();
    const newTotalSupply: UInt64 = liquidity.add(1);
    this.totalSupply.set(newTotalSupply);
    this.emitEvent('updated-total-supply', newTotalSupply);
  }

  private updateFee(newFeeAmount: UInt64): void {
    this.fee.getAndRequireEquals();
    this.fee.set(newFeeAmount);
    this.emitEvent('updated-fee', newFeeAmount);
  }

  private updateRoot(newRoot: Field): void {
    this.root.set(newRoot);
    this.emitEvent('updated-merkle-root', newRoot);
  }

  private verifyTreeLeaf(item: NFT, keyWitness: MerkleMapWitness): PublicKey {
    const { sender: sender } = this.verifySenderSignature();
    const isItemOwner: Bool = sender.equals(item.owner);
    isItemOwner.assertEquals(true, 'sender not item owner');
    const initialRoot: Field = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(item.hash());
    rootBefore.assertEquals(initialRoot, 'root not matching');
    key.assertEquals(item.id, 'key not matching');
    return sender;
  }

  private verifyAdminSignature(): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    const sender: PublicKey = this.sender;
    const isAdmin: Bool = sender.equals(admin);
    isAdmin.assertEquals(true, 'sender not admin');
    const senderUpdate: AccountUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  private verifyAdminItemSignature(item: NFT, adminSignature: Signature): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    const isAdmin: Bool = adminSignature.verify(admin, item.toFields());
    isAdmin.assertEquals(Bool(true), 'item signature: not admin');
  }

  private verifySenderSignature() {
    const sender: PublicKey = this.sender;
    const senderUpdate: AccountUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    return { senderUpdate: senderUpdate, sender: sender };
  }
}
