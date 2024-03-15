export function generateIntegersArray(n: number) {
  let integersArray = [];
  for (let i = 0; i < n; i++) {
    integersArray.push(i);
  }
  return integersArray;
}

export function generateIntegersArrayIncluding(n: number) {
  return generateIntegersArray(n + 1);
}
