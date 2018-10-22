'use strict';

const { readFile } = require('fs');
const { promisify } = require('util');
const readFilefy = promisify(readFile);

const XOR_buffers = (b1, b2) => {
    const resArray = Object.entries(b1).map( ([key, value]) => value ^ b2[key] );
    const resBuf = Buffer.from(resArray, 'hex');
    return resBuf;
}

const generateTestBuffer = (input, len) => {
    const res = [];
    for(const elem of input) {
        const test = Buffer.from(elem.repeat(len).slice(0, len), 'ascii');
        res.push(test);
    }
    return res;
}

const XOR_listBuffers = (data, listTest) => {
    const res = [];
    for(const line of data) {
        for(const test of listTest) {
            const xored = XOR_buffers(line, test).toString("ascii");
            res.push(xored);
        }
    }
    return res;
}

const getCharFreq = input_str => {
    const str = input_str.toLowerCase();
    const charFreq = new Map([
        ['a', 0.08167], ['b', 0.01492], ['c', 0.02782], ['d', 0.04253],
        ['e', 0.12702], ['f', 0.02228], ['g', 0.02015], ['h', 0.06094],
        ['i', 0.06094], ['j', 0.00153], ['k', 0.00772], ['l', 0.04025],
        ['m', 0.02406], ['n', 0.06749], ['o', 0.07507], ['p', 0.01929],
        ['q', 0.00095], ['r', 0.05987], ['s', 0.06327], ['t', 0.09056],
        ['u', 0.02758], ['v', 0.00978], ['w', 0.02360], ['x', 0.00150],
        ['y', 0.01974], ['z', 0.00074], [' ', 0.13000]
    ]);
    let sum = 0;
    for(const char of str.split('')) {
        if(char > 31 || char < 127) {
            if(charFreq.has(char)) {
                sum += charFreq.get(char);
            } else {
                sum += 0.0001;
            }
        }
    }
    return sum;
}

const alphabet = [...Array(127)].map( (value, key) => String.fromCharCode(key));

const getLines = async fileName => (await readFilefy(fileName, 'utf8')).split('\n').map( line => Buffer.from(line, 'hex'));

const sortReadable = input => {
    const freq = input.map( line => { return { line, sum: getCharFreq(line) } });
    const filtered = freq.filter( elem => elem.sum > 0);
    const sorted = filtered.sort( (a, b) => a.sum - b.sum);
    return sorted.map( elem => elem.line);
}

module.exports = {
    XOR_buffers,
    getCharFreq,
    XOR_listBuffers,
    generateTestBuffer,
    alphabet,
    getLines,
    sortReadable
}