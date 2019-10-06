'use strict';

const { readFilefy, detect_AES_ECB } = require('../3tools');


const main = async _ => {
    try {
        const rawHex = await readFilefy('./8.txt', 'utf8');
        const hex = Buffer.from(rawHex.replace(/\n/g, ''), 'hex');
        const duplicates = detect_AES_ECB(hex);
        duplicates.length > 0 ? console.log(`aes-128-ecb detected`) : console.log(`aes-128-ecb not detected`);
    } catch (err) {
        console.log(err);
    }
}


main();