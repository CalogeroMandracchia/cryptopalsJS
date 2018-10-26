'use strict';

const { hammingDistance, readFilefy, splitArray, tranposeArray } = require('../tools');
const { detectSingleCharXOR } = require('../tools');
const range = require('rangex');

const step3 = (cypher) => {
    const avgDistances = [];
    const numberGroups = 2;
    for(const keySize of range(2, 41)) {
        const chunks = splitArray(splitArray(cypher, keySize), numberGroups);
        const distances = [];
        for(const chunk of chunks) {
            if(!chunk[1]) continue;
            const distance = hammingDistance(chunk[0], chunk[1]) / keySize;
            distances.push(distance);
        }
        avgDistances.push({
            key: keySize,
            avg: distances.reduce( (a,b) => a + b) / distances.length
        });
    }
    return avgDistances;
}

const main = async _ => {
    try {
        //1_read file
        const base64 = await readFilefy('./Set_1/6.txt', 'utf8');
        const cypher = Buffer.from(base64, 'base64');

        //3 for all guess_keySize divide cypher, calculate edit distance and normalize
        const avgDistances = step3(cypher);

        const sorted = avgDistances.sort( (a, b) => a.avg - b.avg).slice(0, 5);
        
        for(const { key, avg } of Object.values(sorted)) {

            const chunks = splitArray(cypher, key);
            const transposed = tranposeArray(chunks.slice(0, -1));

            const res = detectSingleCharXOR(transposed, transposed.length);
            console.log(res.key, "-", res.line, "-", res.sum);
        }
        console.log(sorted);

    } catch(err) {
        console.log(err);
    }
}

main();