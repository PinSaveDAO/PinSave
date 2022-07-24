import type { NextPage } from "next";

import React, { useState, useEffect } from "react";
import axios from "axios";
//import { useAccount } from "wagmi";

/* const Home: NextPage = () => {
  const { isConnected } = useAccount();
  console.log(isConnected);
  return isConnected ? <h1>Connected</h1> : <>No</>;
}; */

const Home: NextPage = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const response: any = await axios({
      method: "get",
      url: "https://api.nft.storage/?limit=100",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRiMzFEODU1NTQ5MmE0NTY3NGI2NTU5OTREQTA1ZmYyNWJmMDUxRjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNDQwNjY1NDYwOSwibmFtZSI6IlRlc3QifQ.TXFSoyO34m789bYtdXCNjMWbQlRfGQvLII7MQixUqwk",
      },
    });
    setComments(response.data.value);
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <section
      aria-labelledby="products-heading"
      className="max-w-7xl mx-auto overflow-hidden sm:px-6 lg:px-8"
    >
      <div className="-mx-px border-l border-teal-100 grid grid-cols-2 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
        {comments.map((x) => (
          <div className="group relative p-4 border-r border-b border-teal-100 sm:p-6">
            <div className="rounded-lg overflow-hidden  aspect-w-1 aspect-h-1 group-hover:opacity-75">
              <img
                className="w-full h-full object-center object-cover group-hover:opacity-75 aspect-[4/3]"
                src={`https://${x.cid}.ipfs.dweb.link`}
                alt=""
              />
              <div className="pt-10 pb-4 text-center">
                <h3 className="text-sm font-medium text-gray-900">
                  <a href={`https://${x.cid}.ipfs.dweb.link`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {x.cid}
                  </a>
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Home;
