import Link from 'next/link'
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { House, List, UploadSimple } from "phosphor-react";
import AuthButton from "../AuthButton";

function Navigation() {
  return (
    <nav className="bg-slate-800  px-2 sm:px-4 py-2.5 shadow-slate-500/50 shadow-xl">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <Link

          href="/"
          passHref
        >
          <a className="text-white flex self-center text-2xl mr-4 font-semibold whitespace-nowrap">
            <span className="md:hidden">D_NFTs</span>
            <span className="hidden md:flex">Dspyt-NFTs</span>
          </a>
        </Link>
        <div className="flex order-2 md:ml-12">
          <div className="block md:hidden mx-4">
            <Menu>
              <Menu.Button className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                <List
                  aria-hidden="true"
                  className="w-5 h-5 text-violet-200 hover:text-violet-100"
                />
              </Menu.Button>
              <Menu.Items className="absolute origin-top-right mt-2 -ml-14 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  <div className="w-full p-1 hover:bg-slate-600/20">
                    <Link
                      href="/"
                      passHref
                    >
                      <a className="text-black rounded-md p-2  hover:text-black/40 flex">
                        <House
                          className="w-5 h-5 mr-4 my-auto"
                          aria-hidden="true"
                        />
                        Home
                      </a>
                    </Link>
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div className="w-full p-1 hover:bg-slate-600/20">
                    <Link
                      href="/upload"
                      passHref
                    >
                      <a className="text-black rounded-md p-2  hover:text-black/40 flex">
                        <UploadSimple
                          className="w-5 h-5 mr-4 my-auto"
                          aria-hidden="true"
                        />
                        Upload
                      </a>
                    </Link>
                  </div>
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
          <AuthButton />
        </div>

        <div className="hidden md:block">
          <ul className="flex my-auto flex-row md:space-x-8 md:text-sm font-medium">
            <li>
              <Link
                className="hover:bg-slate-600/20 rounded-md p-2 hover:text-white/40"
                href="/"
              >
                <span className="text-white">
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link
                className="hover:bg-slate-600/20  rounded-md p-2 hover:text-white/40"
                href="/upload"
              >
                <span className="text-white">
                  Upload
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
