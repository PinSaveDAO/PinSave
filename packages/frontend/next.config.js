/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "evm.pinsave.app",
      "ipfs.io",
      "arweave.net",
      "estuary.tech",
      "dweb.link",
      "alchemy.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
