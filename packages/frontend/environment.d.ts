export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_ISDEV: string;
      NEXT_PUBLIC_BLOB: string;
      NEXT_PUBLIC_REDIS_URL: string;
      NEXT_PUBLIC_REDIS_TOKEN: string;
      NEXT_PUBLIC_ESTUARY: string;
      NEXT_PUBLIC_PRIVATE_KEY: string;
      NEXT_PUBLIC_NFTPORT: string;
      NEXT_PUBLIC_LIVEPEER: string;
      NEXT_PUBLIC_TOKEN: string;
      NEXT_PUBLIC_ALCHEMY_ID: string;
      NEXT_APP_CLIENT_ID: string;
      NEXT_APP_REDIRECT_URI: string;
    }
  }
}
