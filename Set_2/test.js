'use strict';

const { random, range } = require('../3tools');


const main = async _ => {
    try {
        let zeros = 0;
        let ones = 0;
        for(const index of range(1000)) {
            const res = await random(0, 10);
            if(res == 1) {
                ones += 1;
            } else {
                zeros += 1;
            }
        }

        console.log(`zeros: ${zeros}`);
        console.log(`ones: ${ones}`);
    } catch (err) {
        console.log(err);
    }
}

main();