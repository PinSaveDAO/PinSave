export function generateIntegersArray(n: number): number[] {
  let integersArray: number[] = [];
  for (let i = 0; i < n; i++) {
    integersArray.push(i);
  }
  return integersArray;
}

export function generateIntegersArrayIncluding(n: number): number[] {
  return generateIntegersArray(n + 1);
}
