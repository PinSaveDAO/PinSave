import {
  Field,
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
  TokenContract,
} from 'o1js';

import { NFT } from './components/NFT/NFT.js';
import { InitState } from './components/NFT/InitState.js';

export class NFTContract extends TokenContract {
  events = {
    'inited-max-supply': Field,
    'inited-nft': Field,
    'minted-nft': Field,
    'transferred-nft': Field,
    'updated-fee': UInt64,
    'updated-inited-amount': Field,
    'updated-merkle-key': Field,
    'updated-merkle-root': Field,
    'updated-total-supply': UInt64,
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
    const { sender } = this.verifySenderSignature();
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
    isAdmin.assertTrue('initState signature: not an admin');

    const root: Field = this.root.getAndRequireEquals();
    const emptyMerkleMapRoot: Field = new MerkleMap().getRoot();
    root.assertEquals(emptyMerkleMapRoot, 'root: initialized');

    const maxSupply: Field = this.maxSupply.getAndRequireEquals();
    maxSupply.assertEquals(0, 'maxSupply: initialized');

    const initedAmount: Field = this.totalInited.getAndRequireEquals();
    initedAmount.assertEquals(0, 'nfts: initialized');

    this.initMaxSupply(initState.maxSupply);
    this.initNFTAmount(initState.totalInited);
    initState.maxSupply.assertGreaterThanOrEqual(
      initState.totalInited,
      'maxSupply reached'
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
    nft: NFT,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminNFTSignature(nft, adminSignature);
    const { senderUpdate } = this.verifySenderSignature();

    const initedAmount: Field = this.totalInited.getAndRequireEquals();
    const maxSupply: Field = this.maxSupply.getAndRequireEquals();
    maxSupply.assertGreaterThan(initedAmount, 'maximum supply reached');

    const initialRoot: Field = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(Field(0));
    rootBefore.assertEquals(initialRoot, 'roots: do not match');
    key.assertEquals(nft.id, 'key: not matches nft id');
    key.assertEquals(initedAmount, 'key: not matches order id');

    const fee: UInt64 = this.fee.getAndRequireEquals();
    senderUpdate.send({ to: this, amount: fee });

    const nftHash: Field = nft.hash();
    const [rootAfter] = keyWitness.computeRootAndKey(nftHash);

    this.emitEvent('inited-nft', nftHash);
    this.emitEvent('updated-merkle-key', nft.id);

    this.incrementNFTAmount(initedAmount);
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public mintNFT(
    nft: NFT,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminNFTSignature(nft, adminSignature);
    this.verifyTreeLeaf(nft, keyWitness);
    nft.isMinted.assertEquals(0, 'nft: already minted');

    this.internal.mint({
      address: nft.owner,
      amount: 1_000_000_000,
    });
    nft.mint();

    const nftHash: Field = nft.hash();
    const [rootAfter] = keyWitness.computeRootAndKey(nftHash);

    this.emitEvent('minted-nft', nftHash);
    this.emitEvent('updated-merkle-key', nft.id);

    this.incrementTotalSupply();
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  @method public transferNFT(
    nft: NFT,
    newOwner: PublicKey,
    keyWitness: MerkleMapWitness,
    adminSignature: Signature
  ): Bool {
    this.verifyAdminNFTSignature(nft, adminSignature);
    const sender: PublicKey = this.verifyTreeLeaf(nft, keyWitness);

    this.internal.send({
      from: sender,
      to: newOwner,
      amount: 1_000_000_000,
    });
    nft.changeOwner(newOwner);

    const nftHash: Field = nft.hash();
    const [rootAfter] = keyWitness.computeRootAndKey(nftHash);

    this.emitEvent('transferred-nft', nftHash);
    this.emitEvent('updated-merkle-key', nft.id);
    this.updateRoot(rootAfter);
    return Bool(true);
  }

  private initMaxSupply(_maxSupply: Field): void {
    this.maxSupply.set(_maxSupply);
    this.emitEvent('inited-max-supply', _maxSupply);
  }

  private initNFTAmount(dAmount: Field): void {
    this.totalInited.set(dAmount);
    this.emitEvent('updated-inited-amount', dAmount);
  }

  private incrementNFTAmount(totalInited: Field): void {
    const totalInitedNew: Field = totalInited.add(1);
    this.totalInited.set(totalInitedNew);
    this.emitEvent('updated-inited-amount', totalInitedNew);
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

  private verifyTreeLeaf(nft: NFT, keyWitness: MerkleMapWitness): PublicKey {
    const { sender } = this.verifySenderSignature();
    const isNFTOwner: Bool = sender.equals(nft.owner);
    isNFTOwner.assertTrue('sender: not an nft owner');

    const initialRoot: Field = this.root.getAndRequireEquals();
    const [rootBefore, key] = keyWitness.computeRootAndKey(nft.hash());
    rootBefore.assertEquals(initialRoot, 'roots: not matching');
    key.assertEquals(nft.id, 'key: not matching nft id');
    return sender;
  }

  private verifyAdminSignature(): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    const sender: PublicKey = this.sender;
    const isAdmin: Bool = sender.equals(admin);
    isAdmin.assertTrue('sender: not an admin');
    const senderUpdate: AccountUpdate = AccountUpdate.create(admin);
    senderUpdate.requireSignature();
  }

  private verifyAdminNFTSignature(nft: NFT, adminSignature: Signature): void {
    const admin: PublicKey = this.admin.getAndRequireEquals();
    const isAdmin: Bool = adminSignature.verify(admin, nft.toFields());
    isAdmin.assertTrue('nft signature: not an admin');
  }

  private verifySenderSignature(): {
    senderUpdate: AccountUpdate;
    sender: PublicKey;
  } {
    const sender: PublicKey = this.sender;
    const senderUpdate: AccountUpdate = AccountUpdate.create(sender);
    senderUpdate.requireSignature();
    return { senderUpdate: senderUpdate, sender: sender };
  }

  @method approveBase() {
    return;
  }

  @method transfer() {
    return;
  }
}
