const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add platform-specific extensions
defaultConfig.resolver.platforms = ['ios', 'android', 'web'];
defaultConfig.resolver.sourceExts.push('cjs');

// Add asset extensions
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  (ext) => ext !== 'svg'
);
defaultConfig.resolver.sourceExts.push('svg');

module.exports = defaultConfig;