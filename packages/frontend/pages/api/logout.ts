import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "utils/session";
import type { User } from "utils/session";
import { NextApiRequest, NextApiResponse } from "next";

export default withIronSessionApiRoute(logoutRoute, sessionOptions);

function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  req.session.destroy();
  res.json({ isLoggedIn: false, login: "" });
}
