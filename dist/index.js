"use strict";

var types = require('babel-types');

function raiseError(message) {
  throw new Error('babel-plugin-transform-imports-sources: ' + message);
}

function getMatches(opt, source) {
  var matches = source.match(opt);
  return matches ? Array.from(matches) : [];
}

function transform(transformOption, matches) {
  var isFunction = typeof transformOption === 'function';

  if (isFunction || /\.js$/i.test(transformOption)) {
    var transformFn;

    try {
      transformFn = isFunction ? transformOption : require(transformOption);
    } catch (error) {
      raiseError('failed to import transform file ' + transformOption);
    }

    if (typeof transformFn !== 'function') {
      isFunction('expected transform function to be exported from ' + transformOption);
    }

    return transformFn(matches);
  }

  return transformOption.replace(/\$\{\s?([\w\d]*)\s?\}/ig, function (str, index) {
    return matches[index];
  });
}

module.exports = function () {
  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(path, state) {
        var options = state.opts;
        var opt = Object.keys(options)[0];
        var source = path.node.source.value;
        var isRegexp = source !== opt;
        var matches = isRegexp ? getMatches(opt, source) : [opt];

        if (matches.length) {
          var replace = transform(options[opt].transform, matches);
          var node = types.importDeclaration(path.node.specifiers, types.stringLiteral(replace));
          path.replaceWith(node);
        }
      }
    }
  };
};