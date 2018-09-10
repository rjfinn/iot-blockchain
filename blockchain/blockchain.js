'use strict';
const crypto = require('crypto');

const {hash} = require('./utils');

const blockVersion = 0.1;
const difficulty = 3;

class Blockchain {
  constructor() {
    this.blockVersion = blockVersion;
    this.chain = [];
    this.currentTransactions = [];
    this.hashPrefix = ''.padStart(difficulty,'0');
    this.new_block(100,1);
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  get length() {
    return this.chain.length;
  }

  new_block(proof, previous_hash) {
    var block = {
      index:          this.chain.length,
      transactions:   this.currentTransactions,
      proof:          proof,
      previous_hash:  previous_hash || hash(this.chain[-1])
    };
    this.chain.push(block);

    this.currentTransactions = [];

    return block;
  }

  new_transaction(sender, recipient, amount, data = null, signature = null) {
    var transaction = {
      sender: sender,
      recipient: recipient,
      amount: amoumnt,
      data: data,
      signature: signature
    };
    this.currentTransactions.push(transaction);

    return transaction;
  }

  valid_proof(proof,last_hash) {
    guess = `${proof}${last_hash}`;
    guess_hash = hash_block(guess);
    return guess_hash.substring(0,difficulty) === hash_prefix;
  }

  proof_of_work(last_block) {
    last_proof = last_block['proof'];
    last_hash = hash(last_block);

    proof = 0;
    while (!valid_proof(proof,last_hash))
      proof += 1;

    return proof;
  }
}

module.exports = {
  Blockchain
}
