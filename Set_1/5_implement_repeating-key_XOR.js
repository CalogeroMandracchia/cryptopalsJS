'use strict';

const assert = require('assert');
const { XOR_buffers } = require('../3tools');

const input = Buffer.from("Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal", 'ascii');
const shouldBe = Buffer.from("0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f", "hex");

const keyToEncrypt = Buffer.alloc(input.length, "ICE", "ascii");
const xored = XOR_buffers(input, keyToEncrypt);

assert(xored.equals(shouldBe));