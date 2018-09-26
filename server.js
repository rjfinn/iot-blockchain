'use strict';
require('./config/config');

const {URL} = require('url');
const express = require('express');
const bodyParser = require('body-parser');

const {Blockchain} = require('./blockchain/blockchain');
const utils = require('./blockchain/utils');

const port = process.env.PORT || 5000;

var app = express();
app.use(bodyParser.json());

var bc = new Blockchain();

app.get('/chain', (req, res) => {
  res.status(200).send({
    version: bc.blockVersion,
    chain: bc.chain,
    length: bc.length
  });
});

app.get('/chain/length', (req, res) => {
  res.status(200).send(bc.length);
});

app.post('/nodes/register', (req, res) => {
    try {
      if(req.body.nodes !== undefined) {
        req.body.nodes.forEach((node) => {
          var nodeURL = new URL(node);
          bc.nodes.push({
            protocol: nodeURL.protocol,
            hostname: nodeURL.hostname,
            port:     nodeURL.port
          });
        });
        res.status(201).send({
          message: 'New nodes have been added.',
          total_nodes: nodes.length
        });
      } else {
        throw('Please supply a valid list of nodes.');
      }
    } catch(e) {
      res.status(400).send({error: e});
    }
});

app.get('/nodes', (req, res) => {
  res.status(200).send(bc.nodes);
});

app.get('/transactions/current', (req, res) => {
  res.status(200).send({
    transactions: bc.currentTransactions,
    length: bc.currentTransactions.length
  })
});

app.get('/transactions/:id', (req, res) => {
  try {
    var txn = bc.getTransactionById(req.params.id);
    res.status(200).send(txn);
  } catch(e) {
    res.status(400).send({error: e});
  }
});

app.post('/transactions', (req, res) => {
  try {
    var txn;
    if("id" in req.body) {
      txn = bc.currentTransactionExists(req.body.id);
      if(txn !== undefined) {
        txn.mined = false;
      } else {
        txn = bc.getTransactionById(req.body.id);
        if(txn !== undefined) {
          txn.mined = true;
        }
      }
    }
    if(txn === undefined) {
      var amount = "amount" in req.body ? req.body.amount : 0.0;
      var data = "data" in req.body ? req.body.data : null;
      txn = bc.newTransaction(
        req.body.publicKey,
        req.body.nonce,
        req.body.recipient,
        amount, data,
        req.body.signature);
      if(txn !== undefined) {
        txn.mined = false;
      } else {
        throw('Transaction could not be created.');
      }
      res.status(201);
    } else {
      res.status(200);
    }
    res.send(txn);
  } catch(e) {
    res.status(400).send({error: e});
  }
});

app.get('/blocks/:index', (req, res) => {
  try {
    var block = bc.getBlock(req.params.index);
    if(block !== undefined) {
      res.status(200).send(block);
    } else {
      thorw('Could not find a block at that index.');
    }
  } catch(e) {
    res.status(400).send({error: e});
  }
});

app.get('/blocks/last', (req, res) => {
  try {
    res.status(200).send(bc.lastBlock);
  } catch(e) {
    res.status(400).send({error: e});
  }
});

app.post('/blocks', (req, res) => {
  try {
    // check validity of block, if only one block behind and valid add
    // if behind, request missing blocks from originating host
    //  valididate those blocks
    var block = req.body;
    var last_block = bc.lastBlock;
    if(block.index !== last_block.index)
      var block_distance = block.index - last_block.index;
      if(bc.validateBlock(block)) {
        bc.addBlock(block);
      }
      // TODO: check for missing blocks
  } catch(e) {
    res.status(400).send({error: e});
  }
});

app.get('/mine', (req, res) => {
  //var block = bc.mine();
  //res.status(201).send(block);
  console.log('manual mine check');
  mine((block) => {
    res.status(201).send(block);
  })
});

var server = app.listen(port, () => {
  var url = server.address();
  console.log(`Started at ${url.address}:${url.port}`);
});

/* TODO:
 * automatic function to check for minable transactions and auto-mine
 * automatic function to check nodes for health and remove
 */

 function autoMine() {
   console.log('automine check');
   mine((block) => {
     var waitTime = Math.floor(Math.random() * 20000) + 5000;  // TODO: make config vars
     setTimeout(mine,waitTime);
   });
 }

async function mine(callback) {
   if(bc.currentTransactions.length > 0) {
     bc.mine((block) => {
       console.log(`mined ${block.index}: ${block.transactions.length} transactions.`);
       if(callback) {
         callback(block);
       } else {
         return block;
       }
     });
   }
}
setTimeout(autoMine,20000);

module.exports = {app};
