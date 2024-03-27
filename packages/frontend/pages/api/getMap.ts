import {
  startBerkeleyClient,
  getAppString,
  getMapFromVercelNFTs,
  serializeMerkleMapToJson,
  generateIntegersArray,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";

import { getVercelClient } from "@/services/vercelClient";
import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";

type DataOut = {
  map: string;
  totalInited: number;
  root: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  const hostname = host;

  startBerkeleyClient();
  const client = getVercelClient();
  const appId = getAppString();

  const data = await fetcher(`${hostname}/api/totalInited`);
  const totalInited = Number(data.totalInited);
  const array = generateIntegersArray(totalInited);

  const storedMap = await getMapFromVercelNFTs(appId, array, client);
  const mapRoot = storedMap.getRoot().toString();
  const dataOut = serializeMerkleMapToJson(storedMap);
  res
    .status(200)
    .json({ map: dataOut, totalInited: totalInited, root: mapRoot });
}
