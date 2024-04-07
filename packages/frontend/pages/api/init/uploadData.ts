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
  NFTSerializedData,
  deserializeMetadata,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type dataOut = {
  response: boolean;
};

function nftDataMatches(
  nftAAPosted: NFTMetadataAA | NFTAA,
  nftAAdb: NFTMetadataAA | NFTAA
) {
  if (nftAAPosted.attemptId !== nftAAdb.attemptId) {
    return false;
  }
  if (nftAAPosted.cid.toString() !== nftAAdb.cid.toString()) {
    return false;
  }
  if (nftAAPosted.description.toString() !== nftAAdb.description.toString()) {
    return false;
  }
  if (nftAAPosted.name.toString() !== nftAAdb.name.toString()) {
    return false;
  }
  if (nftAAPosted.isMinted.toString() !== nftAAdb.isMinted.toString()) {
    return false;
  }
  if (nftAAPosted.owner.toBase58() !== nftAAdb.owner.toBase58()) {
    return false;
  }
  if (nftAAPosted.id.toString() !== nftAAdb.id.toString()) {
    return false;
  }
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<dataOut>
) {
  if (req.method === "POST") {
    const nftMetadataPostedStrings: NFTSerializedData = req.body.nftMetadata;
    const attemptId: string = req.body.attemptId;
    const txId: string = req.body.txId;
    const nftMetadataPosted: NFTMetadata = deserializeMetadata(
      nftMetadataPostedStrings
    );

    const nftMetadataAAPosted: NFTMetadataAA = {
      ...nftMetadataPosted,
      attemptId: attemptId,
    };
    console.log(nftMetadataAAPosted);

    const appId: string = getAppString();
    const client: VercelKV = getVercelClient();

    const nftHashed: NFT = createNFT(nftMetadataPosted);
    const nftHashedAA: NFTAA = {
      ...nftHashed,
      attemptId: attemptId,
    };
    console.log(nftHashedAA);

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
    console.log(nftMetadataAAdb);

    const nftStringsAAdb: NFTSerializedDataAA = await getVercelNFTAA(
      appId,
      nftMetadataPosted.id.toString(),
      attemptId,
      client
    );
    const nftAAdb: NFTAA = deserializeNFTAA(nftStringsAAdb, attemptId);
    console.log(nftAAdb);

    const nftMatches = nftDataMatches(nftHashedAA, nftAAdb);
    console.log(nftMatches);
    const metadataMatches = nftDataMatches(
      nftMetadataAAPosted,
      nftMetadataAAdb
    );
    console.log(metadataMatches);

    if (metadataMatches && nftMatches) {
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
