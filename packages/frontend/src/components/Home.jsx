import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useStore } from "../store";


function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const contract = useStore((state) => state.contract);
  useEffect(() => {
    if(contract)
    fetchposts();
  }, [contract]);

  const fetchposts = async () => {
    const items = await contract.nft_tokens({
      limit:10
    })
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
          <Link to={`/post/${item.token_id}`}>
          <div
            className="break-inside bg-slate-200 shadow-slate-600/40 my-6"
            key={i}
          >
            <div className="bg-black/20 w-full">
            <img
              className="mx-auto max-h-60"
              src={item.metadata.media}
              alt=""
            />
            </div>
            <h4 className="text-center font-bold my-2">{item.metadata.title}</h4>
              </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
