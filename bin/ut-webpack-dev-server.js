#!/usr/bin/env node

process.argv.push('--config', require.resolve('..'));
require('webpack-dev-server/bin/webpack-dev-server');
