import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import {
  deserializeNFT,
  NFTSerializedData,
  NFT,
  getAppString,
  mintVercelMetadataAA,
  mintVercelNFTAA,
} from "pin-mina";
import { PrivateKey, Signature } from "o1js";

import { fetcher } from "@/utils/fetcher";
import { host } from "@/utils/host";
import { getVercelClient } from "@/services/vercelClient";

type dataOut = {
  adminSignatureBase58: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  if (req.method === "POST") {
    const data = req.body;
    const postNumber: string = String(data.postNumber);

    const appId: string = getAppString();
    const client: VercelKV = getVercelClient();

    const dataNft: NFTSerializedData = await fetcher(
      `${host}/api/nft/${postNumber}`
    );
    const nft: NFT = deserializeNFT(dataNft);

    const adminPK: PrivateKey = PrivateKey.fromBase58(process.env.adminPK);
    const adminSignature: Signature = Signature.create(adminPK, nft.toFields());
    const adminSignatureBase58: string = adminSignature.toBase58();
    const randomNumber: number = Math.random();
    mintVercelMetadataAA(appId, postNumber, randomNumber, client);
    mintVercelNFTAA(appId, postNumber, randomNumber, client);
    res.status(200).json({ adminSignatureBase58 });
  }
}
