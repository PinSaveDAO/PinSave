import { NavLink } from "react-router-dom";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { CaretDown, House, List, SignOut, UploadSimple } from "phosphor-react";

import { useStore } from "../store";


function Navigation() {
  const wallet = useStore((state) => state.wallet);
  const contract = useStore((state) => state.contract);
  const nearConfig = useStore((state) => state.nearConfig);
  const currentUser = useStore((state) => state.currentUser);
  const ConnectWallet = () => {
    wallet.requestSignIn(
      {
        contractId: nearConfig.contractName,
        methodNames: [contract.nft_mint.name],
      }, //contract requesting access
      "DspytNFTs",
      null,
      null
    );
  };
  return (
    <nav className="bg-slate-800  px-2 sm:px-4 py-2.5 shadow-slate-500/50 shadow-xl">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <NavLink
          className="text-white flex self-center text-2xl mr-4 font-semibold whitespace-nowrap"
          to="/"
        >
          <span className="md:hidden">D_NFTs</span>
          <span className="hidden md:flex">Dspyt-NFTs</span>
        </NavLink>
        <div className="flex order-2 md:ml-12">
          <div className="block md:hidden mx-4">
            <Menu>
              <Menu.Button className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                <List
                  aria-hidden="true"
                  className="w-5 h-5 text-violet-200 hover:text-violet-100"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute origin-top-right mt-2 -ml-14 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div>
                    <Menu.Item>
                      <div className="w-full p-1 hover:bg-slate-600/20">
                        <NavLink
                          className={(isActive) =>
                            ` ${
                              isActive ? "text-black" : "text-gray-500"
                            } rounded-md p-2 hover:text-black/40 flex`
                          }
                          to="/"
                        >
                          <House
                            className="w-5 h-5 mr-4 my-auto"
                            aria-hidden="true"
                          />
                          Home
                        </NavLink>
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      <div className="w-full p-1 hover:bg-slate-600/20">
                        <NavLink
                          className={(isActive) =>
                            `${
                              isActive ? "text-black" : "text-gray-500"
                            } rounded-md p-2  hover:text-black/40 flex`
                          }
                          to="/upload"
                        >
                          <UploadSimple
                            className="w-5 h-5 mr-4 my-auto"
                            aria-hidden="true"
                          />
                          Upload
                        </NavLink>
                      </div>
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          {!currentUser ? (
            <button
              onClick={() => ConnectWallet()}
              className="bg-black transition-all hover:bg-black/60 text-white font-bold p-2 rounded-md"
            >
              Connect
            </button>
          ) : (
            <Menu>
              <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                {currentUser.accountId}
                <CaretDown
                  aria-hidden="true"
                  className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute origin-top-right w-44 mt-10 ml-12 md:-ml-8 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div>
                    <Menu.Item>
                      <div className="text-gray-900 p-1 group flex border-b-2 transition items-center justify-between  w-full px-2 py-2 text-sm">
                        <span className="text-xl font-bold mr-2 my-auto">
                          Ⓝ
                        </span>
                        <span className="mt-1">
                          {(
                            Number(currentUser.balance) / Math.pow(10, 24)
                          ).toFixed(3)}
                        </span>
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            wallet.signOut();
                            window.location.replace(
                              window.location.origin + window.location.pathname
                            );
                          }}
                          className={`${
                            active
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
              </Transition>
            </Menu>
          )}
        </div>

        <div className="hidden md:block">
          <ul className="flex my-auto flex-row md:space-x-8 md:text-sm font-medium">
            <li>
              <NavLink
                className={(isActive) =>
                  `hover:bg-slate-600/20 ${
                    isActive ? "text-white" : "text-gray-500"
                  } rounded-md p-2 hover:text-white/40`
                }
                to="/"
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                className={(isActive) =>
                  `hover:bg-slate-600/20 ${
                    isActive ? "text-white" : "text-gray-500"
                  } rounded-md p-2 hover:text-white/40`
                }
                to="/upload"
              >
                Upload
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
