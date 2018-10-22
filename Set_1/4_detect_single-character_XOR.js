'use strict';

const { XOR_listBuffers, generateTestBuffer, alphabet, getLines, sortReadable } = require('../tools');

const main = async _ => {
    try {
        const data = await getLines('./4.txt');
        const listTest = generateTestBuffer(alphabet, data[0].length);
        const xored = XOR_listBuffers(data, listTest);
        const res = sortReadable(xored).slice(-1);
        console.log(res);
    } catch(err) {
        console.log(err);
    }
}

main();