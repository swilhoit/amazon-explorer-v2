const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve("stream-browserify"),
    crypto: require.resolve("crypto-browserify"),
    os: require.resolve("os-browserify/browser"),
    path: require.resolve("path-browserify"),
    fs: false,
    process: require.resolve("process/browser"),
    buffer: require.resolve("buffer")
  };
  
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  // Add resolver for .mjs files
  config.resolve.extensions.push('.mjs');

  // Add specific rule for groq-sdk
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules\/groq-sdk/,
    type: "javascript/auto",
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: [
          ['@babel/plugin-transform-modules-commonjs', { strictMode: false }]
        ]
      }
    }
  });

  return config;
}