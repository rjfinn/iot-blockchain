'use strict';
const r = require('jsrsasign');
const ec = new r.ECDSA({ 'curve': 'secp256k1' });
const crypto = require('crypto');
const fs = require('fs');

const keystore = './keystore';
const hash_algo = 'sha256';
const sign_algo = 'SHA256withECDSA';
const addr_algo = 'ripemd160';
const curve = 'secp256k1';
const decimalPlaces = 5;

const hash = (text, algo = hash_algo) => {
  return crypto.createHash(algo)
    .update(text)
    .digest('hex')
    .toString();
};

const timestamp = () => {
  return new Date(new Date().toUTCString()).valueOf();
}

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
    var privKey = crypto.createECDH(curve).setPrivateKey(key,'hex');
    return privKey;
  }
  return key;
};

const sign = (privateKey, data) => {
  var key = stringToKey(privateKey);
  var sig = new r.Signature({ "alg": sign_algo });
  sig.init({ d: key.getPrivateKey('hex'), curve: curve });
  sig.updateString(data);
  return sig.sign();
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

const hashTransaction = (sender, recipient, amount = 0.0, data = null) => {
  var hashed_txn = transactionToString(sender, recipient, amount, data);
  return hash(hashed_txn);
};

const getAddress = (key) => {
  if(typeof key !== 'string') {
    key = getPublicKey(key, true);
  }
  var addr = hash(key, addr_algo);
  return addr;
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
  timestamp,
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
  hashTransaction,
  getAddress,
  saveKeys,
  loadKey
};
