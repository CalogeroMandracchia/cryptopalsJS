'use strict';

const { getListASCII, getMaskBytes, XOR_buffers, getCharFrequency } = require('../3tools');

const input = Buffer.from("1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736", 'hex');

//Generate list of test buffers
const charToMaskList = getListASCII().map(char => { return { char, mask: getMaskBytes(input.length, char, 'ascii') } });

//test the list generated with the input
const xoredList = charToMaskList.map(({ char, mask }) => { return { key: char, xored: XOR_buffers(input, mask) } })

//get sum of frequency of "readable" charcodes
const listMaybeReadable = xoredList.map(({ key, xored }) => { return { key, line: xored.toString('ascii'), score: getCharFrequency(xored) } });

//sort by most readable
const filteredAndSorted = listMaybeReadable.filter(({ score }) => score > 0.5).sort((a, b) => a.score - b.score);
const { key, score, line } = filteredAndSorted.slice(-1)[0]; 
//there are two keys, 'X' and 'x' but the 'x' needs a better "getCharFrequency" to be found, it's in the top 10 though :)
console.log(`key: ${key}, score: ${score}, line: ${line}`); // Cooking MC's like a pound of bacon
