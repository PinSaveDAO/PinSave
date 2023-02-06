import ERC725 from "@/contracts/ERC725.json";
import { updateNotification } from "@mantine/notifications";
import { ethers, Signer, ContractFactory } from "ethers";
import { NFTStorage, Blob } from "nft.storage";

const client = new NFTStorage({ token: process.env.NEXT_PUBLIC_TOKEN });

export type Wallet = {
  signer: Signer;
  address: string;
};

export type SyncingProfile = Wallet & {
  name?: string;
  description?: string;
  profileImage?: string;
  backgroundImage?: string;
};

export async function UpdateProfile(incomingData: SyncingProfile) {
  try {
    const erc725Contract = new ethers.Contract(
      incomingData.address,
      ERC725.abi,
      incomingData.signer
    );

    //keep substr
    const hashFunction = ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes("keccak256(utf8)"))
      .substr(0, 10);

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

    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(json));

    const blob = new Blob([json], { type: "application/json" });

    const cid = await client.storeBlob(blob);

    const url = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`ipfs://${cid}`));

    const JSONURL = hashFunction + hash.substring(2) + url.substring(2);

    await erc725Contract["setData(bytes32,bytes)"](
      "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
      JSONURL
    );

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
}

export async function CreateProfile(incomingData: Wallet) {
  try {
    const factory = new ContractFactory(
      ERC725.abi,
      ERC725.bytecode,
      incomingData.signer
    );

    const contract = await factory.deploy(incomingData.address);

    updateNotification({
      id: "upload-post",
      color: "teal",
      title: "Universal Profile created successfully!!",
      message: `${contract.address}`,
    });
    return contract.address;
  } catch (error) {
    updateNotification({
      id: "upload-post",
      color: "red",
      title: "Failed to upload post",
      message: `${error}`,
    });
  }
}
