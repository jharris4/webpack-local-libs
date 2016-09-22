var path = require('path');
var fs = require('fs');

function getWebpackLocalLibEnhancer(basePath, localLibMap, enabled, options) {
  if (options === undefined) {
    options = {};
  }
  if (options.defaultRootKey === undefined) {
    if (options.webpack2 === true) {
      options.defaultRootKey = 'modules';
    }
    else {
      options.defaultRootKey = 'root';
    }
  }
  if (options.rootFormatter === undefined) {
    if (options.webpack2 === true) {
      options.rootFormatter = function(root) { return [root]; }
    }
    else {
      options.rootFormatter = function(root) { return root; }
    }
  }
  if (options.defaultAliasKey === undefined) {
    options.defaultAliasKey = 'alias';
  }
  var aliasToLocalPathMap = {};
  var typeToLocalPathsMaps = {};

  var allFound = true;

  Object.keys(localLibMap).forEach(function(type) {
    typeToLocalPathsMaps[type] = [];
    Object.keys(localLibMap[type]).forEach(function(alias) {
      try {
        stats = fs.statSync(localLibMap[type][alias]);
        if (stats.isDirectory() || stats.isFile()) {
          var foundPath = path.resolve(basePath, localLibMap[type][alias]);
          aliasToLocalPathMap[alias] = foundPath;
          if (!stats.isDirectory()) {
            foundPath = path.resolve(foundPath, '..');
          }
          typeToLocalPathsMaps[type].push(foundPath);
        }
        else {
          allFound = false;
        }
      }
      catch (error) {
        allFound = false;
      }
    });
  });

  if (allFound === false) {
    console.warn('*** warning, some local libs could not be found');
  }

  function enhanceResolveAlias(existingResolve, aliasKey) {
    if (existingResolve === undefined) {
      existingResolve = {};
    }
    if (enabled) {
      if (aliasKey === undefined) {
        aliasKey = options.defaultAliasKey;
      }
      if (existingResolve[aliasKey] === undefined) {
        existingResolve[aliasKey] = {};
      }
      Object.keys(aliasToLocalPathMap).forEach(function(alias) {
        existingResolve[aliasKey][alias] = aliasToLocalPathMap[alias];
      });
    }
    return existingResolve;
  }

  function enhanceResolveRoot(existingResolve, rootKey, rootPath) {
    if (existingResolve === undefined) {
      existingResolve = {};
    }
    if (enabled) {
      if (rootKey === undefined) {
        rootKey = options.defaultRootKey;
      }
      if (rootPath === undefined) {
        rootPath = 'node_modules';
      }
      existingResolve[rootKey] = options.rootFormatter(path.join(basePath, rootPath));
    }
    return existingResolve;
  }

  function enhanceResolveRootAndAlias(existingResolve, rootKey, rootPath, aliasKey) {
    return enhanceResolveAlias(enhanceResolveRoot(existingResolve, rootKey, rootPath), aliasKey);
  }

  function enhanceIncludes(type, existingIncludes) {
    if (existingIncludes === undefined) {
      existingIncludes = [];
    }
    if (typeToLocalPathsMaps[type] !== undefined) {
      existingIncludes = existingIncludes.concat(typeToLocalPathsMaps[type]);
    }
    return existingIncludes;
  }

  return {
    enhanceResolveAlias: enhanceResolveAlias,
    enhanceResolveRoot: enhanceResolveRoot,
    enhanceResolveRootAndAlias: enhanceResolveRootAndAlias,
    enhanceIncludes: enhanceIncludes
  };
}

module.exports = getWebpackLocalLibEnhancer;