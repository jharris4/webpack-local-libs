# webpack-local-libs
Utilities for getting webpack to resolve/alias packages from local paths relative to the current directory

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install webpack-local-libs
```

**Examples**

```javascript
// webpack.config.js

var getWebpackLocalLibEnhancer = require('webpack-local-libs');

var localLibMap = {
  'js': {
    'libraryA': '../someDir/someDir2',
    'libraryB': '../../anotherDir/mainFile.js'
  },
  'css': {
    'libraryC': '../assetDir'
  }
}

var localLibsEnabled = process.env.NODE_ENV !== 'production';

var webpackLocalLibEnhancer = getWebpackLocalLibEnhancer(__dirname, localLibMap, localLibsEnabled);

Note: for Webpack 2 support, you can use the following:

var webpackLocalLibEnhancer = getWebpackLocalLibEnhancer(__dirname, localLibMap, localLibsEnabled, { webpack2: true});

module.exports = {
  
  // creates the resolve object for you (existing aliases are preserved unless they are overriden):
  // { alias: {
  //    libraryA: path.resolve(__dirname, '../someDir/someDir2'),
  //    libraryB: path.resolve(__dirname, '../../anotherDir/mainFile.js'),
  //    libraryC: path.resolve(__dirname, '../assetDir')
  // } }
  // Note that webpackLocalLibEnhancer.enhanceResolveRootAndAlias() exists for convenience
  
  resolve: webpackLocalLibEnhancer.enhanceResolveAlias({}), // existing resolve argument can be ommitted
  
  // creates the resolveLoader object for you:
  // { root: path.join(__dirname, 'node_modules') };
  
  resolveLoader: webpackLocalLibEnhancer.enhanceResolveRoot({}), // existing resolveLoader argument can be ommitted
  
  // creates include entries for you (removes filenames if they exist at the end):
  // { include: [
  //    path.resolve(__dirname, 'src'),
  //    path.resolve(__dirname, '../someDir/someDir2'),
  //    path.resolve(__dirname, '../../anotherDir')
  // ]}
  
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: webpackLocalLibEnhancer.enhanceIncludes('js', [path.resolve(__dirname, 'src')])
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
        include: webpackLocalLibEnhancer.enhanceIncludes('css', [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')])
      }
    ]
  }
};
```
