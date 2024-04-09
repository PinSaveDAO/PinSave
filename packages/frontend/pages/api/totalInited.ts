import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";
import { fetchEvents, Field, PublicKey } from "o1js";
import {
  startBerkeleyClient,
  getTotalInitedLive,
  getAppContract,
  NFTContract,
  getAppString,
  getVercelNFTAllKeys,
  getVercelMetadataPendingAllId,
  getVercelNFTPendingAllId,
  getVercelNFTPending,
  getVercelMetadataPending,
  NFT,
  deserializeMetadata,
  setVercelMetadata,
  setVercelNFT,
} from "pin-mina";

import { getVercelClient } from "@/services/vercelClient";

type DataOut = {
  totalInited: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataOut>
) {
  startBerkeleyClient();
  const client: VercelKV = getVercelClient();
  const appId: string = getAppString();
  const zkAppInstance: NFTContract = getAppContract();
  const totalInited: number = await getTotalInitedLive(zkAppInstance, true);
  const nftSynced: string[] = await getVercelNFTAllKeys(appId, client);

  if (totalInited > nftSynced.length) {
    if (totalInited !== nftSynced.length + 1) {
      throw new Error("unexpected");
    }
    const nftId: number = nftSynced.length;
    const metadataKeys: string[] = await getVercelMetadataPendingAllId(
      appId,
      nftId,
      client
    );
    const nftKeys: string[] = await getVercelNFTPendingAllId(
      appId,
      nftId,
      client
    );

    if (metadataKeys.length !== nftKeys.length) {
      throw new Error("db length not matches");
    }

    const events = await fetchEvents({ publicKey: appId });
    const lastEventEvents = events.at(-1)?.events;

    let nftInited;
    if (lastEventEvents) {
      for (let res of lastEventEvents) {
        if (res.data[0] === "1") {
          nftInited = res.data[1];
        }
      }
    }

    let subbedAttemptId;
    let subbedNFT;
    for (let key of metadataKeys) {
      const attemptId = key.split(" ")[4];
      let nftPending = await getVercelNFTPending(
        appId,
        nftId,
        attemptId,
        client
      );
      const nft: NFT = new NFT({
        name: Field(nftPending.name),
        description: Field(nftPending.description),
        id: Field(nftPending.id),
        cid: Field(nftPending.cid),
        owner: PublicKey.fromBase58(nftPending.owner),
        isMinted: Field(nftPending.isMinted),
      });
      if (nftInited === nft.hash().toString()) {
        subbedAttemptId = attemptId;
        subbedNFT = nft;
      }
    }

    if (subbedAttemptId && subbedNFT) {
      const nftPending = await getVercelMetadataPending(
        appId,
        nftId,
        subbedAttemptId,
        client
      );

      const subbedMetadata = deserializeMetadata(nftPending);
      setVercelMetadata(appId, subbedMetadata, client);
      setVercelNFT(appId, subbedNFT, client);
    }
  }

  res.status(200).json({ totalInited: totalInited });
}
