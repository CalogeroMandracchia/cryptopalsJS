'use strict';

const { encryption_oracle, detect_AES_ECB, range } = require('../3tools');


const main = _ => {
    try {
        const clearText = Buffer.alloc(128, 128);
        
        let ecb = 0;
        for(const _ of range(500)) {
            const cipherText = encryption_oracle(clearText);
            if(detect_AES_ECB(cipherText)) {
                ecb++;
            }
        }
        console.log(`ECB: ${ecb}, CBC: ${500-ecb}`)
    } catch (err) {
        console.log(err);
    }
}

main();