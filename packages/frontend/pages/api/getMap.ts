import {
  startBerkeleyClient,
  getAppString,
  getMapFromVercelNFTs,
  serializeMerkleMapToJson,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { getVercelClient } from "@/services/vercelClient";
import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";

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
    const hostname = host;

    startBerkeleyClient();
    const client = await getVercelClient();
    const appId = getAppString();

    const data = await fetcher(`${hostname}/api/totalInited`);
    const totalInited = data.totalInited;

    const array = generateIntegersArray(totalInited);
    const storedMap = await getMapFromVercelNFTs(appId, array, client);
    const dataOut = serializeMerkleMapToJson(storedMap);

    res.status(200).json({ map: dataOut, totalInited: totalInited });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
