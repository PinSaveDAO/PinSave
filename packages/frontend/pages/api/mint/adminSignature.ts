import type { NextApiRequest, NextApiResponse } from "next";
import { deserializeNFT } from "pin-mina";
import { PrivateKey, Signature } from "o1js";

import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";

type dataOut = {
  adminSignatureBase58: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  if (req.method === "POST") {
    const data = req.body;
    const postNumber = String(data.postNumber);

    const dataNft = await fetcher(`${host}/api/nft/${postNumber}`);
    const nft = deserializeNFT(dataNft);

    const adminPK = PrivateKey.fromBase58(process.env.adminPK);
    const adminSignature = Signature.create(adminPK, nft.toFields());
    const adminSignatureBase58 = adminSignature.toBase58();
    res.status(200).json({ adminSignatureBase58 });
  }
}
