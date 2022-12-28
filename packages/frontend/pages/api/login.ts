import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "utils/session";
import type { User } from "utils/session";

import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const username = await req.body;

  try {
    const user = { isLoggedIn: true, login: username } as User;
    req.session.user = user;
    await req.session.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
