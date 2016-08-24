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

var getWebpackLocalLibMapper = require('webpack-local-libs');

var localLibMap = {
  'libraryA': '../someDir/someDir2',
  'libraryB': '../../anotherDir/mainFile.js'
}

var webpackLocalLibMapper = getWebpackLocalLibMapper(__dirname, localLibMap, { enabled: true, log: true});

module.exports = {
  
  // creates the resolve object for you:
  // { alias: {
  //    libraryA: path.resolve(__dirname, '../someDir/someDir2'),
  //    libraryB: path.resolve(__dirname, '../../anotherDir/mainFile.js')
  // } }
  
  resolve: webpackLocalLibMapper.getResolve({}), // existing resolve argument can be ommitted
  
  // creates the resolveLoader object for you:
  // { root: path.join(__dirname, 'node_modules') };
  
  resolveLoader: webpackLocalLibMapper.getResolveLoader({}), // existing resolveLoader argument can be ommitted
  
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
        include: webpackLocalLibMapper.getIncludes([path.resolve(__dirname, 'src')])
      }
    ]
  }
};
```
