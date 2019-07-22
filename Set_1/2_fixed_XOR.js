'use strict';

const assert = require('assert');
const { XOR_buffers } = require('../3tools');

const buffer1 = Buffer.from("1c0111001f010100061a024b53535009181c", 'hex');
const buffer2 = Buffer.from("686974207468652062756c6c277320657965", 'hex');
const shouldBe = Buffer.from("746865206b696420646f6e277420706c6179", 'hex');

const res = XOR_buffers(buffer1, buffer2);

assert(res.equals(shouldBe));