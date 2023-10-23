import { updateNotification } from "@mantine/notifications";
import { ContractFactory, keccak256, toUtf8Bytes, hexlify } from "ethers";
import { NFTStorage, Blob } from "nft.storage";
import { useContractWrite, useWalletClient } from "wagmi";

const client = new NFTStorage({ token: process.env.NEXT_PUBLIC_TOKEN });

export type SyncingProfile = {
  name?: string;
  description?: string;
  profileImage?: string;
  backgroundImage?: string;
  address: `0x${string}`;
};

/* export async function UpdateProfile(incomingData: SyncingProfile) {
  try {
    const { write } = useContractWrite({
      address: incomingData.address,
      abi: ERC725.abi,
      functionName: "setData(bytes32,bytes)",
    });

    //keep substr
    const hashFunction = keccak256(toUtf8Bytes("keccak256(utf8)")).substr(
      0,
      10
    );

    const json = JSON.stringify({
      LSP3Profile: {
        name: incomingData.name,
        description: incomingData.description,
        profileImage: [
          {
            url: incomingData.profileImage,
          },
        ],
        backgroundImage: [
          {
            url: incomingData.backgroundImage,
          },
        ],
      },
    });

    const hash = keccak256(toUtf8Bytes(json));

    const blob = new Blob([json], { type: "application/json" });

    const cid = await client.storeBlob(blob);

    const url = hexlify(toUtf8Bytes(`ipfs://${cid}`));

    const JSONURL = hashFunction + hash.substring(2) + url.substring(2);

    write({
      args: [
        "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
        JSONURL,
      ],
    });

    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Post uploaded successfully!!",
      message: "",
    });
  } catch (error) {
    updateNotification({
      id: "upload-post",
      color: "red",
      title: "Failed to upload post",
      message: `${error}`,
    });
  }
} */

/* export async function CreateProfile(incomingData: Wallet) {
  try {
    const { data: walletClient, isError, isLoading } = useWalletClient();
    const factory = new ContractFactory(
      ERC725.abi,
      ERC725.bytecode,
      walletClient
    );

    const contract = await factory.deploy(incomingData.address);

    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Universal Profile created successfully!!",
      message: `${contract.target}`,
    });
    return contract.target as string;
  } catch (error) {
    updateNotification({
      id: "upload-post",
      color: "red",
      title: "Failed to upload post",
      message: `${error}`,
    });
  }
}
 */
