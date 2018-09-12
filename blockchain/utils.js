'use strict';
const r = require('jsrsasign');
const ec = new r.ECDSA({ 'curve': 'secp256k1' });
const crypto = require('crypto');
//const rsa = require('node-rsa');
const fs = require('fs');

const keystore = './keystore';
const hash_algo = 'sha256';
const sign_algo = 'SHA256withECDSA';
const curve = 'secp256k1';
const decimalPlaces = 5;
// const bits = 2048;

// const hash_block = (block) => {
//   var block_string = JSON.stringify(block);
//   return hash(block_string);
// };

const hash = (text) => {
  return crypto.createHash(hash_algo)
    .update(text)
    .digest('hex')
    .toString();
};

// const createPrivateKey = (returnText = false) => {
//   var key = new rsa({b: bits});
//   key.generateKeyPair();
//   if(returnText) {
//     return key.exportKey('private');
//   }
//   return key;
// };

const createPrivateKey = (returnText = false) => {
  const key = crypto.createECDH(curve);
  key.generateKeys();
  if(returnText) {
    return key.getPrivateKey('hex');
    //return key.getPrivateKey().toString('hex');
  }
  return key;
};

const getPrivateKeyText = (privateKey) => {
  return privateKey.getPrivateKey('hex');
};

const createPrivateKeyAsync = async (returnText = false, callback = null) => {
  //return Promise.resolve(createPrivateKey(returnText));
  var key = null;
  var err = null;
  try {
    key = await createPrivateKey(returnText);
  } catch(e) {
    err = e;
  }
  if(callback) {
    callback(key, err);
  } else {
    return key;
  }
};

const getPublicKey = (privateKey, returnText = true) => {
  var key = stringToKey(privateKey);
  if(returnText) {
    return key.getPublicKey('hex');
  }
  return key;
};

const stringToKey = (key) => {
  if(typeof key === 'string' || Buffer.isBuffer(key)) {
    //return new rsa(keyText);
    var privKey = crypto.createECDH(curve).setPrivateKey(key,'hex');
    return privKey;
  }
  return key;
};

// sign data with the private RSA key
// const sign = (privateKey, data) => {
//   var key = stringToKey(privateKey);
//   if(key.isPrivate()) {
//     return key.sign(Buffer.from(data,'utf8')).toString('hex');
//   } else {
//     throw('Cannot sign with a public key');
//   }
// };

const sign = (privateKey, data) => {
  var key = stringToKey(privateKey);
  // if(key.isPrivate()) {
    var sig = new r.Signature({ "alg": sign_algo });
    sig.init({ d: key.getPrivateKey('hex'), curve: curve });
    sig.updateString(data);
    return sig.sign();
  // } else {
  //   throw('Cannot sign with a public key');
  // }
};

const signAsync = async (privateKey, data, callback) => {
  var err = null;
  var signature = null;
  try {
    signature = await sign(privateKey, data);
  } catch(e) {
    err = e;
  }
  if(callback) {
    callback(signature, err);
  } else {
    return signature;
  }
};

// verfy signed data with the public key
// const verify = (publicKey, data, signature) => {
//   var key = stringToKey(publicKey);
//   return key.verify(data,Buffer.from(signature,'hex'));
// };

const verifySign = (publicKeyText, data, signature) => {
  var sig = new r.Signature({ "alg": sign_algo });
  sig.init({ xy: publicKeyText, curve: curve });
  sig.updateString(data);
  return sig.verify(signature);
};

const verifySignAsync = async (publicKeyText, data, signature, callback = null) => {
  var err = null;
  var verify = null;
  try {
    verify = await verifySign(publicKeyText, data, signature);
  } catch(e) {
    err = e;
  }
  if(callback) {
    callback(verify, err);
  } else {
    return verify;
  }
};

const transactionToString = (sender, recipient, amount = 0.0, data = null, signature = null) => {
  amount = Number.parseFloat(amount).toFixed(decimalPlaces);
  var data = {
    sender: sender,
    recipient: recipient,
    amount: amount,
    data: data
  };
  if(signature) {
    data.signature = signature;
  }
  return JSON.stringify(data);
};

const signTransaction = (privateKey, recipient, amount = 0.0, data = null) => {
  var key = stringToKey(privateKey);
  var txn_str = transactionToString(getAddress(key), recipient, amount, data);
  return sign(privateKey, txn_str);
};

const signTransactionAsync = async (privateKey, recipient, amount = 0.0, data = null, callback = null) => {
  var sign;
  var err;
  try {
    sign = await signTransaction(privateKey, recipient, amount, data);
  } catch(e) {
    err = e;
  }
  if(callback) {
    callback(sign, err);
  } else {
    return sign;
  }
};

const getAddress = (key) => {
  if(typeof key !== 'string') {
    key = getPublicKey(key, true);
  }
  //var publicArr = key.split('\n');
  //return publicArr[2].toString('hex');
  return key;
};

const saveKeys = (privateKey) => {
  var key = stringToKey(privateKey);
  var address = getAddress(key);

  var file_prefix = address;
  if(!fs.existsSync(`${keystore}/default.private.key`)) {
    file_prefix = 'default';
  }

  fs.writeFile(`${keystore}/${file_prefix}.private.key`,key.getPrivateKey('hex'), (err) => {
    if (err) throw err;
  });

  fs.writeFile(`${keystore}/${file_prefix}.public.key`,key.getPublicKey('hex'), (err) => {
    if (err) throw err;
  });

};

const loadKey = (address = 'default', type = 'private', returnText = false) => {
  var filename = `${keystore}/${address}.${type}.key`;
  if(fs.existsSync(filename)) {
    var keyText = fs.readFileSync(filename,'utf8');
    if(returnText) {
      return keyText;
    }
    return stringToKey(keyText);
  } else if(address === 'default') {
    var key = createPrivateKey();
    saveKeys(key);
    if(returnText) {
      return getPrivateKeyText(key);
    }
    return key;
  } else {
    throw('No keystore found for that address');
  }
};

module.exports = {
  hash,
  stringToKey,
  createPrivateKey,
  createPrivateKeyAsync,
  getPrivateKeyText,
  getPublicKey,
  sign,
  signAsync,
  verifySign,
  verifySignAsync,
  transactionToString,
  signTransaction,
  signTransaction,
  getAddress,
  saveKeys,
  loadKey
};
