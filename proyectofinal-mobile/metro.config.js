const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Forzar la transformación de módulos que contienen import.meta
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./custom-transformer.js'),
};

module.exports = config;
