import { Field, MerkleMap, MerkleTree, Poseidon } from 'o1js';

type Data = {
  [key: number]: string;
};

export function serializeMerkleMapToJson(merkleMap: MerkleMap): string {
  const serializedData: Data = {};
  for (let i = 0; i < 256; i++) {
    const key: Field = Field(i);
    const value: string = merkleMap.get(key).toString();
    serializedData[i] = value;
  }
  return JSON.stringify(serializedData);
}

export function deserializeJsonToMerkleMap(serializedJson: string): MerkleMap {
  const deserializedMerkleMap: MerkleMap = new MerkleMap();
  const deserializedData: Data = JSON.parse(serializedJson);
  for (let i = 0; i < 256; i++) {
    let data = deserializedData[i];
    if (data !== '0') {
      const key: Field = Field(i);
      const value: Field = Field(data);
      deserializedMerkleMap.set(key, value);
    }
  }
  return deserializedMerkleMap;
}

export function serializeMerkleTreeToJson(merkleTree: MerkleTree): string {
  const serializedData: Data = {};
  const leafCount: bigint = merkleTree.leafCount;
  for (let index = 0; index < leafCount; index++) {
    const value: string = merkleTree.getNode(0, BigInt(index)).toString();
    serializedData[index] = value;
  }
  return JSON.stringify(serializedData);
}

export function getZerosMerkleTree(height: number): Field[] {
  if (height < 1) {
    throw Error('height starts at 1');
  }
  const zeroes: Field[] = new Array(height);
  zeroes[0] = Field(0);
  for (let i = 1; i < height; i += 1) {
    zeroes[i] = Poseidon.hash([zeroes[i - 1], zeroes[i - 1]]);
  }
  return zeroes;
}

export function deserializeJsonToMerkleTree(
  serializedJson: string
): MerkleTree {
  const deserializedData: Data = JSON.parse(serializedJson);
  const leafCount: number = Object.keys(deserializedData).length;
  const height: number = Math.log2(Number(leafCount)) + 1;
  const merkleTree: MerkleTree = new MerkleTree(height);
  const defaultValue: string =
    getZerosMerkleTree(height)[height - 1].toString();
  for (let index = 0; index < leafCount; index++) {
    let iterValue: string = deserializedData[index];
    if (defaultValue === iterValue) {
      merkleTree.setLeaf(BigInt(index), Field(iterValue));
    }
  }
  return merkleTree;
}

export function deserializeJsonToMerkleTreeFull(
  serializedJson: string
): MerkleTree {
  const serializedData: Data = JSON.parse(serializedJson);
  const height: number = Object.keys(serializedData).length;
  const merkleTree: MerkleTree = new MerkleTree(height);
  let currentIndex: number = 0;
  for (let level = 0; level < height; level++) {
    const maxLeaf: number = 2 ** level;
    for (let index = 0; index < maxLeaf; index++) {
      let value: Field = Field(serializedData[level][index]);
      merkleTree.setLeaf(BigInt(index), value);
      currentIndex++;
    }
  }
  return merkleTree;
}
