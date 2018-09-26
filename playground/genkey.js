const utils = require('../blockchain/utils');

var key = utils.createPrivateKey();
utils.saveKeys(key);
