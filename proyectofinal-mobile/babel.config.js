module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin personalizado para transformar import.meta
      function() {
        return {
          visitor: {
            MetaProperty(path) {
              // Reemplazar import.meta.url con ""
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                if (path.parentPath.isMemberExpression() && path.parentPath.node.property.name === 'url') {
                  path.parentPath.replaceWithSourceString('""');
                } else {
                  // Reemplazar import.meta con {}
                  path.replaceWithSourceString('({})');
                }
              }
            },
          },
        };
      },
    ],
  };
};
