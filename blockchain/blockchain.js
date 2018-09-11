'use strict';
const crypto = require('crypto');

const utils = require('./utils');

const blockVersion = 0.1;
const difficulty = 3;
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
    guess = `${proof}${last_hash}`;
    guess_hash = utils.hash(guess);
    return guess_hash.substring(0,difficulty) === hash_prefix;
  }

  proofOfWork(last_block) {
    last_proof = last_block['proof'];
    last_hash = hash(JSON.stringify(last_block));

    proof = 0;
    while (!validProof(proof,last_hash))
      proof += 1;

    return proof;
  }
}

module.exports = {
  blockVersion,
  decimalPlaces,
  Blockchain
}
