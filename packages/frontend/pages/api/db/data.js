import { createClient, kv } from "@vercel/kv";

export default async function handler(request, response) {
  //await users.set("user_1_session", "session_token_value");
  const user = await kv.get("user_1_session");

  return response.status(200).json({ user });
}
