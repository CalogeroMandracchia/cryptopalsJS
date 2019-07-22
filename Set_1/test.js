
const range = require('rangex');

const chunks = [ 
    Buffer.from("00010203", "hex"),
    Buffer.from("04050607", "hex"),
    Buffer.from("08090a0b", "hex")
];

const transposeBlocks = chunks => {
    const tr = [...range(chunks[0].length)].map( _ => [Buffer.alloc(chunks.length)]);
    for(let i=0; i<chunks.length; i++) {
        for(let n=0; n<chunks[i].length; n++) {
            console.log("n", tr[n][0]);


            const old = Buffer.from(tr[n][0], 'hex');
            
            const nuevo = Buffer.alloc(1, chunks[i][n], 'hex');


            console.log("old", old);
            console.log("new", nuevo);
            tr[n] = Buffer.concat([old, nuevo]);
        }
    }
    return tr;
}

console.log(transposeBlocks(chunks));