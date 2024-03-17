import type { NextApiRequest, NextApiResponse } from "next";
import { getVercelMetadata, getAppString } from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";
import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";

const perPage = 6;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const hostname = host;
  const { number } = req.query;
  const pageNumber = Number(number);

  if (pageNumber < 0) {
    throw new Error("page number can not be negative");
  }

  const data = await fetcher(`${hostname}/api/totalInited`);
  const totalInited = data.totalInited;

  let lowerLimit = 0;
  let upperLimit = perPage > totalInited ? totalInited - 1 : perPage - 1;

  if (pageNumber > 0) {
    lowerLimit = pageNumber * perPage;
    upperLimit =
      lowerLimit + perPage > totalInited
        ? totalInited - 1
        : lowerLimit + perPage - 1;
  }

  const client = getVercelClient();
  const appId = getAppString();

  let items = [];

  for (let index = lowerLimit; upperLimit >= index; index++) {
    const data = await getVercelMetadata(appId, index, client);
    items.push({ ...data });
  }

  res
    .status(200)
    .json({ items: items, totalSupply: totalInited, page: pageNumber });
}
