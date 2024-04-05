import type { NextApiRequest, NextApiResponse } from "next";
import { PrivateKey, Signature } from "o1js";
import { VercelKV } from "@vercel/kv";
import {
  NFTMetadata,
  createNFT,
  NFT,
  setVercelMetadataAA,
  getAppString,
  setVercelNFTAA,
  deserializeMetadata,
  NFTSerializedData,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type dataOut = {
  adminSignatureBase58: string;
  attemptId: string | number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  if (req.method === "POST") {
    const data: NFTSerializedData = req.body;
    const nftMetadata: NFTMetadata = deserializeMetadata(data);
    const appId: string = getAppString();
    const client: VercelKV = getVercelClient();
    const nftHashed: NFT = createNFT(nftMetadata);
    const adminPK: PrivateKey = PrivateKey.fromBase58(process.env.adminPK);
    const adminSignature: Signature = Signature.create(
      adminPK,
      nftHashed.toFields()
    );
    const adminSignatureBase58: string = adminSignature.toBase58();
    const attemptId: number = Math.random();
    setVercelMetadataAA(appId, nftMetadata, attemptId, client);
    setVercelNFTAA(appId, nftHashed, attemptId, client);
    res.status(200).json({ adminSignatureBase58, attemptId });
  }
}
