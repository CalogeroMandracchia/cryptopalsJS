'use strict';

const { PKCS7 } = require('../3tools');

const padded = PKCS7(Buffer.from("YELLOW SUBMARINE"), 20);
console.log(padded);