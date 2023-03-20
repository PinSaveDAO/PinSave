export function parseCid(link: string) {
  return link.replace("ipfs://", "https://ipfs.io/ipfs/");
}
