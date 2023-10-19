import { ChainName } from "@/constants/chains";
import { NextRouter } from "next/router";

export const sendMessage = async function (
  context: string,
  isEncrypted: boolean,
  orbis: IOrbis,
  newMessage: string,
  tag: string,
  address: `0x${string}`,
  currentChain: ChainName,
  setOrbisResponse: React.Dispatch<any>
) {
  let response: any;
  if (isEncrypted) {
    response = await orbis.createPost(
      {
        body: newMessage,
        context: context,
        tags: [{ slug: tag, title: tag }],
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
  }
  if (!isEncrypted) {
    response = await orbis.createPost({
      body: newMessage,
      context: context,
      tags: [{ slug: tag, title: tag }],
    });
  }
  setTimeout(() => {
    setOrbisResponse(response);
  }, 3000);

  return true;
};

export const sendReaction = async function (
  id: string,
  reaction: string,
  orbis: IOrbis,
  setOrbisResponse: React.Dispatch<any>
) {
  const response = await orbis.react(id, reaction);
  setTimeout(() => {
    setOrbisResponse(response);
  }, 1000);
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
  tag: string,
  setMessages: React.Dispatch<any>
) {
  let res = await orbis.isConnected();

  if (!router.isReady) return;

  if (!res) {
    res = await orbis.connect();
  }

  let result = await orbis.getPosts(
    {
      context: context,
      tag: tag,
    },
    0,
    5
  );

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
