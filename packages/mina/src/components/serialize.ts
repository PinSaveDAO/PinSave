import { Field, MerkleMap, MerkleTree, Poseidon } from 'o1js';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { createWriteStream } from 'fs';

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
    let data = deserializedData[i];
    if (data !== '0') {
      const key: Field = Field(i);

      const value: Field = Field(data); // Assuming the JSON contains string representations of the original values

      deserializedMerkleMap.set(key, value);
    }
  }
  return deserializedMerkleMap;
}

export function serializeMerkleTreeToJsonFull(merkleTree: MerkleTree): string {
  const serializedData: { [key: number]: string[] } = {};
  const height: number = merkleTree.height;

  // Iterate through the Merkle Tree to convert each key-value pair to JSON
  for (let level = 0; level < height; level++) {
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

export function serializeMerkleTreeToJson(merkleTree: MerkleTree): string {
  const serializedData: { [index: number]: string } = {};
  const leafCount: bigint = merkleTree.leafCount;

  // Iterate through the Merkle Tree to convert each key-value pair to JSON
  for (let index = 0; index < leafCount; index++) {
    const value: string = merkleTree.getNode(0, BigInt(index)).toString();
    serializedData[index] = value;
  }

  return JSON.stringify(serializedData);
}

export function serializeMerkleTreeToJson2(
  merkleTree: MerkleTree
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a write stream to write the serialized data
    const stream = createWriteStream('serializedMerkleTree.json');

    let index = 0;
    const leafCount: bigint = merkleTree.leafCount;

    // Define the function to serialize a single data point
    const serializedData = (currentIndex: bigint): string => {
      if (index > 0) {
        stream.write(',');
      }
      const value: string = merkleTree.getNode(0, currentIndex).toString();
      return `"${index}": "${value}"`;
    };

    // Define serialization function for processing a chunk of data and writing to the stream
    const processChunk = () => {
      while (index < leafCount && stream.write(serializedData(BigInt(index)))) {
        index++;
      }
      if (index < leafCount) {
        stream.once('drain', processChunk); // Wait for the drain event to continue processing
      } else {
        stream.write('}'); // End of the JSON object
        stream.end();
        resolve('Serialization complete');
      }
    };

    stream.on('error', (error) => reject(error));
    stream.write('{'); // Start of the JSON object
    processChunk(); // Start processing the chunks
  });
}

export function serializeMerkleTreeToJsonFast(
  merkleTree: MerkleTree
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream('serializedMerkleTree.json', {
      highWaterMark: 16 * 1024,
    });
    const leafCount: number = Number(merkleTree.leafCount);
    let currentIndex = 0;
    const batchSize = 1000; // Size for processing

    stream.write('{'); // Start of the JSON object

    const writeNextBatch = () => {
      while (currentIndex < leafCount) {
        for (let i = 0; i < batchSize && currentIndex < leafCount; i++) {
          if (i > 0) {
            stream.write(',');
          }
          const value = merkleTree.getNode(0, BigInt(currentIndex)).toString();
          const serialized = `"${currentIndex}": "${value}"`;
          const isLastItem = currentIndex === leafCount - 1;
          stream.write(serialized + (isLastItem ? '}' : ''));
          currentIndex++;
        }

        if (currentIndex < leafCount) {
          // Schedule the next batch processing in the next tick to prevent stack overflow
          setImmediate(writeNextBatch);
          return;
        }
      }

      stream.end();
      resolve('Serialization complete');
    };

    stream.on('error', (error) => reject(error));
    writeNextBatch();
  });
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
  const deserializedData: { [index: number]: string } =
    JSON.parse(serializedJson); // Parse the serialized JSON into an object

  const leafCount: number = Object.keys(deserializedData).length;

  const height = Math.log2(Number(leafCount)) + 1;

  const merkleTree: MerkleTree = new MerkleTree(height);

  const defaultValue = getZerosMerkleTree(height)[height - 1].toString();

  for (let index = 0; index < leafCount; index++) {
    let iterValue = deserializedData[index];
    if (defaultValue === iterValue) {
      merkleTree.setLeaf(BigInt(index), Field(iterValue));
    }
  }

  return merkleTree;
}

export function deserializeJsonToMerkleTreeFull(
  serializedJson: string
): MerkleTree {
  const serializedData: { [key: number]: string[] } =
    JSON.parse(serializedJson);

  const height = Object.keys(serializedData).length;

  const merkleTree: MerkleTree = new MerkleTree(height);

  let currentIndex = 0;

  for (let level = 0; level < height; level++) {
    const maxLeaf: number = 2 ** level;
    for (let index = 0; index < maxLeaf; index++) {
      let value = Field(serializedData[level][index]);
      console.log(value.toBigInt());
      merkleTree.setLeaf(BigInt(index), value);
      currentIndex++;
    }
  }

  console.log(currentIndex);

  return merkleTree;
}
