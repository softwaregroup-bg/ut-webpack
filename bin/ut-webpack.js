#!/usr/bin/env node

process.argv.push('--config', require.resolve('..'));
require('webpack/bin/webpack');
