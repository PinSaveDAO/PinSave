/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["evm.pinsave.app", "ipfs.io", "arweave.net", "estuary.tech"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ipfs.dweb.link",
      },
    ],
  },
};

module.exports = nextConfig;
