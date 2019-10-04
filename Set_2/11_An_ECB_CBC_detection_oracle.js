'use strict';

const crypto = require('crypto');
const { readFilefy, decipher_aes_128_cbc } = require('../3tools');


const main = async _ => {
    try {
        const random_AES_key = crypto.randomBytes(16);
        const base64 = await readFilefy('./10.txt', 'utf8');
        const cipherText = Buffer.from(base64, 'base64');
        const clearText = decipher_aes_128_cbc(cipherText, 'YELLOW SUBMARINE', Buffer.alloc(16));
        console.log(clearText.toString('utf8'));
    } catch (err) {
        console.log(err);
    }
}

main();

const encryption_oracle = (clearText) => {
    try {
    const random_AES_key = crypto.randomBytes(16);
    const base64 = await readFilefy('./10.txt', 'utf8');
    const cipherText = Buffer.from(base64, 'base64');
    const clearText = decipher_aes_128_cbc(cipherText, 'YELLOW SUBMARINE', Buffer.alloc(16));
    console.log(clearText.toString('utf8'));
    } catch (err) {
        console.log(err);
    }
}

/*
Under the hood, have the function append 5-10 bytes (count chosen randomly) before the plaintext and 5-10 bytes after the plaintext.
Now, have the function choose to encrypt under ECB 1/2 the time, and under CBC the other half (just use random IVs each time for CBC).
Use rand(2) to decide which to use.
Detect the block cipher mode the function is using each time.
You should end up with a piece of code that, pointed at a block box that might be encrypting ECB or CBC, tells you which one is happening.
*/