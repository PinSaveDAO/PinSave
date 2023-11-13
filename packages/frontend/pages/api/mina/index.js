import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleMap,
  PublicKey,
  addCachedAccount,
  fetchAccount,
} from "o1js";
import { MerkleMapContract } from "pin-mina";

export default async function handler(req, res) {
  try {
    const deployerKey = PrivateKey.fromBase58(
      process.env.NEXT_PUBLIC_DEPLOYER_KEY
    );

    // const deployerAccount = deployerKey.toPublicKey();

    const zkAppAddressPrivateKey = PrivateKey.fromBase58(
      process.env.NEXT_PUBLIC_APP_KEY
    );

    const zkAppAddress = zkAppAddressPrivateKey.toPublicKey();

    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );

    Mina.setActiveInstance(Berkeley);

    await fetchAccount({ publicKey: zkAppAddress });

    await MerkleMapContract.compile();
    const zkAppInstance = new MerkleMapContract(zkAppAddress);

    const map = new MerkleMap();

    const key = Field(100);
    const value = Field(50);

    map.set(key, value);

    //console.log("value for key", key.toString() + ":", map.get(key).toString());

    const rootBefore = map.getRoot();

    const mapRoot = zkAppInstance.mapRoot.get();

    const treeRoot = zkAppInstance.treeRoot.get();

    map.set(key, value.add(Field(5)));

    const rootUpdated = map.getRoot();

    //console.log("value for key", key.toString() + ":", map.get(key).toString());

    /*     
    const init_txn = await Mina.transaction(
      { sender: deployerAccount, fee: 800_000_000 },
      () => {
        zkAppInstance.update(witness, key, value, Field(5));
      }
    );

    await init_txn.prove();

    let bla = await init_txn.sign([deployerKey]).send(); 
    */
    res.status(200).json({
      rootBefore: rootBefore,
      rootUpdated: rootUpdated,
      mapRoot: mapRoot,
      treeRoot: treeRoot,
    });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
