const { createExoticTransformer } = require('@expo/metro-config/transformer');

module.exports = createExoticTransformer({
  transpileModules: ['@fto-consult']
});