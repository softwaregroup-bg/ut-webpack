const { join } = require('path');
const neutrino = require('neutrino');
const utWebpack = require('./preset');
const copy = require('@neutrinojs/copy');
const middleware = require(join(process.cwd(), 'utWebpack'));

module.exports = neutrino(middleware({utWebpack, copy})).webpack();
