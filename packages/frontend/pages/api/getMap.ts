import {
  startBerkeleyClient,
  getAppString,
  getMapFromVercelNFTs,
  serializeMerkleMapToJson,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { getVercelClient } from "@/services/vercelClient";

function generateIntegersArray(n: number) {
  let integersArray = [];
  for (let i = 0; i < n; i++) {
    integersArray.push(i);
  }
  return integersArray;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const host = process.env.NEXT_PUBLIC_ISDEV
      ? "http://localhost:3000"
      : "https://pinsave.app";
    startBerkeleyClient();
    const client = await getVercelClient();
    const appId = getAppString();

    const response = await fetch(`${host}/api/totalInited`);
    const data = await response.json();
    const totalInited = data.totalInited;

    const array = generateIntegersArray(totalInited);
    const storedMap = await getMapFromVercelNFTs(appId, array, client);
    const dataOut = serializeMerkleMapToJson(storedMap);

    res.status(200).json({ map: dataOut, totalInited: totalInited });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
