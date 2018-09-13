const expect = require('expect');

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
var loadedKeyPublic = utils.getPublicKey(loadedKey);
var loadedKeySender = utils.getAddress(loadedKeyPublic);
var txn = {
  sender: loadedKeySender,
  recipient: publicKey,
  amount: 1.0,
  data: 'device command tango'
};
var hashed_txn = utils.hashTransaction(loadedKeySender, txn.recipient, txn.amount, txn.data);
txn.signature = utils.signTransaction(loadedKey, txn.recipient, txn.amount, txn.data);

describe('Cryotography utils', () => {
  it('should create a valid SHA-256 hash', () => {
    var hash = "2e99758548972a8e8822ad47fa1017ff72f06f3ff6a016851f45c398732bc50c";
    expect(utils.hash(testText)).toBe(hash);
  });
});

describe('Cryptography utils: keys', () => {
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

  it('should export a public key', () => {
    expect(typeof publicKey).toBe('string');
  });

  it('should generate an address from a key', () => {
    var addr = utils.getAddress(publicKey);
    expect(typeof addr).toBe('string');
    expect(addr).toHaveLength(40);
  });

  it('should import a key from text', () => {
    expect(key2.getPrivateKey).toBeDefined();
    expect(utils.getPrivateKeyText(key2)).toBe(keyText);
    //expect(utils.sign(key2,data)).toBe(sign);
  });

  it('should load a keystore from the filesystem', () => {
    expect(loadedKey.getPrivateKey).toBeDefined();
  });
});

describe('Cryptography utils: signing', () => {
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

  it('should sign a transaction and return a string signature', (done) => {
    expect(typeof txn.signature).toBe('string');
    var sender_pub = utils.getPublicKey(loadedKey);
    var sender_addr = utils.getAddress(sender_pub);
    var txn_str = utils.transactionToString(sender_addr, txn.recipient, txn.amount, txn.data);
    expect(typeof txn_str).toBe('string');
    //var txn_sign = utils.sign(loadedKey, txn_str);
    utils.verifySignAsync(sender_pub, txn_str, txn.signature, (verify, err) => {
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
    var block_txn = await bc.newTransaction(loadedKeyPublic, txn.recipient, txn.amount, txn.data, txn.signature);
    expect(block_txn.sender).toBe(txn.sender);
    expect(block_txn.data).toEqual(txn.data);
    expect(block_txn.id).toBe(hashed_txn);
  });

  it('should include the new transaction in the current transactions list', () => {
    var last_transaction = bc.currentTransactions.slice(-1)[0];
    // raw transaction does not include public key, timestamp, or id
    txn.publicKey = loadedKeyPublic;
    expect(last_transaction).toBeDefined();
    txn.timestamp = last_transaction.timestamp;
    txn.id = last_transaction.id;
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

  it('should find transactions by sender', async () => {
    var transactions = await bc.getTransactionsBySender(txn.sender);
    expect(transactions).toBeDefined();
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions[0].publicKey).toBe(loadedKeyPublic);
  });
});
