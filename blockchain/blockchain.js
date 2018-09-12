'use strict';
const crypto = require('crypto');

const utils = require('./utils');

const blockVersion = 0.1;
const difficulty = 4;
const decimalPlaces = 5;

class Blockchain {
  constructor() {
    this.blockVersion = blockVersion;
    this.chain = [];
    this.currentTransactions = [];
    this.hashPrefix = ''.padStart(difficulty,'0');
    this.newBlock(100,1);
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  get length() {
    return this.chain.length;
  }

  newBlock(proof, previous_hash) {
    var block = {
      index:          this.chain.length,
      transactions:   this.currentTransactions,
      proof:          proof,
      previous_hash:  previous_hash || utils.hash(this.chain[-1])
    };
    this.chain.push(block);

    this.currentTransactions = [];

    return block;
  }

  newTransaction(senderKey, recipient, amount = 0.0, data = null, signature) {
    var txn_str = utils.transactionToString(senderKey, recipient, amount, data);
    if(utils.verify(senderKey, txn_str, signature)) {
      var transaction = {
        sender: senderKey,
        recipient: recipient,
        amount: amount,
        data: data,
        signature: signature
      };
      this.currentTransactions.push(transaction);
    } else {
      throw('Signature invalid');
    }

    return transaction;
  }

  validProof(proof,last_hash) {
    var guess = `${proof}${last_hash}`;
    var guess_hash = utils.hash(guess);
    return guess_hash.substring(0,difficulty) === this.hashPrefix;
  }

  proofOfWork(last_block) {
    var last_proof = this.lastBlock['proof'];
    var last_hash = utils.hash(JSON.stringify(last_block));

    var proof = 0;
    while (!this.validProof(proof,last_hash))
      proof += 1;

    return proof;
  }

  async mine() {
    var last_block = this.lastBlock
    var proof = await this.proofOfWork(last_block)

    // Forge the new Block by adding it to the chain
    var previous_hash = utils.hash(JSON.stringify(last_block))
    var block = this.newBlock(proof, previous_hash)
    return block;
  }
}

module.exports = {
  blockVersion,
  decimalPlaces,
  Blockchain
}
