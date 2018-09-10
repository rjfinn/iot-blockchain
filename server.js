'use strict';
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment')

const {Blockchain} = require('./blockchain/blockchain');
const utils = require('./blockchain/utils');

const port = process.env.PORT || 5000;

var app = express();
app.use(bodyParser.json());

var chain = new Blockchain();

app.get('/chain', (req, res) => {
  res.send({
    chain: chain.blocks,
    length: chain.length
  });
});

app.listen(port, () => {
  console.log('Started on', port);
});

// var key = utils.createPrivateKey(true);
// console.log(key)

module.exports = {app};
