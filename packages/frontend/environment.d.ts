export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_ESTUARY: string;
      NEXT_PUBLIC_PRIVATE_KEY: string;
      NEXT_PUBLIC_NFTPORT: string;
      NEXT_PUBLIC_LIVEPEER: string;
      NEXT_PUBLIC_TOKEN: string;
      NEXT_ALCHEMY_ID: string;
      ENV: "test" | "dev" | "prod";
    }
  }
}
