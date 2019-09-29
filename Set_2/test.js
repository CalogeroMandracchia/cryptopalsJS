// https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_.28CBC.29
var crypto = require('crypto');
var fs = require('fs');

var BLOCK_SIZE = 16;
var KEY = 'YELLOW SUBMARINE';

var file = fs.readFileSync('./Set_2/10.txt').toString().split('\n').join('');
var input = Buffer.from(file, 'base64');

var iv = Buffer.alloc(BLOCK_SIZE);
iv.fill(0);


function pad(input, length){
  input = Buffer.from(input);
  if (input.length % length === 0){
    return input;
  }

  var padLength = length - (input.length % length);
  var result = Buffer.alloc(input.length + padLength);
  result.fill(padLength);
  input.copy(result);
  return result;
}

function encrypt(data){
  var padded = pad(data, BLOCK_SIZE);
  var chunks = chunk(padded);
  var result = [];
  for (var i = 0; i < chunks.length; i++){
    var blockA = chunks[i];
    var blockB = i === 0 ? iv : result[i - 1];
    var xored = xor(blockA, blockB);
    var encipher = crypto.createCipheriv('AES-128-ECB', KEY, '');
    // var encipher = crypto.createCipher('AES-128-ECB', KEY);
    encipher.setAutoPadding(false);
    var block = encipher.update(xored);
    block = Buffer.concat([block, encipher.final()]);
    result.push(block);
  }
  return Buffer.concat(result);
}

function decrypt(data){
  var chunks = chunk(data);
  var result = [];
  for (var i = 0; i < chunks.length; i++){
    var blockA = chunks[i];
    var blockB = i===0 ? iv : chunks[i - 1];
    // var decipher = crypto.createDecipher('AES-128-ECB', KEY);
    var decipher = crypto.createDecipheriv('AES-128-ECB', KEY, '');
    decipher.setAutoPadding(false);
    var block = decipher.update(blockA);
    var xored = xor(blockB, Buffer.concat([block, decipher.final()]));

    result.push(xored);
  }
  return Buffer.concat(result);
}

function chunk(data){
  var chunks = [];
  for (var i = 0; i < data.length; i += BLOCK_SIZE){
    chunks.push(data.slice(i, i + BLOCK_SIZE));
  }
  return chunks;
}

function xor(a, b){
  if (a.length !== b.length) throw 'Length mismatch';
  var result = Buffer.alloc(a.length);
  for (var i = 0; i < a.length; i++){
    result[i] = a[i] ^ b[i];
  }
  return result;
}

// var encrypted = encrypt('the quick brown fox jumped over the lazy dog abcdefghijklmnopqrstuvwxyz');
// console.log(encrypted, encrypted.toString('base64'));
// var decrypted = decrypt(encrypted);
// console.log(decrypted.toString());

var output = decrypt(input);
console.log(output.toString());
var cbc = crypto.createDecipheriv('AES-128-CBC', KEY, iv);
cbc.setAutoPadding(false);

// SANITY CHECK
var out = cbc.update(input);
var buf = Buffer.concat([out, cbc.final()]);
console.log(buf.equals(output));