import { kv, createClient } from "@vercel/kv";

export async function getVercelClient() {
  const isDev = process.env.NEXT_PUBLIC_ISDEV ?? "false";
  let client = kv;
  if (isDev === "true") {
    const url = process.env.NEXT_PUBLIC_REDIS_URL;
    const token = process.env.NEXT_PUBLIC_REDIS_TOKEN;
    client = createClient({
      url: url,
      token: token,
    });
  }
  return client;
}
