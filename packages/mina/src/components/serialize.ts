import { Field, MerkleMap, MerkleTree } from 'o1js';

export function serializeMerkleMapToJson(merkleMap: MerkleMap): string {
  const serializedData: { [key: number]: string } = {};

  // Iterate through the Merkle Map to convert each key-value pair to JSON
  for (let i = 0; i < 256; i++) {
    const key: Field = Field(i);
    const value: string = merkleMap.get(key).toString();

    serializedData[i] = value;
  }

  return JSON.stringify(serializedData);
}

export function deserializeJsonToMerkleMap(serializedJson: string): MerkleMap {
  const deserializedMerkleMap: MerkleMap = new MerkleMap();

  const deserializedData: { [key: string]: string } =
    JSON.parse(serializedJson); // Parse the serialized JSON into an object

  // Iterate through the deserialized data and add key-value pairs to the Merkle Map
  for (let i = 0; i < 256; i++) {
    if (deserializedData[i] !== '0') {
      const key: Field = Field(i);

      const value: Field = Field(deserializedData[i]); // Assuming the JSON contains string representations of the original values

      deserializedMerkleMap.set(key, value);
    }
  }

  return deserializedMerkleMap;
}

export function serializeMerkleTreeToJson(merkleTree: MerkleTree): string {
  const serializedData: { [key: number]: string[] } = {};
  const height: number = merkleTree.height;

  // Iterate through the Merkle Tree to convert each key-value pair to JSON
  for (let level = 0; level < height - 1; level++) {
    const maxLeaf: number = 2 ** level;
    const levelData: string[] = [];
    for (let key = 0; key < maxLeaf; key++) {
      const value: string = merkleTree.getNode(level, BigInt(key)).toString();
      levelData.push(value);
    }
    serializedData[level] = levelData;
  }

  return JSON.stringify(serializedData);
}
