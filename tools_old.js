'use strict';

const { readFile } = require('fs');
const { promisify } = require('util');
const range = require('rangex');
const readFilefy = promisify(readFile);

const XOR_buffers = (b1, b2) => {
    const resArray = Object.entries(b1).map( ([key, value]) => value ^ b2[key] );
    const resBuf = Buffer.from(resArray, 'hex');
    return resBuf;
}

const XOR_bins = (b1, b2) => {
    const resArray = Object.entries(b1).map( ([key, value]) => value ^ b2[key] );
    return resArray;
}

const generateTestBuffer = (input=Array, len=Number) => {
    // dato un array di simboli e la lunghezza
    // crea un array di buffer (da stinghe tipo aaaa, bbbb, cccc, ...)
    const res = {};
    for(const elem of input) {
        const str = elem.repeat(len).slice(0, len);
        const test = Buffer.from(str, 'ascii');
        res[elem] = test;
        //res.push(test);
    }
    return res;
}

const XOR_listBuffers = (data=Array[Buffer], listTest=Array[Buffer]) => {
    const res = [];
    for(const line of data) {  // per un array di buffer (stringhe da decodificare)
        for(const [key, test] of Object.entries(listTest)) {  // per un array di buffer (aaaa, bbbb, cccc, ...)
            const xored = XOR_buffers(line, test);
            res.push({ key, line:xored});
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
        ['y', 0.01974], ['z', 0.00074], [' ', 0.12800]
    ]);
    let sum = 0;
    const validChars = [...range(31, 128), 10, 11, 13];
    for(const char of str.split('')) {
        if(validChars.some(index => index == char.charCodeAt() )) {
            if(charFreq.has(char)) {
                sum += charFreq.get(char);
            } else {
                sum  += 0.00001;
            }
        } else {
            sum  -= 0.0001;
        }
    }
    return sum;
}

const alphabet = [...Array(127)].map( (value, key) => String.fromCharCode(key));

const getLines = async (fileName, format='hex') => (await readFilefy(fileName, 'utf8')).split('\n').map( line => Buffer.from(line, format));

const sortReadable = input => {
    const freq = input.map( ({key, line}) => { return { key, line, sum: getCharFreq(line) } });
    const filtered = freq.filter( ({sum}) => sum > 0);
    const sorted = filtered.sort( (a, b) => a.sum - b.sum);
    return sorted;
}

const XOR_key = (input, key) => {
    const listTest = generateTestBuffer(key, input[0].length);
    const xored = XOR_listBuffers(input, listTest);
    return xored;
}

const hexToBin = hex => {
    const hexPadded = hex.length % 2 == 1 ? '0' + hex : hex;
    let res = '';
    for(const byte of hexPadded.match(/.{1,2}/g)) {
        const amIodd = parseInt(byte, 16).toString(2);
        const change = amIodd.length % 8;
        if(change) {
            res += '0'.repeat(8 - change) + amIodd;
        } else {
            amIodd;
        }
    }
    return res;
}

const hammingDistance = (input1, input2) => {
    let buf1;
    let buf2;
    if(typeof str1 == 'string') {
        buf1 = Buffer.from(input1, 'ascii');
        buf2 = Buffer.from(input2, 'ascii');
    } else {
        buf1 = input1;
        buf2 = input2;
    }
    const bin1 = hexToBin(buf1.toString('hex'));
    const bin2 = hexToBin(buf2.toString('hex'));
    const res = XOR_bins(bin1, bin2);
    return res.reduce( (a,b) => a += b);
}

const splitArray = (list, chunkSize) => new Array(Math.ceil(list.length / chunkSize)).fill().map((_,i) => list.slice(i*chunkSize,i*chunkSize+chunkSize))

const tranposeArray = arr => {
    const transposed= [];
    for(const index of range(arr[0].length)) {
        const temp = []
        for(const array of arr) {
            if(array[index]) {
                temp.push((array[index]));
            }
        }
        transposed.push(temp);
    }
    return transposed;
}

const detectSingleCharXOR = (data=Array[Buffer], len=Number) => {
    const listTest = generateTestBuffer(alphabet, len);
    const xored = XOR_listBuffers(data, listTest);
    const xoredAscii = xored.map( ({key, line}) => { return { key, line: line.toString('ascii')} });
    const res = sortReadable(xoredAscii);
    return res[res.length - 1];
}

module.exports = {
    XOR_buffers,
    getCharFreq,
    XOR_listBuffers,
    generateTestBuffer,
    alphabet,
    getLines,
    sortReadable,
    XOR_key,
    hexToBin,
    XOR_bins,
    hammingDistance,
    readFilefy,
    splitArray,
    tranposeArray,
    detectSingleCharXOR
}