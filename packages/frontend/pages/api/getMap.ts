import {
  startBerkeleyClient,
  getAppString,
  getMapFromVercelNFTs,
  serializeMerkleMapToJson,
  generateIntegersArray,
} from "pin-mina";
import type { NextApiRequest, NextApiResponse } from "next";
import { MerkleMap } from "o1js";
import { VercelKV } from "@vercel/kv";

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
  const hostname: "http://localhost:3000" | "https://pinsave.app" = host;
  startBerkeleyClient();
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();
  const data: { totalInited: number } = await fetcher(
    `${hostname}/api/totalInited`
  );
  const totalInited: number = data.totalInited;
  const array: number[] = generateIntegersArray(totalInited);
  const storedMap: MerkleMap = await getMapFromVercelNFTs(appId, array, client);
  const mapRoot: string = storedMap.getRoot().toString();
  const dataOut: string = serializeMerkleMapToJson(storedMap);
  res
    .status(200)
    .json({ map: dataOut, totalInited: totalInited, root: mapRoot });
}
