'use strict';

const { readFilefy, chunkBuffer, decipher_aes_128_ecb, XOR_buffers } = require('../3tools');

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

const main = async _ => {
    try {
        const base64 = await readFilefy('./10.txt', 'utf8');
        const cipherText = Buffer.from(base64, 'base64');
        const key = 'YELLOW SUBMARINE'; 
        const iv = Buffer.alloc(16);
        const clearText = decipher_aes_128_cbc(cipherText, key, iv)
        console.log(clearText.toString('ascii'));
    } catch (err) {
        console.log(err);
    }
}

main();