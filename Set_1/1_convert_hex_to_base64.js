'use strict';

const assert = require('assert');

const input = "49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d";
const inputBase64 = Buffer.from(input, 'hex').toString('base64');
const shouldBe = "SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t";

assert.equal(inputBase64, shouldBe);