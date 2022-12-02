/* eslint-disable no-process-env */
const path = require('path');
const react = require('@neutrinojs/react');

module.exports = ({
    publicPath = '/a/browser/',
    source = 'browser',
    output = path.resolve('dist'),
    devModulesPath = path.resolve('dev'),
    proxy = {
        context: ['!/a/browser/**'],
        target: 'http://localhost:8004'
    },
    split,
    cssImport = path.resolve('impl/browser/config'),
    csp = {
        enabled: false
    },
    html = {
        cspPlugin: csp
    },
    cssModules = /\.module\.(sass|scss)|\.module\.css$|node_modules[/\\]ut-.+(?<!\.global)\.css|(?:^\/app\/|impl-[^/\\]+[/\\])(?!node_modules[/\\]).+(?<!\.global)\.css$/,
    postcss = true,
    sass = false
} = {}) => neutrino => {
    neutrino.options.source = source;
    neutrino.use(
        react({
            html,
            style: cssModules && {
                modules: true,
                modulesTest: cssModules,
                ...sass && {test: /\.(css|sass|scss)$/},
                loaders: [postcss && {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        plugins: [
                            require('postcss-import')({path: [cssImport]}),
                            require('postcss-preset-env')({preserve: false}),
                            require('postcss-assets')({relative: true}),
                            require('postcss-merge-rules')(),
                            require('postcss-clean')({level: 2, rebase: false})
                        ]
                    }
                }, sass && {
                    loader: require.resolve('sass-loader'),
                    useId: 'sass'
                }].filter(Boolean)
            },
            publicPath,
            devServer: {proxy},
            babel: {
                sourceType: 'unambiguous',
                plugins: [
                    require.resolve('@babel/plugin-proposal-class-properties'),
                    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
                    require.resolve('@babel/plugin-proposal-optional-chaining')
                ]
            }
        })
    );
    const devextreme = neutrino.config.module
        .rule('style')
        .oneOf('devextreme')
        .test(/devextreme[/\\]dist[/\\]css[/\\]dx\.(?!common).+\.css$/i)
        .before(cssModules ? 'modules' : 'normal');
    devextreme
        .use('style')
        .loader(require.resolve('style-loader'))
        .options({injectType: 'lazyStyleTag'});
    devextreme
        .use('css')
        .loader(require.resolve('css-loader'));

    const primereact = neutrino.config.module
        .rule('style')
        .oneOf('primereact')
        .test(/primereact[/\\]resources[/\\]themes[/\\].+\.css$/i)
        .before(cssModules ? 'modules' : 'normal');
    primereact
        .use('style')
        .loader(require.resolve('style-loader'))
        .options({injectType: 'lazyStyleTag'});
    primereact
        .use('css')
        .loader(require.resolve('css-loader'));

    neutrino.config.resolve.alias.set('react-dom', '@hot-loader/react-dom');
    neutrino.config.output.path(output);
    neutrino.config.module
        .rule('compile')
        .include.clear().end()
        // .exclude.add(/node_modules[\\/]((ut-prime)|(?!(impl|ut)-))/).end();
        .exclude.add(/node_modules[\\/](?!(impl|ut)-)/).end();
    neutrino.config.module
        .rule('tesseract')
        .before('compile')
        .test(/tesseract\.js[\\/]dist[\\/]|tesseract\.js-core[\\/]/)
        .use('file')
        .loader(require.resolve('file-loader'))
        .options({outputPath: 'tesseract'});
    neutrino.config.module
        .rule('tesseract-train')
        .before('compile')
        .test(/\.traineddata\.gz/)
        .use('file')
        .loader(require.resolve('file-loader'))
        .options({outputPath: 'tesseract', name: '[contenthash].traineddata.gz'});

    neutrino.config.node.set('Buffer', true);
    neutrino.config.resolve.alias
        .set('bufferutil', require.resolve('./empty'))
        .set('dtrace-provider', require.resolve('./empty'))
        .set('safe-json-stringify', require.resolve('./empty'))
        .set('source-map-support', require.resolve('./empty'));
    if (process.env.NODE_ENV === 'development') {
        neutrino.config.resolve
            .symlinks(false)
            .modules.add('node_modules')
            .add(devModulesPath);
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
        neutrino.config.plugin('csp').use(require.resolve('csp-html-webpack-plugin')).after('html');
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
                    chart: {
                        test: /[\\/]node_modules[\\/]chart\.js[\\/]/i,
                        name: 'chart',
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
                        test: /[\\/]node_modules[\\/](ut-front-devextreme|ut-portal|ut-prime|ut-model)[\\/]/i,
                        name: 'ut-portal',
                        enforce: true,
                        chunks: 'all'
                    },
                    ...split.reduce((prev, chunk) => ({
                        ...prev,
                        [chunk]: {
                            test: RegExp(`[\\\\/]node_modules[\\\\/]${chunk}[\\\\/]`),
                            name: chunk,
                            enforce: true,
                            chunks: 'all'
                        }
                    }), {}),
                    ut: {
                        test: /[\\/]node_modules[\\/]ut-/i,
                        name: 'ut',
                        enforce: true,
                        chunks: 'all',
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
        neutrino.config.plugin('stats')
            .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [{
                statsFilename: path.resolve('.lint/bundle/stats.json'),
                analyzerMode: 'json',
                generateStatsFile: true,
                defaultSizes: 'gzip',
                logLevel: 'warn'
            }]);
    }
};
