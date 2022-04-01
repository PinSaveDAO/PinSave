import { useState, useEffect } from "react";
import Link from "next/link";
import { useSigner } from "wagmi"
import { getContractInfo } from "../utils";
import { ethers } from "ethers";
function Home() {
  const [posts, setPosts] = useState([]);
  const [{ data: signerData }, getSigner] = useSigner();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (signerData && !posts.length)
      fetchposts();
  }, [signerData]);

  const fetchposts = async () => {
    const { address, abi } = getContractInfo();
    const signer = await getSigner();
    const contract = new ethers.Contract(address, abi, signer);
    const currentCount = Number(await contract.totalSupply());
    let items = [];
    for (let i = currentCount; i >= currentCount - 40 && i > 0; i--) {
      const res = await contract.tokenURI(i);
      const item = await fetch(res).then(x => x.json());
      items.push({ token_id: i, ...item });

    }
    setPosts(items);
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="mx-4 md:mx-16 lg:mx-32 mt-12">
      <div className="md:masonry-2-col lg:masonry-3-col xl:masonry-4-col box-border mx-auto before:box-inherit after:box-inherit">
        {posts.map((item, i) => (
          <Link href={`/post/${item.token_id}`} key={i} passHref>
            <div
              className="break-inside bg-slate-200 shadow-slate-600/40 my-6"

            >
              <div className="bg-black/20 w-full">
                <img
                  className="mx-auto max-h-60"
                  src={item.image}
                  alt=""
                />
              </div>
              <h4 className="text-center font-bold my-2">{item.title}</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
