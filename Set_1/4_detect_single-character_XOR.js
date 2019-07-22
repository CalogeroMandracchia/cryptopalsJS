'use strict';

const { readFilefy, breakSingleByteXOR } = require('../3tools');

const main = async _ => {
    try {
        const data = (await readFilefy('./4.txt', 'utf8'))
            .split('\n')
            .map(line => Buffer.from(line, 'hex'));

        const possibleDecrypted = data.map( line => breakSingleByteXOR(line) )

        //sort readable
        const filteredAndSorted = possibleDecrypted.filter(({ score }) => score > 0.5).sort((a, b) => a.score - b.score);
        const { key, score, line } = filteredAndSorted.slice(-1)[0];

        console.log(`key: ${key}, score: ${score}, line: ${line}`); // Key: 5, "Now that the party is jumping\n";
    } catch (err) {
        console.log(err);
    }
}

main();