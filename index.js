const { join } = require('path');
const neutrino = require('neutrino');
const utWebpack = require('./preset');
const middleware = require(join(process.cwd(), 'utWebpack'));

module.exports = neutrino(middleware({utWebpack})).webpack();
