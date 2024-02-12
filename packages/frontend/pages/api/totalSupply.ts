import {
  startBerkeleyClient,
  getAppPublic,
  MerkleMapContract,
  getTotalSupplyLive,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    startBerkeleyClient();

    const { appPubKey: zkAppAddress } = getAppPublic();

    const zkAppInstance: MerkleMapContract = new MerkleMapContract(
      zkAppAddress
    );

    let totalSupply = 0;

    try {
      totalSupply = Number(await getTotalSupplyLive(zkAppInstance));
    } catch (e) {
      console.log(e);
    }

    res.status(200).json({ totalSupply: totalSupply });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
