'use strict';

const { readFilefy } = require('../3tools');


const main = async _ => {
    try {
        const hex = await readFilefy('./8.txt', 'utf8');
        const chunks = hex.replace(/\n/g, '').match(/.{1,32}/g);
        const unique = new Set(chunks);
        if(chunks.length != unique.size)
            console.log(`aes-128-ecb detected`);
    } catch (err) {
        console.log(err);
    }
}

main();