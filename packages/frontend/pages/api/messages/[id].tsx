import type { NextApiRequest, NextApiResponse } from "next";
import { Orbis } from "@orbisclub/orbis-sdk";

const orbis: IOrbis = new Orbis();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const context =
      "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w";
    const tag = "optimism";

    let result = await orbis.getPosts(
      {
        context: context,
        tag: tag,
      },
      0,
      5
    );

    res.status(200).json({
      data: result.data,
    });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
