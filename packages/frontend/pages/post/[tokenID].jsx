/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'

import { ArrowSquareOut } from "phosphor-react";
import { useSigner } from "wagmi";
import { ethers } from "ethers";
import { getContractInfo } from "../../utils";
const Post = () => {
  const router = useRouter()
  const { tokenID } = router.query
  const [{ data }, getSigner] = useSigner()
  const [userpost, setUserPost] = useState();
  const [postOwner, setPostOwner] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data)
      fetchPost();
  }, [data]);

  const fetchPost = async () => {
    const { address, abi } = getContractInfo()
    const signer = await getSigner()
    const contract = new ethers.Contract(address, abi, signer);
    const res = await contract.tokenURI(Number(tokenID));
    const owner = await contract.ownerOf(Number(tokenID));
    const data = await fetch(res).then(x => x.json());
    setPostOwner(owner);
    setUserPost(data);
    setIsLoading(false);
  };

  if (isLoading)
    return (
      <div className="text-center mt-24">
        <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
          Welcome
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold">Loading...</h2>
      </div>
    )

  if (userpost)
    return (
      <div className="flex flex-col lg:flex-row mx-auto justify-center mt-24">
        <div className="w-screen lg:w-auto bg-black/60 lg:bg-transparent">
          <img style={{ maxHeight: "50vh", maxWidth: "50vw" }} className=" mx-auto lg:mx-0 shadow-md" src={userpost.image} alt="" />
        </div>
        <div className="mx-4 lg:ml-12  p-2">
          <h1 className="font-bold">{userpost.title}</h1>
          <h3>
            Owned by <span className="font-semibold">
              {
                postOwner.substring(0, 4) +
                "..." +
                postOwner.substring(
                  postOwner.length - 3,
                  postOwner.length
                )}</span>
          </h3>
          <h5 onClick={() => {
            window.open(`https://etherscan.io/address/${postOwner}`);
          }} className="mb-4 flex text-black/50">View Address on Explorer
            <ArrowSquareOut className="my-auto mx-3" />
          </h5>
          <p>
            Description:
            <br />
            <span className="italic">
              {userpost.description}
            </span>
          </p>

        </div>
      </div>
    )

  return (
    <div className="text-center mt-24">
      <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
        404
      </h1>
      <h2 className="text-2xl md:text-4xl font-bold">Post not found</h2>
    </div>
  )
}

export default Post