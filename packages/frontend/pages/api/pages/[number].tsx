import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import {
  getVercelMetadata,
  getAppString,
  NFTSerializedData,
  getVercelNFTAllKeys,
  getVercelMetadataAllKeys,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";
import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";

type dataOut = {
  items: NFTSerializedData[];
  totalSupply: number;
  page: number;
};

const perPage: number = 6;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  const { number } = req.query;
  const pageNumber: number = Number(number);
  if (pageNumber < 0) {
    throw new Error("page number can not be negative");
  }
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

  const data: { totalInited: number } = await fetcher(
    `${host}/api/totalInited`
  );
  if (data.totalInited !== nftMetadataSynced.length) {
    console.log("main db not synced yet");
  }
  const totalInited: number = nftSynced.length;

  let lowerLimit: number = 0;
  let upperLimit: number =
    perPage > totalInited ? totalInited - 1 : perPage - 1;
  if (pageNumber > 0) {
    lowerLimit = pageNumber * perPage;
    upperLimit =
      lowerLimit + perPage > totalInited
        ? totalInited - 1
        : lowerLimit + perPage - 1;
  }

  let items: NFTSerializedData[] = [];

  for (let index = lowerLimit; upperLimit >= index; index++) {
    const data: NFTSerializedData = await getVercelMetadata(
      appId,
      index,
      client
    );
    items.push({ ...data });
  }

  res
    .status(200)
    .json({ items: items, totalSupply: totalInited, page: pageNumber });
}
