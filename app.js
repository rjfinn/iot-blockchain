'use strict';
require('./config/config');

const http = require("http");
const https = require("http");
const {URL} = require('url');

const utils = require('./blockchain/utils');

var nodes = new Array();
var last_index = 0;
var key = {};

function getNode() {
  var index = Math.floor(Math.random() * nodes.length);
  var node_url = nodes[index];
  var node = new URL(node_url);
  return node;
}

function getRequest(path, callback) {
  var node = getNode();
  var req = eval(node.protocol.substring(0,node.protocol.length - 1));
  req.get({
    hostname: node.hostname,
    port:     node.port,
    path:     path
  }, (res) => {callback(res)});
}

function getRecentTransactions() {
    var path = `/transactions/recipient/${key.address}/${last_index}`;
    getRequest(path, (res) => {
      // TODO: iterate on blocks and txns
      if(res.statusCode === 200) {
        var rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            var parsedData = JSON.parse(rawData);
            console.log(parsedData);
          } catch(e) {
            console.error(e);
          }
        });
      } else {
        console.error(res.statusCode, res.statusMessage);
      }
    });
}

function initNodes() {
  var node_list = process.env.NODES;
  if(Array.isArray(node_list)) {
    nodes = node_list;
  } else {
    nodes = node_list.split(',');
  }
}

function init() {
  key.private = utils.loadKey();
  key.public = utils.getPublicKey(key.private);
  key.address = utils.getAddress(key.public);
  initNodes();
  main();
}

function main () {
  // cycle
  getRecentTransactions();
  //setTimeout(main,3000);
}

// start app
init();
