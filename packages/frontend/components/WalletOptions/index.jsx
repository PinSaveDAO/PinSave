import { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";
import { Dialog } from '@headlessui/react'
import { ClipLoader } from "react-spinners"

const WalletOptions = ({ open, setOpen }) => {
  const [
    { data: connectData, loading: connectDataLoading },
    connect,
  ] = useConnect();
  const [{ data: accountData }] = useAccount();
  const closeModal = () => setOpen(false);
  useEffect(() => {
    accountData && setOpen(false);
  }, [accountData, setOpen]);
  return (
    <Dialog
      open={open}
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto bg-black/30"
      onClose={closeModal}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0" />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="inline-block h-screen align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-xl font-medium leading-6 text-gray-900 text-center"
          >
            Choose a wallet
          </Dialog.Title>
          <div className="mt-2">
            {connectData.connectors.map(c => (
              <button onClick={() => connect(c)} className="font-medium p-4 w-full my-1 text-white bg-black rounded-md bg-opacity-90 hover:bg-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75" disabled={!c.ready || connectDataLoading} key={c.id}>
                {connectDataLoading ? (
                  <ClipLoader color="white" size={30} />
                )
                  : (
                    `${c.name}${!c.ready ? " (unsupported)" : ""}`
                  )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  )
};

export default WalletOptions;