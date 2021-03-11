/* eslint-disable no-process-env */
const path = require('path');
const react = require('@neutrinojs/react');

module.exports = ({
    publicPath = '/a/browser/',
    source = 'browser',
    output = path.resolve('dist'),
    devModulesPath = 'dev',
    proxy = {
        context: ['!/a/browser/**'],
        target: 'http://localhost:8004'
    },
    cssImport = path.resolve('impl/browser/config')
} = {}) => neutrino => {
    neutrino.options.source = source;
    neutrino.use(
        react({
            style: {
                modules: true,
                modulesTest: /\.module\.css$|node_modules[/\\]ut-.+\.css|impl-[^/\\]+[/\\](?!node_modules[/\\]).+\.css$/,
                loaders: [{
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('postcss-import')({path: [cssImport]}),
                            require('postcss-preset-env')({preserve: false}),
                            require('postcss-assets')({relative: true}),
                            require('postcss-merge-rules')(),
                            require('postcss-clean')({level: 2, rebase: false})
                        ]
                    }
                }]
            },
            publicPath,
            devServer: {proxy}
        })
    );
    neutrino.config.resolve.alias.set('react-dom', '@hot-loader/react-dom');
    neutrino.config.output.path(output);
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
    if (process.env.NODE_ENV === 'development') {
        neutrino.config.resolve.modules
            .add('node_modules')
            .prepend(devModulesPath);
    }
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
        neutrino.config.plugin('compress').use(require.resolve('compression-webpack-plugin'));
        neutrino.config.optimization.merge({
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/](?!(impl|ut)-)/i,
                        name: 'vendor',
                        chunks: 'all'
                    },
                    ut: {
                        test: /[\\/]node_modules[\\/](impl|ut)-/i,
                        name: 'ut',
                        chunks: 'all'
                    }
                }
            }
        });
    }
};
