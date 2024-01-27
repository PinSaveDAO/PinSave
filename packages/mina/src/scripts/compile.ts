import { VerificationKey } from 'o1js';

import { MerkleMapContract } from '../NFTsMapContract.js';

console.time('compile');

let verificationKey: VerificationKey;

await MerkleMapContract.compile();

console.timeEnd('compile');

console.time('compile 2');
({ verificationKey } = await MerkleMapContract.compile());
console.timeEnd('compile 2');

console.time('compile 3');
({ verificationKey } = await MerkleMapContract.compile());
console.timeEnd('compile 3');

console.log(verificationKey.data);

console.log(verificationKey.hash.toString());
