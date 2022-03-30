import { useEffect, Fragment } from "react";
import { useConnect, useAccount } from "wagmi";
import { Dialog, Transition } from '@headlessui/react'
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
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto bg-black/30"
        onClose={closeModal}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
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
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>

  )
  /*
  return (

    <Modal
      open={open}
      onClose={closeModal}
      aria-labelledby="connect-wallet"
      aria-describedby="Connect Ethereum Wallet to the DApp"
    >
      <Box
        className="mx-auto absolute bg-white w-7/12 p-6"
        css={css`
          position: absolute;
          top: 50%;
          left: 50%;

          transform: translate(-50%, -50%);
          width: 60vh;
          background-color: whitesmoke;

          border-radius: 14px;
          max-width: 600px;
          text-align: center;
          margin-left: 2px;
          margin-right: 2px;
          box-shadow: 24;
          padding: 6px;
        `}
      >
        <h2>Choose a wallet</h2>
        <Box sx={{ flexGrow: 1 }}>
          <Grid
            container
            css={css`
              margin-top: 12px;
            `}
            direction="column"
            columns={connectData.connectors.length}
          >
            {connectData.connectors.map((c) => (
              <Button
                variant="contained"
                color="secondary"
                key={c.id}
                disabled={!c.ready || connectDataLoading}
                css={css`
                  margin: 4px;
                  text-transform: none;
                  border-radius: 6px;
                  font-size: x-large;
                `}
                onClick={() => connect(c)}
              >
                {connectDataLoading ? (
                  <CircularProgress
                    css={css`
                      color: black;
                    `}
                  />
                ) : (
                  `${c.name}${!c.ready ? " (unsupported)" : ""}`
                )}
              </Button>
            ))}
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
  */
};

export default WalletOptions;