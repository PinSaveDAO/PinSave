import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

import { getContractInfo } from "@/utils/contracts";
import { Post } from "@/services/upload";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const { address, abi } = getContractInfo(9000);
    const transactions = `https://api.covalenthq.com/v1/9000/tokens/${address}/nft_transactions/${id}/?key=${process.env.NEXT_PUBLIC_COVALENT_API}`;
    const res_transactions = await fetch(transactions).then((x) => x.json());

    const dateMinted = new Date(
      res_transactions.data.items[0].nft_transactions[0].block_signed_at
    );
    const nTxs = res_transactions.data.items[0].nft_transactions.length;

    /*     const nft_meta = `https://api.covalenthq.com/v1/9000/tokens/${address}/nft_metadata/${id}/?key=${process.env.NEXT_PUBLIC_COVALENT_API}`;
    const res_meta = await fetch(nft_meta).then((x) => x.json());

    console.log(res_meta); */

    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth.bd.evmos.dev:8545"
    );

    const contract = new ethers.Contract(address, abi, provider);

    const result = await contract.tokenURI(id);

    const owner = await contract.ownerOf(id);
    let x = result.replace("ipfs://", "https://");

    let resURL = x
      .split("/metadata.json")
      .join(".ipfs.nftstorage.link/metadata.json");

    const item: Post = await fetch(resURL).then((x) => x.json());

    let y, z;
    if (item.image) {
      if (item.image.charAt(0) === "i") {
        y = item.image.replace("ipfs://", "");
        z = y.replace("/", ".ipfs.nftstorage.link/");
        z = `https://${z}`;
      }
    }

    if (!z) {
      z = "https://evm.pinsave.app/PinSaveCard.png";
    }

    const output = {
      ...item,
      owner: owner,
      image: z,
      nTransactions: nTxs,
      date: dateMinted,
    };
    res.status(200).json(output);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch data" + err });
  }
}
