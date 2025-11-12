# ut-webpack

[Neutrino](https://neutrinojs.org/) based preset for usage with UT framework. R.

## Usage

1) Install `ut-webpack` globally.
2) Create a `utWebpack.js` file in your project root, with the following content:

    ```js
    module.exports = ({utWebpack}) => ({
        options: {
            mains: {
                admin: 'admin',
                service: 'service',
                solution: 'solution',
                adminPortal: 'adminPortal',
                cmsPortal: 'cmsPortal'
            }
        },
        use: [utWebpack({...options})]
    });
    ```

3) Edit `package.json` to include:

    ```json
    {
        "scripts": {
            "start": "ut-webpack-dev-server --mode development --open",
            "build": "ut-webpack --mode production",
            "release": "ut-webpack --mode production && ut-release"
        }
    }
    ```

Use `npm run start` to start the development server with hot reload enabled.

Use `npm run build` to build the production front end.

## Configuration

The preset accepts the following options as object properties
in the first argument :

- `publicPath` - sets Webpack
  [output.publicPath](https://webpack.js.org/configuration/output/#output-publicpath),
  the default is: `'/a/browser/'`
- `source` - sets Neutrino
  [options.source](https://neutrinojs.org/api/#optionssource),
  the default is: `'browser'`
- `output` - sets Neutrino
  [options.output](https://neutrinojs.org/api/#optionsoutput),
  the default is: `path.resolve('dist')`
- `proxy` - sets Webpack
  [devServer.proxy](https://webpack.js.org/configuration/dev-server/#devserverproxy),
  the default is:

  ```js
    {
        context: ['!/a/browser/**'],
        target: 'http://localhost:8004'
    }
  ```

- `cssImport` - sets postcss-import
  [path](https://www.npmjs.com/package/postcss-import#path),
  the default is: `path.resolve('impl/browser/config')`
- `devModulesPath` - sets Neutrino
  [path](https://neutrinojs.org/webpack-chain/#config-resolve-modules),
  the default is: `dev`
- `csp` - Allows content security options to be passed to
  [csp-html-webpack-plugin](https://www.npmjs.com/package/csp-html-webpack-plugin)
- `html` - Allows html options to be passed to
  [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)
