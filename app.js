'use strict';
require('./config/config');

const http = require("http");
const {URL} = require('url');

const utils = require('./blockchain/utils');

var last_index = 0;

function get
