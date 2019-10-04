'use strict';

const { readFilefy, decipher_aes_128_cbc } = require('../3tools');


const main = async _ => {
    try {
        const base64 = await readFilefy('./10.txt', 'utf8');
        const cipherText = Buffer.from(base64, 'base64');
        const clearText = decipher_aes_128_cbc(cipherText, 'YELLOW SUBMARINE', Buffer.alloc(16));
        console.log(clearText.toString('utf8'));
    } catch (err) {
        console.log(err);
    }
}

main();