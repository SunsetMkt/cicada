const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const { devMainConfig, serviceWorkerConfig } = require('./base');

module.exports = [
  {
    ...devMainConfig,
    plugins: [
      ...devMainConfig.plugins,
      new webpack.DefinePlugin({
        'process.env.WITH_SW': JSON.stringify(true),
      }),
    ],
  },
  {
    ...serviceWorkerConfig,
    cache: {
      type: 'filesystem',
    },
    devtool: 'eval-cheap-module-source-map',
    plugins: [...serviceWorkerConfig.plugins, new ForkTsCheckerWebpackPlugin()],
  },
];
