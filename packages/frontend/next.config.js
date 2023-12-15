/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.nftstorage.link",
      },
    ],
    minimumCacheTTL: 31536000,
  },
};

module.exports = nextConfig;
