import type { NextApiRequest, NextApiResponse } from "next";
import { Orbis } from "@orbisclub/orbis-sdk";

let orbis = new Orbis();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { address } = req.query;

    var username = "";
    var pfp = "/IconLarge.png";
    var cover = "/back.png";
    var description = "";
    var followers = "";
    var following = "";

    let { data } = await orbis.getDids(address);

    if (data[0].address !== undefined) {
      username = data[0].details.profile?.username;
      pfp = data[0].details.profile?.pfp;

      if (
        typeof data[0].details.profile?.cover === "string" &&
        data[0].details.profile?.cover !== ""
      ) {
        cover = data[0].details.profile?.cover;
      }

      description = data[0].details.profile?.description;
      followers = data[0].details.count_followers;
      following = data[0].details.count_following;
    }

    res.status(200).json({
      address: address,
      username: username,
      pfp: pfp,
      cover: cover,
      description: description,
      followers: followers,
      following: following,
    });
  } catch (err) {
    res.status(500).send({ error: "failed to fetch data" + err });
  }
}
