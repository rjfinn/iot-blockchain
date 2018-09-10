const expect = require('expect');
const rsa = require('node-rsa');

const {Blockchain} = require('./../blockchain/blockchain');
const utils = require('./../blockchain/utils');

var bc = new Blockchain();

describe('Cryotography utils', () => {
  it('should create a valid SHA-256 hash', () => {
    var data = "this is a test";
    var hash = "2e99758548972a8e8822ad47fa1017ff72f06f3ff6a016851f45c398732bc50c";
    expect(utils.hash(data)).toBe(hash);
  });

  // it('should create a private key', async (done) => {
  //   var key = await utils.createPrivateKeyAsync();
  //   expect(key).toBeDefined();
  //   expect(key).not.toBeNull();
  //   expect(key.constructor.name).toBe('NodeRSA');
  //   done();
  // });
  it('should create a private key', () => {
    var key = utils.createPrivateKey();
    expect(key.constructor.name).toBe('NodeRSA');
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

// describe('Create a transaction', () => {
//   it('should add a new trasaction to list, but not yet into the block', () {
//     var transaction = {
//     };
//   });
// });
