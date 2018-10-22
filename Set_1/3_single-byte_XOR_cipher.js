'use strict';

const { XOR_listBuffers, alphabet, sortReadable, generateTestBuffer } = require('../tools');

const input = Buffer.from("1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736", 'hex');

const listTest = generateTestBuffer(alphabet, input.length);
const xored = XOR_listBuffers([input], listTest);
const res = sortReadable(xored).slice(-1);
console.log(res);