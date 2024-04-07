import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import {
  startBerkeleyClient,
  getTotalInitedLive,
  getAppContract,
  NFTContract,
  getAppString,
  getVercelNFTAllKeys,
  getVercelMetadataPendingAll,
  getVercelNFTPendingAll,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type DataOut = {
  totalInited: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  startBerkeleyClient();
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();
  const zkAppInstance: NFTContract = getAppContract();
  const totalInited: number = await getTotalInitedLive(zkAppInstance, true);
  const nftSynced: string[] = await getVercelNFTAllKeys(appId, client);
  if (totalInited > nftSynced.length) {
    const metadataKeys: string[] = await getVercelMetadataPendingAll(
      appId,
      client
    );
    const nftKeys: string[] = await getVercelNFTPendingAll(appId, client);

    // update

    // delete from pending
  }
  res.status(200).json({ totalInited: totalInited });
}
