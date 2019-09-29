'use strict';

const crypto = require('crypto');
const { readFile } = require('fs');
const { promisify } = require('util');
const range = require('rangex');

const readFilefy = promisify(readFile);

const XOR_buffers = (buffer1, buffer2) => {
    const xored = Buffer.alloc(buffer1.length, 0, 'hex');
    for (const index of buffer1.keys()) {
        xored[index] = buffer1[index] ^ buffer2[index];
    }
    return xored;
}

const getListASCII = _ => [...Array(127)].map((value, key) => String.fromCharCode(key));

const getMaskBytes = (length, pattern = 0, encoding = 'hex') => Buffer.alloc(length, pattern, encoding);

const getCharFrequency = buffer => {
    const charFreq = new Map([
        ['a', 0.08167], ['b', 0.01492], ['c', 0.02782], ['d', 0.04253],
        ['e', 0.12702], ['f', 0.02228], ['g', 0.02015], ['h', 0.06094],
        ['i', 0.06094], ['j', 0.00153], ['k', 0.00772], ['l', 0.04025],
        ['m', 0.02406], ['n', 0.06749], ['o', 0.07507], ['p', 0.01929],
        ['q', 0.00095], ['r', 0.05987], ['s', 0.06327], ['t', 0.09056],
        ['u', 0.02758], ['v', 0.00978], ['w', 0.02360], ['x', 0.00150],
        ['y', 0.01974], ['z', 0.00074], [' ', 0.12800]
    ]);

    const validChars = [10, 11, 13, ...range(31, 128)];
    let sum = 0;

    for (const byte of buffer) {
        if (!validChars.includes(byte)) {
            sum -= 0.0001;
            continue;
        }

        const char = String.fromCharCode(byte).toLowerCase();
        if (charFreq.has(char)) {
            sum += charFreq.get(char);
        } else {
            sum += 0.0001;
        }
    }
    return sum;
}

const breakSingleByteXOR = input => {
    const charToMaskList = getListASCII().map(char => { return { char, mask: getMaskBytes(input.length, char, 'ascii') } });
    const xoredList = charToMaskList.map(({ char, mask }) => { return { key: char, xored: XOR_buffers(input, mask) } })
    const sortedReadable = xoredList.map(({ key, xored }) => { return { key, line: xored.toString('ascii'), score: getCharFrequency(xored) } });
    const filteredAndSorted = sortedReadable.sort((a, b) => a.score - b.score);
    const decrypted = filteredAndSorted.slice(-1)[0]; 
    return decrypted;
}

const decimalToBinary = hex => parseInt(hex, 10).toString(2).padStart(8, '0');

const hammingDistance = (buffer1, buffer2) => {
    const binary1 = [...buffer1].map( hex => decimalToBinary(hex) ).join('');
    const binary2 = [...buffer2].map( hex => decimalToBinary(hex) ).join('');

    let xored = 0;
    for(const index in binary1) {
        xored += binary1[index] ^ binary2[index];
    }
    return xored;
}

const chunkBuffer = (buffer, size = 2) => {
    let bufferTemp = Buffer.from(buffer);
    const numberOfChunks = Math.floor(bufferTemp.length  / size);

    const chunks = [];
    for(const _ of range(numberOfChunks)) {
        const chunk = Buffer.from(bufferTemp.slice(0, size));
        bufferTemp = bufferTemp.slice(size)
        chunks.push(chunk);
    }
    return chunks;
}

const transposeBlocks = chunks => {
    const tr = [...range(chunks[0].length)].map( _ => [Buffer.alloc(chunks.length)]);
    for(let i=0; i<chunks.length; i++) {
        for(let n=0; n<chunks[i].length; n++) {
            tr[n][i] = Buffer.alloc(1, chunks[i][n], 'hex');
        }
    }
    return tr;
}

const decipher_aes_128_ecb = (cipherText, key, iv=null) => {
    try {
        const decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);
        decipher.setAutoPadding(false);
        const cleartext = Buffer.concat([decipher.update(cipherText), decipher.final()]);
        return cleartext;
    } catch (err) {
        console.log(err);
    }
}

const cipher_aes_128_ecb = (clearText, key, iv=null) => {
    try {
        const cipher = crypto.createCipheriv('aes-128-ecb', key, iv);
        const cleartext = Buffer.concat([cipher.update(clearText), cipher.final()]);
        return cleartext;
    } catch (err) {
        console.log(err);
    }
}

const PKCS7 = (block, totalDimension) => {
    try {
        const padDimension = totalDimension - block.length;
        const pad = Buffer.alloc(padDimension, padDimension, 'ascii');
        const padded = Buffer.concat([block, pad]);
        return padded;
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    XOR_buffers,
    getListASCII,
    getMaskBytes,
    getCharFrequency,
    readFilefy,
    breakSingleByteXOR,
    hammingDistance,
    chunkBuffer,
    transposeBlocks,
    PKCS7,
    decipher_aes_128_ecb,
    cipher_aes_128_ecb
}