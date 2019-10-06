'use strict';

const { randomBytes, createDecipheriv, createCipheriv } = require('crypto');
const { readFile } = require('fs');
const { promisify } = require('util');
const range = require('rangex');

const readFilefy = promisify(readFile);
const randomBytesfy = promisify(randomBytes);

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
        const decipher = createDecipheriv('aes-128-ecb', key, iv);
        decipher.setAutoPadding(false);
        const cleartext = Buffer.concat([decipher.update(cipherText), decipher.final()]);
        return cleartext;
    } catch (err) {
        console.log(err);
    }
}

const cipher_aes_128_ecb = (clearText, key, iv=null) => {
    try {
        const cipher = createCipheriv('aes-128-ecb', key, iv);
        cipher.setAutoPadding(false);
        const cleartext = Buffer.concat([cipher.update(clearText), cipher.final()]);
        return cleartext;
    } catch (err) {
        console.log(err);
    }
}

const PKCS7 = (clearText, blockDimension) => {
    try {
        if(blockDimension >= 256) throw error("block dimension is bigger than 255 byte");
        const padLength = blockDimension - clearText.length % blockDimension;
        const pad = Buffer.alloc(padLength, padLength, 'ascii');
        const padded = Buffer.concat([clearText, pad]);
        return padded;
    } catch (error) {
        throw error;
    }
}

const decipher_aes_128_cbc = (cipherText, key, iv=null) => {
    try {
        const cipherTextChunks = chunkBuffer(cipherText, 16);
        const clearText = [];
        for(const index of cipherTextChunks.keys()) {
            if(index == 0) {
                const maybeXored = decipher_aes_128_ecb(cipherTextChunks[index], key);
                const clearTextChunk = iv != null ? XOR_buffers(maybeXored, iv) : maybeXored;
                clearText.push(clearTextChunk);
                continue;
            }
            const xored = decipher_aes_128_ecb(cipherTextChunks[index], key);
            const clearTextChunk = XOR_buffers(xored, cipherTextChunks[index - 1])
            clearText.push(clearTextChunk);
        }
        return Buffer.concat(clearText);
    } catch (err) {
        console.log(err);
    }
}

const cipher_aes_128_cbc = (clearText, key, iv=null) => {
    try {
        const clearTextChunks = chunkBuffer(clearText, 16);
        const cipherText = [];
        for(const index of clearTextChunks.keys()) {
            if(index == 0) {
                const maybeXored = cipher_aes_128_ecb(clearTextChunks[index], key);
                const cipherTextChunk = iv != null ? XOR_buffers(maybeXored, iv) : maybeXored;
                cipherText.push(cipherTextChunk);
                continue;
            }
            const xored = XOR_buffers(cipherText[cipherText.length - 1], clearTextChunks[index])
            const ecb = cipher_aes_128_ecb(xored, key);
            cipherText.push(ecb);
        }
        return Buffer.concat(cipherText);
    } catch (err) {
        console.log(err);
    }
}

const random = (minimum, maximum) => {
    try {
        const distance = maximum - minimum;
	
        if(distance <= 0) throw new Error('low range is greater than high range');
        if(distance > 281474976710655) throw new Error('range is greater than 256^6-1');
        if(maximum > Number.MAX_SAFE_INTEGER) throw new Error('bigger than Number.MAX_SAFE_INTEGER');
    
        const getNumbers = distance => {
            if(distance < 256) return [1, 256];
            if(distance < 65536) return [2, 65536];
            if(distance < 16777216) return [3, 16777216];
            if(distance < 4294967296) return [4, 4294967296];
            if(distance < 1099511627776) return [5, 1099511627776];
            return [6, 281474976710656];
        }

        const [ maxBytes, maxDec ] = getNumbers(distance);
        const randomHex = parseInt(randomBytes(maxBytes).toString('hex'), 16);
        const result = Math.floor(randomHex / maxDec * (maximum - minimum + 1) + minimum);
        return result > maximum ? maximum : result;
    } catch(error) {
        console.log(error);
    }
}

const detect_AES_ECB = buffer => {
    try {
        const map = new Map();
        const duplicates = [];
        for(const chunk of chunkBuffer(buffer, 16)) {
            const strChunk = chunk.toString('hex');
            map.has(strChunk) ? duplicates.push(strChunk) : map.set(strChunk, true);
        }
        return duplicates.length > 0 ? duplicates : false;
    } catch (err) {
        console.log(err);
    }
}

const encryption_oracle = (clearText) => {
    try {
    const random_AES_key = randomBytes(16);
    const clearTextRandom = Buffer.concat([randomBytes(random(5, 10)), clearText, randomBytes(random(5, 10))]);
    const clearTextPadded = PKCS7(clearTextRandom, 16);

    return random(0, 1) ?
        cipher_aes_128_ecb(clearTextPadded, random_AES_key) :
        cipher_aes_128_cbc(clearTextPadded, random_AES_key, randomBytes(16));
    } catch (error) {
        throw error;
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
    cipher_aes_128_ecb,
    decipher_aes_128_cbc,
    cipher_aes_128_cbc,
    random,
    range,
    detect_AES_ECB,
    encryption_oracle
}