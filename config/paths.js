'use strict';

const path = require('path');

const PATHS = {
  src: path.resolve(__dirname, '../src'),
  build: path.resolve(__dirname, '../build'),
  scrt: path.resolve(__dirname,'../secrets')
};

module.exports = PATHS;
