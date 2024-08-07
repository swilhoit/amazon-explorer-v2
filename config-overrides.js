const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for node core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve("stream-browserify"),
    crypto: require.resolve("crypto-browserify"),
    os: require.resolve("os-browserify/browser"),
    path: require.resolve("path-browserify"),
    fs: false,
    buffer: require.resolve("buffer"),
    process: require.resolve("process/browser.js"),  // Note the .js extension
  };
  
  // Add ProvidePlugin
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser.js",  // Note the .js extension
      Buffer: ["buffer", "Buffer"],
    })
  );

  // Add resolver for .mjs files
  config.resolve.extensions.push('.mjs');

  // Add specific rule for axios
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  });

  return config;
}