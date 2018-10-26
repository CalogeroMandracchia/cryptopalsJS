'use strict';

const assert = require('assert');
const { readFilefy, detectSingleCharXOR } = require('../tools_old');

const main = async _ => {
    try {
        const data = (await readFilefy('./Set_1/4.txt', 'utf8'))
                    .split('\n')
                    .map( line => Buffer.from(line, 'hex'));

        const { key, line, sum } = detectSingleCharXOR(data, data[0].length);
        const shouldBe = "Now that the party is jumping\n";
        assert.equal(line, shouldBe);
    } catch(err) {
        console.log(err);
    }
}

main();