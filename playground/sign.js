var r = require('jsrsasign');
var ec = new r.ECDSA({ 'curve': 'secp256k1' });

const crypto = require('crypto');
const bob = crypto.createECDH('secp256k1');
bob.generateKeys();
 prvhex = bob.getPrivateKey().toString('hex')
 pubhex = bob.getPublicKey().toString('hex')
console.log(prvhex)
console.log(pubhex)

msg1 = 123;

var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
sig.init({ d: prvhex, curve: 'secp256k1' });
sig.updateString(msg1);
var sigValueHex = sig.sign();

var sig = new r.Signature({ "alg": 'SHA256withECDSA' });
sig.init({ xy: pubhex, curve: 'secp256k1' });
sig.updateString(msg1);
var result = sig.verify(sigValueHex);
if (result) {
  console.log("valid ECDSA signature");
} else {
  console.log("invalid ECDSA signature");
}
