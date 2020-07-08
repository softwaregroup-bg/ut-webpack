# ut-webpack

[Neutrino](https://neutrinojs.org/) based preset for usage with ut framework.

## Usage

Put the following files in the implementation root folder:

- `.neutrinorc.js`

  ```js
  const preset = require('ut-webpack/preset');
  module.exports = {
      options: {
          mains: {
              admin: 'admin',
              service: 'service',
              solution: 'solution'
          }
      },
      use: [preset()]
  };
  ```

- `webpack.config.js`

  ```js
  module.exports = require('ut-webpack');
  ```

Edit `package.json` to include:

```json
{
    "devDependencies": {
        "ut-webpack": "^7.2.0",
        "webpack": "^4.43.0",
        "webpack-dev-server": "^3.11.0",
    },
    "scripts": {
        "start": "webpack-dev-server --mode development --open",
        "build": "webpack --mode production",
        "release": "webpack --mode production && ut-release"
    }
}
```

- Use `npm run start` to start the development server with hot reload enabled
- Use `npm run build` to build the production front end

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
