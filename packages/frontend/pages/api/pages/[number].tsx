import type { NextApiRequest, NextApiResponse } from "next";
import { getVercelMetadata, getAppString, nftDataIn } from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";
import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";
import { VercelKV } from "@vercel/kv";

type dataOut = {
  items: nftDataIn[];
  totalSupply: number;
  page: number;
};

const perPage = 6;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  const hostname: "http://localhost:3000" | "https://pinsave.app" = host;
  const { number } = req.query;
  const pageNumber: number = Number(number);
  if (pageNumber < 0) {
    throw new Error("page number can not be negative");
  }
  const data: { totalInited: number } = await fetcher(
    `${hostname}/api/totalInited`
  );
  const totalInited: number = data.totalInited;

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

  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();

  let items: nftDataIn[] = [];

  for (let index = lowerLimit; upperLimit >= index; index++) {
    const data: nftDataIn = await getVercelMetadata(appId, index, client);
    items.push({ ...data });
  }

  res
    .status(200)
    .json({ items: items, totalSupply: totalInited, page: pageNumber });
}
