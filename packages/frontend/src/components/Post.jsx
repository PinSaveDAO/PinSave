import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowSquareOut } from "phosphor-react";


const Post = () => {
  const params = useParams();
  const [userpost, setUserPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    //TODO: Update nft fetch
    /*
    const items = await contract.nft_token({
      token_id:params.token_id
    })
    setUserPost(items);

    setIsLoading(false);
    */

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
          <img style={{ maxHeight: "50vh", maxWidth: "50vw" }} className=" mx-auto lg:mx-0 shadow-md" src={userpost.metadata.media} alt="" />
        </div>
        <div className="mx-4 lg:ml-12  p-2">
          <h1 className="font-bold">{userpost.metadata.title}</h1>
          <h3>
            Owned by <span className="font-semibold">{userpost.owner_id}</span>
          </h3>
          <h5 onClick={() => {
            window.open(`https://explorer.testnet.near.org/accounts/${userpost.owner_id}`);
          }} className="mb-4 flex text-black/50">View on Explorer
            <ArrowSquareOut className="my-auto mx-3" />
          </h5>
          <p>
            Description:
            <br />
            <span className="italic">
              {userpost.metadata.description}
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