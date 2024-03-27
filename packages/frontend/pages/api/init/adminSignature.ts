import type { NextApiRequest, NextApiResponse } from "next";
import { PrivateKey, Signature, Field, PublicKey } from "o1js";
import { NFTMetadata, createNFT } from "pin-mina";

type dataIn = {
  name: string;
  description: string;
  id: string;
  cid: string;
  owner: string;
};

type dataOut = {
  adminSignatureBase58: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  if (req.method === "POST") {
    const data: dataIn = req.body;
    const nftMetadata: NFTMetadata = {
      name: data.name,
      description: data.description,
      id: Field(data.id),
      cid: data.cid,
      owner: PublicKey.fromBase58(data.owner),
      isMinted: "0",
    };
    const nftHashed = createNFT(nftMetadata);
    const adminPK = PrivateKey.fromBase58(process.env.adminPK);
    const adminSignature = Signature.create(adminPK, nftHashed.toFields());
    const adminSignatureBase58 = adminSignature.toBase58();
    res.status(200).json({ adminSignatureBase58 });
  }
}
