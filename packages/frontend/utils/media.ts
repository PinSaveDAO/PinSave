export function IsNotMp4(id: string | undefined) {
  if (id?.slice(-3) === "mp4") {
    return false;
  }
  return true;
}
