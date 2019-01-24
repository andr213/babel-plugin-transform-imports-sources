/*eslint no-undef: "error"*/
/*eslint-env node*/
const types = require('babel-types');

// raise error from plugin
function raiseError(message) {
  throw new Error('babel-plugin-transform-imports-sources: ' + message);
}

// get all matches
function getMatches(opt, source) {
  const matches = source.match(opt);
  return matches
    ? Array.from(matches)
    : [];
}

// transform source
function transform(transformOption, matches) {
  const isFunction = typeof transformOption === 'function';

  if (isFunction || /\.js$/i.test(transformOption)) {
    let transformFn;

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

  return transformOption.replace(
    /\$\{\s?([\w\d]*)\s?\}/ig,
    (str, index) => matches[index]
  );
}

module.exports = () => ({
  visitor: {
    ImportDeclaration: (path, state) => {
      // path.node.source - string literal within from
      // path.node.specifiers variables imports to

      // options provided by the user
      const options = state.opts;
      const opt = Object.keys(options)[0];

      // path.node.source - string literal within from
      const source = path.node.source.value;

      const isRegexp = source !== opt ;

      const matches = isRegexp
        ? getMatches(opt, source)
        : [opt];

      if (matches.length) {
        const replace = transform(options[opt].transform, matches);
        // console.log('replace', replace);

        // creating new node
        const node = types.importDeclaration(
          path.node.specifiers, // path.node.specifiers - variables imports to
          types.stringLiteral(replace)
        );

        // replace old import node by new
        path.replaceWith(node);
      }
    },
  },
});
