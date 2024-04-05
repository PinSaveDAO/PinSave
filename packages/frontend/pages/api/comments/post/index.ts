import type { NextApiRequest, NextApiResponse } from "next";
import type { VercelKV } from "@vercel/kv";

import { getAppString, setVercelComment, CommentData } from "pin-mina";
import Client from "mina-signer";

import { getVercelClient } from "@/services/vercelClient";

interface SignedData {
  publicKey: string;
  data: string;
  signature: {
    field: string;
    scalar: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  if (req.method === "POST") {
    const signResult: SignedData = req.body.signResult;
    const postId: number | string = req.body.postId;
    const appId: string = getAppString();
    const client: VercelKV = getVercelClient();
    const minaClient: Client = new Client({ network: "testnet" });
    const isTrue: boolean = minaClient.verifyMessage(signResult);
    if (isTrue) {
      const data: CommentData = {
        publicKey: signResult.publicKey,
        data: signResult.data,
        postId: postId,
      };
      setVercelComment(appId, data, client);
      res.status(200).json("comment sent");
    }
    res.status(401).json("failed verification");
  }
  res.status(401).json("not correct type request");
}
