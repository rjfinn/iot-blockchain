'use strict';
const crypto = require('crypto');
const rsa = require('node-rsa');

const algo = 'sha256';
const bits = 1024;

const hash_block = (block) => {
  var block_string = JSON.stringify(block);
  return hash(block_string);
};

const hash = (text) => {
  return crypto.createHash(algo)
    .update(text)
    .digest('hex')
    .toString();
}

const createPrivateKey = (returnText = false) => {
  var key = new rsa(bits);
  key.generateKeyPair();
  if(returnText) {
    return key.exportKey('private');
  }
  return key;
};

const createPrivateKeyAsync = async (returnText = false) => {
  return Promise.resolve(createPrivateKey(returnText));
}

const getPublicKey = (privateKey, returnText = false) => {
  var key = new rsa(privateKey);
  if(returnText) {
    return key.exportKey('public');
  }
  return key;
};

// sign data with the private RSA key
const sign = (privateKey, data) => {
  if(typeof privateKey === 'string' || Buffer.isBuffer(privateKey)) {
    var key = new rsa(privateKey);
  } else {
    var key = privateKey;
  }
  if(key.isPrivate()) {
    return key.sign(Buffer.from(data,'utf8')).toString('hex');
  } else {
    throw('Cannot sign with a public key');
  }
}

// verfy signed data with the public key
const verify = (publicKey, data, signature) => {
  if(typeof privateKey === 'string' || Buffer.isBuffer(privateKey)) {
    var key = getPublicKey(publicKey, false);
  } else {
    var key = publicKey;
  }
  return key.verify(data,Buffer.from(signature,'hex'));
}

// use the first line of the public key as the address for this key pair
const getAddress = (key) => {
  if(typeof key !== 'string') {
    key = key.exportKey('public');
  }
  var publicArr = key.split('\n');
  return publicArr[1];
};

module.exports = {
  hash,
  hash_block,
  createPrivateKey,
  createPrivateKeyAsync,
  getPublicKey,
  sign,
  verify,
  getAddress
}
