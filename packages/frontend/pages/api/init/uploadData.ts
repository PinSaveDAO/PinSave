import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import {
  getAppString,
  setVercelNFTPending,
  setVercelMetadataPending,
  NFTMetadata,
  createNFT,
  NFT,
  getVercelMetadataAA,
  getVercelNFTAA,
  NFTSerializedDataAA,
  NFTMetadataAA,
  NFTAA,
  deserializeNFTAA,
  deserializeNFTMetadataAA,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type dataOut = {
  response: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  if (req.method === "POST") {
    const nftMetadataPosted: NFTMetadata = req.body.nftMetadata;
    const attemptId: string = req.body.attemptId;
    const nftMetadataAAPosted: NFTMetadataAA = {
      ...nftMetadataPosted,
      attemptId: attemptId,
    };

    const txId: string = req.body.txId;
    const appId: string = getAppString();
    const client: VercelKV = getVercelClient();

    const nftHashed: NFT = createNFT(nftMetadataPosted);
    const nftHashedAA: NFTAA = {
      ...nftHashed,
      attemptId: attemptId,
    };

    const nftMetadataStringsAAdb: NFTSerializedDataAA =
      await getVercelMetadataAA(
        appId,
        nftMetadataPosted.id.toString(),
        attemptId,
        client
      );
    const nftMetadataAAdb: NFTMetadataAA = deserializeNFTMetadataAA(
      nftMetadataStringsAAdb,
      attemptId
    );

    const nftStringsAAdb: NFTSerializedDataAA = await getVercelNFTAA(
      appId,
      nftMetadataPosted.id.toString(),
      attemptId,
      client
    );
    const nftAAdb: NFTAA = deserializeNFTAA(nftStringsAAdb, attemptId);

    if (nftMetadataAAPosted === nftMetadataAAdb && nftHashedAA === nftAAdb) {
      await setVercelNFTPending(appId, nftHashed, attemptId, txId, client);
      await setVercelMetadataPending(
        appId,
        nftMetadataPosted,
        attemptId,
        txId,
        client
      );
      res.status(200).json({ response: true });
    }
    res.status(401).json({ response: false });
  }
}
