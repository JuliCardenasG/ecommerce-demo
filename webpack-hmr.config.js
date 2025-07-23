const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100', 'zod'],
        modulesFromFile: true,
      }),
    ],
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve?.alias,
        '@libs/validation': path.resolve(__dirname, 'libs/validation/src'),
      },
      modules: [
        'node_modules',
        path.resolve(__dirname, 'node_modules'),
      ],
    },
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({ 
        name: options.output.filename, 
        autoRestart: false 
      }),
    ],
  };
};
