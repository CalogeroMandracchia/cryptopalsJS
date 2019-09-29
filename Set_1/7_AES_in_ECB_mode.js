'use strict';

const { readFilefy, decipher_aes_128_ecb } = require('../3tools');


const main = async _ => {
    try {
        const base64 = await readFilefy('./7.txt', 'utf8');
        const cleartext = decipher_aes_128_ecb(Buffer.from(base64, 'base64'), 'YELLOW SUBMARINE');
        console.log(cleartext.toString('ascii'));
    } catch (err) {
        console.log(err);
    }
}

main();