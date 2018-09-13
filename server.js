'use strict';
require('./config/config');

const {URL} = require('url');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment')

const {Blockchain} = require('./blockchain/blockchain');
const utils = require('./blockchain/utils');

const port = process.env.PORT || 5000;

var app = express();
app.use(bodyParser.json());

var bc = new Blockchain();
var nodes = new Array();

app.get('/chain', (req, res) => {
  res.send({
    version: bc.blockVersion,
    chain: bc.chain,
    length: bc.length
  });
});

app.post('/nodes/register', (req, res) => {
    try {
      if(req.body.nodes !== undefined) {
        req.body.nodes.forEach((node) => {
          var nodeURL = new URL(node);
          nodes.push({
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

app.post('/transaction', (req, res) => {
  try {
    var amount = "amount" in req.body ? req.body.amount : 0.0;
    var data = "data" in req.body ? req.body.data : null;
    var txn = bc.newTransaction(
      req.body.publicKey,
      req.body.recipient,
      amount, data,
      req.body.signature);
    res.status(201).send(txn);
  } catch(e) {
    res.status(400).send({error: e});
  }
});

app.get('/mine', (req, res) => {
  // var block = bc.mine();
  // res.status(201).send(block);
  bc.mine((block) => {
    res.status(201).send(block);
  })
});

var server = app.listen(port, () => {
  var url = server.address();
  console.log(`Started at ${url.address}:${url.port}`);
});

// var key = utils.createPrivateKey(true);
// console.log(key)

module.exports = {app};
