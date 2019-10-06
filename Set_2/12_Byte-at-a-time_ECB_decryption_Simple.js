'use strict';

const { encryption_oracle_ECB } = require('../3tools');


const main = _ => {
    try {
        const random_AES_key = randomBytes(16);
        const tail = Buffer.from("Um9sbGluJyBpbiBteSA1LjAKV2l0aCBteSByYWctdG9wIGRvd24gc28gbXkg \
            aGFpciBjYW4gYmxvdwpUaGUgZ2lybGllcyBvbiBzdGFuZGJ5IHdhdmluZyBq \
            dXN0IHRvIHNheSBoaQpEaWQgeW91IHN0b3A/IE5vLCBJIGp1c3QgZHJvdmUgYnkK", 'base64');
        
        const clearText = Buffer.alloc(128, 128);
        const fullClearText = Buffer.concat([clearText, tail]);
        
        const cipherText = encryption_oracle_ECB(fullClearText, random_AES_key);
    } catch (err) {
        console.log(err);
    }
}

main();