import { Field, MerkleMap } from 'o1js';

export function serializeMerkleMapToJson(merkleMap: MerkleMap): string {
  const serializedData: { [key: string]: string } = {};

  // Iterate through the Merkle Map to convert each key-value pair to JSON
  for (let i = 0; i < 256; i++) {
    const key = Field(i);
    const value = merkleMap.get(key).toString();

    serializedData[i] = value;
  }

  return JSON.stringify(serializedData);
}

export function deserializeJsonToMerkleMap(serializedJson: string): MerkleMap {
  const deserializedMerkleMap = new MerkleMap();

  const deserializedData = JSON.parse(serializedJson); // Parse the serialized JSON into an object

  // Iterate through the deserialized data and add key-value pairs to the Merkle Map
  for (let i = 0; i < 256; i++) {
    if (deserializedData[i] !== '0') {
      const key = Field(i);

      const value = Field(deserializedData[i]); // Assuming the JSON contains string representations of the original values

      deserializedMerkleMap.set(key, value);
    }
  }

  return deserializedMerkleMap;
}
