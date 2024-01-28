import { parseCidDweb, parseCidNFTStorage } from "@/services/parseCid";

export async function fetchJson(resURL: string, resURL2: string) {
  let item;
  try {
    item = await fetch(resURL).then((x) => x.json());
  } catch {
    item = await fetch(resURL2).then((x) => x.json());
  }
  return item;
}

export async function fetchImageUrls(resURL: string, resURL2: string) {
  let image = "https://pinsave.app/PinSaveCard.png";
  try {
    await fetch(resURL);
    image = resURL;
  } catch {
    try {
      await fetch(resURL2);
      image = resURL2;
    } catch (e) {
      return image;
    }
  }
  return image;
}

export async function parseString(result: string) {
  var resURL = "";
  var resURL2 = "";
  if (result) {
    if (result.charAt(0) === "i") {
      resURL = parseCidNFTStorage(result);
      resURL2 = parseCidDweb(result);
    }
    if (result.charAt(0) === "h") {
      resURL = result;
      resURL2 = result;
    }
  }
  return [resURL, resURL2];
}

export async function fetchMetadata(result: string) {
  const [resURL, resURL2] = await parseString(result);
  const item = await fetchJson(resURL, resURL2);
  return item;
}

export async function fetchImage(result: string) {
  const [resURL, resURL2] = await parseString(result);
  const item = await fetchImageUrls(resURL, resURL2);
  return item;
}

export async function fetchDecodedPost(result: string) {
  try {
    const item = await fetchMetadata(result);

    try {
      const decoded_image = await fetchImage(item.image);
      const output = {
        ...item,
        image: decoded_image,
      };
      return output;
    } catch (e) {
      console.log(e);
      return {
        ...item,
        image: "/PinSaveCard.png",
      };
    }
  } catch (e) {
    console.log(e);
    return {
      name: "Failed",
      description: "F for Failure",
      image: "/PinSaveCard.png",
    };
  }
}
