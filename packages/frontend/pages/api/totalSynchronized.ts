import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import {
  getAppString,
  getVercelMetadataAllKeys,
  getVercelNFTAllKeys,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type DataOut = {
  totalInited: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();
  const nftSynced: string[] = await getVercelNFTAllKeys(appId, client);
  const nftMetadataSynced: string[] = await getVercelMetadataAllKeys(
    appId,
    client
  );
  if (nftSynced.length !== nftMetadataSynced.length) {
    throw new Error("db not synced");
  }
  res.status(200).json({ totalInited: nftSynced.length });
}
