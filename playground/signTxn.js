const utils = require('../blockchain/utils');

var defaultKey = utils.loadKey();

var addr = "0b53802081c3fbc6193bce1e8f71d39f8c5de0bd";
// var recipient = "bbd38a319fac9474318c14603b985fd50b8e5909";  // default
var recipient = utils.getAddress(defaultKey);
var nonce = 1;
var amount = 1.0;
var data = {
  commands: [
    {setLED: "red"}
  ]
};

var key = utils.loadKey(addr,'private');
var signature = utils.signTransaction(key, nonce, recipient, amount, data);
console.log(signature);
