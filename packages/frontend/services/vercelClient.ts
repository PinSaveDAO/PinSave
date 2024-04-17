import { kv, createClient, type VercelKV } from "@vercel/kv";

export function getVercelClient(): VercelKV {
  const isDev = process.env.NEXT_PUBLIC_ISDEV ?? "false";
  if (isDev === "true") {
    const url: string = process.env.NEXT_PUBLIC_REDIS_URL;
    const token: string = process.env.NEXT_PUBLIC_REDIS_TOKEN;
    const client: VercelKV = createClient({
      url: url,
      token: token,
    });
    return client;
  }
  return kv;
}
