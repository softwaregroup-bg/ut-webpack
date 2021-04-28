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
    split,
    cssImport = path.resolve('impl/browser/config')
} = {}) => neutrino => {
    neutrino.options.source = source;
    neutrino.use(
        react({
            style: {
                modules: true,
                modulesTest: /\.module\.css$|node_modules[/\\]ut-.+\.css|(?:^\/app\/|impl-[^/\\]+[/\\])(?!node_modules[/\\]).+\.css$/,
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
    const devextreme = neutrino.config.module
        .rule('style')
        .oneOf('devextreme')
        .test(/devextreme[/\\]dist[/\\]css[/\\]dx\.(?!common).+\.css$/i)
        .before('modules');
    devextreme
        .use('style')
        .loader('style-loader')
        .options({injectType: 'lazyStyleTag'});
    devextreme
        .use('css')
        .loader('css-loader');

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
                maxInitialRequests: 30,
                cacheGroups: !split ? {
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
                } : {
                    vendor: {
                        test: /[\\/]node_modules[\\/](?!(impl|ut)-)/i,
                        name: 'vendor',
                        chunks: 'all',
                        enforce: true,
                        priority: -5
                    },
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|react-redux|redux|redux-thunk|redux-devtools-extension|react-router|react-router-dom|react-router-redux)[\\/]/i,
                        name: 'react',
                        enforce: true,
                        chunks: 'all'
                    },
                    material: {
                        test: /[\\/]node_modules[\\/]@material-ui[\\/]/i,
                        name: 'material',
                        enforce: true,
                        chunks: 'all'
                    },
                    primereact: {
                        test: /[\\/]node_modules[\\/](primereact|primeflex|primeicons)[\\/]/i,
                        name: 'primereact',
                        enforce: true,
                        chunks: 'all'
                    },
                    devextreme: {
                        test: /[\\/]node_modules[\\/](devextreme|devextreme-react)[\\/]/i,
                        name: 'devextreme',
                        enforce: true,
                        chunks: 'all'
                    },
                    utFrontReact: {
                        test: /[\\/]node_modules[\\/]ut-front-react/i,
                        name: 'ut-front-react',
                        enforce: true,
                        chunks: 'all'
                    },
                    utPortal: {
                        test: /[\\/]node_modules[\\/](ut-front-devextreme|ut-portal)/i,
                        name: 'ut-portal',
                        chunks: 'all'
                    },
                    ...split.reduce((prev, chunk) => ({
                        ...prev,
                        [chunk]: {
                            test: RegExp(`[\\\\/]node_modules[\\\\/]${chunk}`),
                            name: chunk,
                            chunks: 'all'
                        }
                    }), {}),
                    ut: {
                        test: /[\\/]node_modules[\\/]ut-/i,
                        name: 'ut',
                        priority: -5
                    }
                }
            }
        });
        neutrino.config.plugin('analyzer')
            .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [{
                reportFilename: path.resolve('.lint/bundle/index.html'),
                analyzerMode: 'static',
                openAnalyzer: false,
                defaultSizes: 'gzip',
                logLevel: 'warn'
            }]);
    }
};
