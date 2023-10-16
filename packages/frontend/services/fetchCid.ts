import { parseCidDweb, parseCidIpfsio } from "@/services/parseCid";

export async function fetchURLs(resURL: string, resURL2: string) {
  let item;
  try {
    item = await fetch(resURL).then((x) => x.json());
  } catch {
    item = await fetch(resURL2).then((x) => x.json());
  }
  return item;
}

export async function parseImage(result: string) {
  var resURL = "";
  var resURL2 = "";
  if (result) {
    if (result.charAt(0) === "i") {
      resURL = parseCidIpfsio(result);
      resURL2 = parseCidDweb(result);
    }
    if (result.charAt(0) === "h") {
      resURL = result;
      resURL2 = result;
    }
  }
  return [resURL, resURL2];
}
