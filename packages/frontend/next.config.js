/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["siasky.net", "evm.pinsave.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ipfs.dweb.link",
      },
    ],
  },
};

module.exports = nextConfig;
