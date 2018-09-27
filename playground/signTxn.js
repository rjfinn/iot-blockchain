const utils = require('../blockchain/utils');

var addr = "20acf79ea97b6de20686109562ae178d55b499dc";
var recipient = "bbd38a319fac9474318c14603b985fd50b8e5909";  // default
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
