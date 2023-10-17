export function checkType(id: string | undefined) {
  if (id?.slice(-3) === "mp4") {
    return true;
  }
  return false;
}
