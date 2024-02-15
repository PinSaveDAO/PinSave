export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_ISDEV: string;
      NEXT_PUBLIC_BLOB: string;
      NEXT_PUBLIC_REDIS_URL: string;
      NEXT_PUBLIC_REDIS_TOKEN: string;
    }
  }
}
