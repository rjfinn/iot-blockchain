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

  /* getBlocks by filters, all filters optional
   * startTime = timestamp to start block range, in Unix epoch milliseconds
   * endTime = timestamp to end block range
   * startIndex = block index to start range
   * endIndex = block index to end range
   * limit = number of blocks to return
   */
  getBlocks(options) {
    var startTime = "startTime" in options ? options.startTime : 0;
    if(Number(startTime) === 'NaN') {
      startTime = new Date(startTime).valueOf();
    }
    var endTime = "endTime" in options ? options.endTime : new Date().valueOf() + 100000;
    if(Number(endTime) === 'NaN') {
      endTime = new Date(endTime).valueOf();
    }
    var startIndex = "startIndex" in options ? options.startIndex : 0;
    var endIndex = "endIndex" in options ? options.endIndex : this.lastBlock[index];
    var limit = "limit" in options ? options.limit : this.length;
    var count = 0;
    var blocks = this.chain.filter((block) => {
      count++;
      return block.timestamp > startTime && block.timestamp < endTime &&
            block.index > startIndex && block.index < endIndex
            && count <= limit;
    });
  }

  getBlock(index) {
    var theBlock = this.chain[index];
    if(theBlock.index !== index) {
      theBlock = this.chain.filter((block) => block.index === index);
    }
    return theBlock;
  }

  // will add a block to the chain, assumes valid proof
  newBlock(proof, previous_hash) {
    var block = {
      index:          this.chain.length,
      transactions:   this.currentTransactions,
      proof:          proof,
      previous_hash:  previous_hash || utils.hash(this.chain[-1]),
      timestamp:      utils.timestamp()
    };
    this.chain.push(block);

    this.currentTransactions = [];

    return block;
  }

  newTransaction(publicKey, recipient, amount = 0.0, data = null, signature) {
    var sender_addr = utils.getAddress(publicKey);
    var txn_str = utils.transactionToString(sender_addr, recipient, amount, data);
    if(utils.verifySign(publicKey, txn_str, signature)) {
      var transaction = {
        sender:     sender_addr,
        recipient:  recipient,
        amount:     amount,
        data:       data,
        timestamp:  utils.timestamp(),
        publicKey:  publicKey,
        signature:  signature
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

  async mine(callback = null) {
    var last_block = this.lastBlock
    var proof = await this.proofOfWork(last_block)

    // Forge the new Block by adding it to the chain
    var previous_hash = utils.hash(JSON.stringify(last_block))
    var block = this.newBlock(proof, previous_hash)
    if(callback) {
      callback(block, null);
    } else {
      return block;
    }
  }
}

module.exports = {
  blockVersion,
  decimalPlaces,
  Blockchain
}
