var path = require('path');
var fs = require('fs');

var sampleLocalLibMap = {
  'library-name': '../path/to/src/root-directory',
  'library-two': '../path/to/src/main-file.js'
};

function getLocalLibData(localLibMap, log) {
  log = !!log || false;
  var libKeys = Object.keys(localLibMap);
  if (log) {
    console.log('attempting to load local source files for: ' + libKeys);
  }
  var localLibKeys = [], localLibPathMap = {}, localLibIncludes = [];

  var stats, foundPath, filePath;
  libKeys.reduce(function(libPathMap, libKey) {
    try {
      stats = fs.statSync(localLibMap[libKey]);
      if (stats.isDirectory() || stats.isFile()) {
        localLibKeys.push(libKey);
        libPathMap[libKey] = foundPath = path.resolve(__dirname, localLibMap[libKey]);
        if (stats.isDirectory()) {
          console.log('found local source directory: ' + libKey + ' -> ' + foundPath);
          localLibIncludes.push(foundPath);
        }
        else {
          console.log('found local source file: ' + libKey + ' -> ' + foundPath);
          localLibIncludes.push(path.resolve(foundPath, '..'));
        }
      }
      else {
        console.log('NOT FOUND local source files for: ' + libKey);
      }
    }
    catch (error) {
      console.log('NOT FOUND ERROR local source files for: ' + libKey);
    }
    return libPathMap;
  }, localLibPathMap);

  if (localLibIncludes.length > 0) {
    return {
      localLibKeys: localLibKeys,
      localLibPathMap: localLibPathMap,
      localLibIncludes: localLibIncludes
    };
  }
  else {
    return false;
  }
}

function getOrAddToMap(localLibData, existingMap, mapKey) {
  if (!existingMap) {
    existingMap = {};
  }
  var mapToUse = existingMap;
  if (mapKey) {
    if (!existingMap[mapKey]) {
      existingMap[mapKey] = {};
    }
    mapToUse = existingMap[mapKey];
  }

  localLibData.localLibKeys.forEach(function(localLibKey) {
    mapToUse[localLibKey] = localLibData.localLibPathMap[localLibKey];
  });
  return existingMap;
}

function getWebpackLocalLibMapper(localLibMap, options) {
  if (!options) {
    options = {};
  }
  if (options.enabled === undefined) {
    options.enabled = true;
  }
  if (options.log === undefined) {
    options.log = false;
  }
  var log = options.log === true;
  var localLibData = options.enabled === true ? getLocalLibData(localLibMap, log) : false;

  return {
    getOrAddToMap: function(existingMap, mapKey) {
      if (localLibData) {
        return getOrAddToMap(localLibData, existingMap, mapKey);
      }
      else {
        return existingMap ? existingMap : {};
      }
    },

    getResolve: function(existingResolve) {
      if (localLibData) {
        var resolve = getOrAddToMap(localLibData, existingResolve, 'alias');
        if (log) {
          console.log('getResolve: ' + JSON.stringify(resolve));
        }
        return resolve;
      }
      else {
        return existingResolve ? existingResolve : {};
      }
    },

    getResolveLoader: function(existResolveLoader, resolveLoaderRootPath, resolveLoaderKey) {
      if (localLibData) {
        if (!resolveLoaderRootPath) {
          resolveLoaderRootPath = 'node_modules';
        }
        if (!resolveLoaderKey) {
          resolveLoaderKey = 'root';
        }
        if (!existResolveLoader) {
          existResolveLoader = {};
        }
        if (!existResolveLoader[resolveLoaderKey]) {
          existResolveLoader[resolveLoaderKey] = path.join(__dirname, resolveLoaderRootPath);
        }
        if (log) {
          console.log('getResolveLoader: ' + JSON.stringify(existResolveLoader));
        }
        return existResolveLoader;
      }
      else {
        return existResolveLoader ? existResolveLoader : {};
      }
    },

    getIncludes: function(existingIncludes) {
      if (localLibData) {
        if (!existingIncludes) {
          existingIncludes = [];
        }
        var includes = existingIncludes.concat(localLibData.localLibIncludes);
        if (log) {
          console.log('getIncludes: ' + JSON.stringify(includes));
        }
        return includes;
      }
      else {
        return existingIncludes ? existingIncludes : [];
      }
    }
  };
}

module.exports = getWebpackLocalLibMapper;