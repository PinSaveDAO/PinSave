import { ChainName } from "@/constants/chains";
import { NextRouter } from "next/router";

export const sendMessage = async function (
  context: string,
  isEncrypted: boolean,
  orbis: IOrbis,
  newMessage: string,
  queryId: string,
  address: `0x${string}`,
  currentChain: ChainName
) {
  if (isEncrypted)
    await orbis.createPost(
      {
        body: newMessage,
        context: context,
        tags: [{ slug: queryId, title: queryId }],
      },
      {
        type: "custom",
        accessControlConditions: [
          {
            contractAddress: address,
            standardContractType: "ERC721",
            chain: currentChain,
            method: "balanceOf",
            parameters: [":userAddress"],
            returnValueTest: { comparator: ">=", value: "1" },
          },
        ],
      }
    );
  if (!isEncrypted)
    await orbis.createPost({
      body: newMessage,
      context: context,
      tags: [{ slug: queryId, title: queryId }],
    });
};

export const sendReaction = async function (
  id: string,
  reaction: string,
  orbis: IOrbis,
  setReaction: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  await orbis.react(id, reaction);
  setReaction(id + reaction);
};

export const getMessage = async function (content: any, orbis: IOrbis) {
  if (content?.content?.body === "") {
    let res = await orbis.decryptPost(content.content);
    return res.result;
  }
  return content?.content?.body;
};

export async function loadData(
  orbis: IOrbis,
  router: NextRouter,
  context: string,
  queryId: string,
  setMessages: React.Dispatch<any>
) {
  let res = await orbis.isConnected();

  if (!router.isReady) return;

  if (!res) {
    res = await orbis.connect();
  }

  let result = await orbis.getPosts({
    context: context,
    tag: queryId,
  });

  const messagesData = await Promise.all(
    result.data.map(async (obj: object) => {
      return {
        ...obj,
        newData: await getMessage(obj, orbis),
      };
    })
  );

  setMessages(messagesData);
}
