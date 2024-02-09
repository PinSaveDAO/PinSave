/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.nftstorage.link",
      },
      {
        protocol: "https",
        hostname: "pinsave.app",
      },
      {
        protocol: "https",
        hostname: "dspyt.com",
      },
    ],
    minimumCacheTTL: 31536000,
  },
};

module.exports = nextConfig;
