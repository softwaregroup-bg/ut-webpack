/* eslint-disable no-process-env */
const path = require('path');
const react = require('@neutrinojs/react');

module.exports = options => neutrino => {
    neutrino.use(
        react({
            style: {
                modules: true,
                modulesTest: /\.css$/,
                loaders: [{
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('postcss-import')({path: [path.resolve('impl/browser/config')]}),
                            require('postcss-preset-env')({preserve: false}),
                            require('postcss-assets')({relative: true}),
                            require('postcss-merge-rules')(),
                            require('postcss-clean')({level: 2, rebase: false})
                        ]
                    }
                }]
            },
            devServer: {
                publicPath: '/a/browser/',
                proxy: {
                    context: () => true,
                    target: 'http://localhost:8004'
                }
            },
            publicPath: '/a/browser/'
        })
    );
    neutrino.config.resolve.alias.set('react-dom', '@hot-loader/react-dom');
    neutrino.config.output.path(path.resolve('dist'));
    neutrino.config.module
        .rule('compile')
        .include.clear().end()
        .exclude.add(/node_modules[\\/](?!(impl|ut)-)/).end();
    neutrino.config.node.set('Buffer', true);
    neutrino.config.resolve.alias
        .set('bufferutil', require.resolve('./empty'))
        .set('dtrace-provider', require.resolve('./empty'))
        .set('safe-json-stringify', require.resolve('./empty'))
        .set('source-map-support', require.resolve('./empty'));
    if (process.env.NODE_ENV === 'production') {
        neutrino.config.optimization
            .minimizer('terser')
            .use(require.resolve('terser-webpack-plugin'), [{
                cache: true,
                parallel: true,
                sourceMap: neutrino.config.devtool && /source-?map/.test(neutrino.config.devtool),
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            }]);
    }
};
