const expect = require('expect');
const rsa = require('node-rsa');

const {Blockchain} = require('./../blockchain/blockchain');
const utils = require('./../blockchain/utils');

var bc = new Blockchain();

var testText = "this is a test";
var key = utils.createPrivateKey();
var publicKey = utils.getPublicKey(key, true);
var sign = utils.sign(key, testText);
var keyText = utils.getPrivateKeyText(key);
var key2 = utils.stringToKey(keyText);
var loadedKey = utils.loadKey('default');
var txn = {
  sender: utils.getPublicKey(loadedKey),
  recipient: publicKey,
  amount: 1.0,
  data: 'device command tango'
};
txn.signature = utils.signTransaction(loadedKey, txn.recipient, txn.amount, txn.data);

describe('Cryotography utils', () => {
  it('should create a valid SHA-256 hash', () => {
    var hash = "2e99758548972a8e8822ad47fa1017ff72f06f3ff6a016851f45c398732bc50c";
    expect(utils.hash(testText)).toBe(hash);
  });

  it('should create a private key', (done) => {
    utils.createPrivateKeyAsync(false, (key, err) => {
      if(err) {
        done(err);
      } else {
        expect(key).toBeDefined();
        expect(key).not.toBeNull();
        expect(key.getPrivateKey).toBeDefined();
        done();
      }
    });
  });

  // it('should create a private key', () => {
  //   expect(key.getPrivateKey).toBeDefined();
  // });

  it('should export a public key', () => {
    expect(typeof publicKey).toBe('string');
  });

  it('should sign a piece of data', (done) => {
    expect(typeof sign).toBe('string');
    utils.verifySignAsync(publicKey, testText, sign, (verify, err) => {
      if(err) {
        done(err);
      } else {
        expect(verify).toBe(true);
        done();
      }
    });
  });

  it('should import a key from text', () => {
    expect(key2.getPrivateKey).toBeDefined();
    expect(utils.getPrivateKeyText(key2)).toBe(keyText);
    //expect(utils.sign(key2,data)).toBe(sign);
  });

  it('should consistently sign data', (done) => {
    utils.signAsync(key2, testText, (sign2, err) => {
      if(err) {
        done(err);
      } else {
        utils.verifySignAsync(publicKey, testText, sign2, (verify, err) => {
          if(err) {
            done(err);
          } else {
            expect(verify).toBe(true);
            done();
          }
        });
      }
    });
  });


  it('should load a keystore from the filesystem', () => {
    expect(loadedKey.getPrivateKey).toBeDefined();
  });

  it('should sign a transaction and return a string signature', (done) => {
    expect(typeof txn.signature).toBe('string');
    var sender = utils.getPublicKey(loadedKey);
    var txn_str = utils.transactionToString(sender, txn.recipient, txn.amount, txn.data);
    expect(typeof txn_str).toBe('string');
    //var txn_sign = utils.sign(loadedKey, txn_str);
    utils.verifySignAsync(sender, txn_str, txn.signature, (verify, err) => {
      if(err) {
        done(err);
      } else {
        expect(verify).toBe(true);
        done();
      }
    });
  });
});

describe('Create a blockchain', () => {
  it('should be using the current blockchain version', () => {
      expect(bc.blockVersion).toBe(0.1);
  });

  it('should create a blockchain with a genesis block', () => {
    expect(Array.isArray(bc.chain)).toBe(true);
    expect(bc.length).toBe(1);
    expect(bc.lastBlock.transactions.length).toBe(0);
  });

});

describe('Create transactions', () => {
  it('should create a new transaction', async () => {
    var block_txn = await bc.newTransaction(txn.sender, txn.recipient, txn.amount, txn.data, txn.signature);
    expect(block_txn.sender).toBe(txn.sender);
    expect(block_txn.amount).toEqual(txn.amount);
  });

  it('should include the new transaction in the current transactions list', () => {
    var last_transaction = bc.currentTransactions.slice(-1)[0];
    expect(last_transaction).toBeDefined();
    expect(last_transaction).toEqual(txn);
  });

  it('should include the transaction when mining a new block', (done) => {
    bc.mine((block, err) => {
      if(err) done(err);
      expect(bc.currentTransactions.length).toBe(0);
      expect(bc.lastBlock).toEqual(block);
      expect(bc.lastBlock.transactions.length).toBeGreaterThan(0);
      expect(bc.chain.length).toBeGreaterThan(1);
      done();
    });
  });

});

// describe('Create a transaction', () => {
//   it('should add a new trasaction to list, but not yet into the block', () {
//     var transaction = {
//     };
//   });
// });
