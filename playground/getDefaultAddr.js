const utils = require('../blockchain/utils');

var key = utils.loadKey('default','public',true);
console.log(utils.getAddress(key));
