import { useState, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAccount, useSigner } from "wagmi";
import { getContractInfo } from "../utils";
import { ethers } from "ethers"
import { PuffLoader } from "react-spinners";

function Upload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [state, setState] = useState(false);
  const [postDesc, setPostDesc] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [uploading, setUploading] = useState();
  const [
    { data: accountData, loading: accountLoading },
  ] = useAccount({
    fetchEns: true,
  });
  const [{ data }, getSigner] = useSigner();
  const hiddenFileInput = useRef();

  if (accountLoading)
    return (
      <div className="mt-24 text-center">
        <PuffLoader size={120} color="black" className="translate-x-2/4" />
      </div>
    )
  function filledFields() {
    return postDesc !== "" && postTitle !== "";
  }

  async function str() {
    const filled = filledFields();
    if (filled && data) {
      setUploading(true);
      await axios({
        method: "post",
        url: process.env.NEXT_PUBLIC_UPLOAD,
        headers: {
          Authorization: process.env.NEXT_PUBLIC_API,
          "Content-Type": "image/*",
        },
        data: selectedImage,
      }).then(async (r) => {
        //Upload JSON Featuring the uploaded Image
        axios({
          method: "post",
          url: process.env.NEXT_PUBLIC_UPLOAD,
          headers: {
            Authorization: process.env.NEXT_PUBLIC_API,
            "Content-Type": "application/json"
          },
          data: {
            title: postTitle,
            description: postDesc,
            image: `https://${r.data.value.cid}.ipfs.dweb.link/`
          }
        }).then(async (r) => {
          const { address, abi } = getContractInfo();
          const signer = await getSigner();
          const contract = new ethers.Contract(address, abi, signer);
          await contract.mintPost(accountData.address, `https://${r.data.value.cid}.ipfs.dweb.link/`).then(() => {
            toast.success("Post uploaded Successfully", {
              style: {
                borderRadius: "10px",
                background: "#222",
                color: "#fff",
              },
            });
            setUploading(false);
          });
        }).catch(() => {
          toast.error("Couldn't create post", {
            style: {
              borderRadius: "10px",
              background: "#222",
              color: "#fff",
            },
          });
          setUploading(false);
        });
      });
    }
  }
  if (accountData)
    return (
      <div className="mx-3">
        <h1 className="text-center mt-5">Upload new Post</h1>
        <div className="mt-6 max-w-screen-md mx-auto">
          <div className="items-center -mx-2 md:flex">


            <div className="w-full mx-2 mt-4 md:mt-0">
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Title
              </label>
              <input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="block w-11/12 md:w-full px-4 py-2 text-gray-700 bg-white border rounded-md  focus:border-blue-400 focus:ring-blue-300 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                type="text"
              />
            </div>
          </div>

          <div className="w-full mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Description
            </label>

            <textarea
              value={postDesc}
              onChange={(e) => setPostDesc(e.target.value)}
              className="block w-full h-40 px-4 py-2 text-gray-700 bg-white border rounded-md  focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
            ></textarea>
          </div>
        </div>
        <div className="text-center mt-5">
          <div className="rounded-md border-dashed border-4 max-w-screen-md p-3 mx-auto">
            <input
              className="hidden"
              type="file"
              name="myImage"
              ref={hiddenFileInput}
              onChange={(event) => {
                if (event.target.files[0].type.includes("image")) {
                  setSelectedImage(event.target.files[0]);
                  setState(true);
                }
              }}
            />

            {selectedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(selectedImage)}
                alt=""
                className="rounded-md max-h-96 mt-4 mx-auto"
              />
            )}
            <button
              onClick={() => {
                hiddenFileInput.current.click();
              }}
              className="text-emerald-50 font-semibold m-3 text-lg p-2 rounded-full  bg-sky-600"
            >
              {selectedImage ? "Replace file" : "Add a File"}
            </button>
          </div>
        </div>
        {state && (
          <div className="text-center">
            <br />
            <button
              onClick={str}
              disabled={uploading}
              className=" rounded-full p-3 m-1 text-2xl disabled:bg-emerald-700 disabled:opacity-60 bg-emerald-600 text-white"
            >
              {uploading ? (
                "Loading..."
              ) : (
                "Submit"
              )}
            </button>
          </div>
        )}
      </div>
    );
  return (
    <div className="text-center mt-24">
      <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
        420
      </h1>
      <h2 className="text-2xl md:text-4xl font-bold">Please Log In</h2>
    </div>
  )
}

export default Upload;
