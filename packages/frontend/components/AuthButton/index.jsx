import React, { useState } from 'react'
import { ClipLoader } from "react-spinners"
import { Menu } from "@headlessui/react";
import { CaretDown, SignOut } from "phosphor-react";
import { useAccount, useBalance } from "wagmi";
import WalletOptions from '../WalletOptions';
const AuthButton = () => {
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const openModal = () => setShowWalletOptions(true);
  const [
    { data: accountData, loading: accountLoading },
    disconnect,
  ] = useAccount({
    fetchEns: true,
  });
  const [{ data: balanceData }] = useBalance({
    addressOrName: accountData?.address,
  });
  if (accountLoading)
    return (
      <ClipLoader color='white' size={40} />
    );
  if (accountData)
    return (
      <Menu>
        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          {accountData?.ens?.name ??
            accountData?.address.substring(0, 4) +
            "..." +
            accountData?.address.substring(
              accountData?.address.length - 3,
              accountData?.address.length
            )}
          <CaretDown
            aria-hidden="true"
            className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
          />
        </Menu.Button>

        <Menu.Items className="absolute origin-top-right w-44 mt-10 ml-12 md:-ml-8 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div>
            <Menu.Item>
              <div className="text-gray-900 p-1 group flex border-b-2 transition items-center justify-between  w-full px-2 py-2 text-sm">
                <span className="text-xl font-bold mr-2 my-auto">
                  Ξ
                </span>
                <span className="mt-1">
                  {`${Number(balanceData?.formatted).toFixed(4)} ${balanceData?.symbol
                    }`}
                </span>
              </div>
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={disconnect}
                  className={`${active
                    ? "bg-red-600 text-gray-200"
                    : "text-gray-900"
                    } group flex rounded-b-md transition items-center w-full px-2 py-2 text-sm`}
                >
                  <SignOut
                    className="w-5 h-5 mr-4 my-auto"
                    aria-hidden="true"
                  />
                  Log Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    )
  return (
    <>
      <button
        onClick={() => openModal()}
        className="bg-black transition-all hover:bg-black/60 text-white font-bold p-2 rounded-md"
      >
        Connect
      </button>
      <WalletOptions open={showWalletOptions} setOpen={setShowWalletOptions} />
    </>
  )

}

export default AuthButton