var input = '1c0111001f010100061a024b53535009181c'
var key = '686974207468652062756c6c277320657965'
var solution = '746865206b696420646f6e277420706c6179'

var a = new Buffer(input, 'hex')
var b = new Buffer(key, 'hex')

/*
var results = []

for (var i = 0; i < a.length; i++) {
  results.push(a[i] ^ b[i])
}

*/
const buffer_XOR = (b1, b2) => {
    const len = b1.length > b2.length ? b1.length : b2.length;
    console.log(`len: ${len}`);
    const buffer_xored = new Buffer(len);
    const res = Object.entries(b1).map( ([key, value]) => value ^ b2[key] );
    return res;
}

const results = buffer_XOR(a, b);



console.log('xor\'d matches solution: ' + results == new Buffer(solution, 'hex'))