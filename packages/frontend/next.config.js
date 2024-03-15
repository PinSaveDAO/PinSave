/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
      {
        source: "/:posts*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.nftstorage.link",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
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

export default nextConfig;
