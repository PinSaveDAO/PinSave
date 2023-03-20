export function parseCidIpfsio(link: string): string {
  return link.replace("ipfs://", "https://ipfs.io/ipfs/");
}

export function parseCid(link: string): string {
  return link.replace("ipfs://", "");
}
