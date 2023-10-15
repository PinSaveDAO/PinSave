export function parseCidIpfsio(link: string): string {
  return link?.replace("ipfs://", "https://ipfs.io/ipfs/");
}

export function parseCid(link: string): string {
  return link?.replace("ipfs://", "");
}

export function parseCidDweb(link: string): string {
  const cid = parseCid(link);

  const lastIndex = cid.lastIndexOf("/");
  const firstPart = cid.substring(0, lastIndex);
  const lastPart = cid.substring(lastIndex + 1);

  return "https://" + firstPart + ".ipfs.dweb.link/" + lastPart;
}

export function parseArweaveTxId(link: string): string {
  return link?.replace("ar://", "");
}
