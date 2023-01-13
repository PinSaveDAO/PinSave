/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["evm.pinsave.app", "ipfs.io", "arweave.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ipfs.dweb.link",
      },
    ],
  },
};

module.exports = nextConfig;
