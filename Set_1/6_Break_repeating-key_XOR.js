'use strict';

const assert = require('assert');
const range = require('rangex');
const { readFilefy, hammingDistance, chunkBuffer, transposeBlocks, breakSingleByteXOR, XOR_buffers } = require('../3tools');

const testHamming = _ => {
    const buffer1 = Buffer.from("this is a test", "ascii");
    const buffer2 = Buffer.from("wokka wokka!!!", "ascii");
    const distance = hammingDistance(buffer1, buffer2);
    return distance == 37;
}

const getHammingForBuffers = chunks => { //find easier solution!
    const bufferTemp = Array.from(chunks);
    let sumHammingDistance = 0;
    let loops = 0;
    while(bufferTemp.length >= 2) {
        sumHammingDistance += hammingDistance(...bufferTemp.splice(0, 2));
        loops += 1;
    }
    return sumHammingDistance / loops;
}

const main = async _ => {
    try {
        //step 0 - read file, decode from base64
        const base64 = await readFilefy('./6.txt', 'utf8');
        const cipher = Buffer.from(base64, 'base64');

        //step 1 - list of possible keySizes
        const listKeySize = range(2, 41);

        //step 2 - test they function for hammingDistance works
        assert(testHamming());

        //step 3/4 - take the firt keylength. use it for dividing the cipher in chunks, for each couple calculate
        //the hamming distance. Then sum each result and normalize dividing for keySize.
        //Do this for each keyLength. The keylength with the lowest sum is probably the right one
        const listHamming = [];
        for(const keySize of listKeySize) {
            const chunks = chunkBuffer(cipher, keySize);
            let normalizedHamming = getHammingForBuffers(chunks) / keySize;
            listHamming.push({ size: keySize, hamming: normalizedHamming });
        }
        const { size, hamming } = listHamming.sort((a, b) => a.hamming - b.hamming).slice(0, 1)[0];

        //step 5 chunk the cipher with the right keysize
        const chunks = chunkBuffer(cipher, size);

        //step 6 transpose chunks
        const transposed = transposeBlocks(chunks);

        //step 7 break each new block with breakSingleByteXOR;
        let key = '';
        for(const block of transposed) {
            const res = breakSingleByteXOR(Buffer.from(block.join(''), 'ascii'));
            key += res.key;
        }
        console.log("key:", key)

        //step 8 break the cipher with the whole key!
        const keyToDecrypt = Buffer.alloc(cipher.length, key, "ascii");
        const xored = XOR_buffers(cipher, keyToDecrypt);
        console.log(xored.toString("ascii"))

    } catch (err) {
        console.log(err);
    }
}

main();