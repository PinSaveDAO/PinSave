import type { NextApiRequest, NextApiResponse } from "next";
import { deserializeNFT } from "pin-mina";
import { PrivateKey, Signature } from "o1js";

import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";

type dataIn = {
  postNumber: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const data: dataIn = req.body;
      const postNumber = data.postNumber;

      const dataNft = await fetcher(`${host}/api/nft/${postNumber}`);
      const nft = deserializeNFT(dataNft);

      const adminPK = PrivateKey.fromBase58(process.env.adminPK);
      const adminSignature = Signature.create(adminPK, nft.toFields());
      const adminSignatureBase58 = adminSignature.toBase58();
      res.status(200).json({ adminSignatureBase58 });
    }
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
