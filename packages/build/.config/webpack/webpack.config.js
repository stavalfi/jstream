const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const { externals, output, moduleWithRules, resolve, plugins, devServer } = require('./index')
const { paths, constants } = require('../utils')

const { appEntryFilePaths } = paths
const { isDevServer, isMeasureWebpack } = constants

const smp = new SpeedMeasurePlugin({
  disable: !isMeasureWebpack,
  granularLoaderData: false,
})

let config // because `eslint-import-resolver-webpack` calls webpack.config too much times.

module.exports = (env = {}, argv = {}) => {
  const isDevelopmentMode = argv.mode !== 'production'
  if (!config) {
    config = smp.wrap({
      stats: isDevelopmentMode ? 'none' : 'normal',

      devtool: isDevelopmentMode ? 'cheap-module-eval-source-map' : 'source-map',

      entry: {
        index: appEntryFilePaths,
      },

      output: output({ isDevelopmentMode, constants, paths }),

      devServer: devServer({ isDevelopmentMode, constants, paths }),

      externals: externals({ isDevelopmentMode, constants, paths }),

      resolve: resolve({ isDevelopmentMode, constants, paths }),

      plugins: plugins({ isDevelopmentMode, constants, paths }),

      module: moduleWithRules({ isDevelopmentMode, constants, paths }),

      // optimization: {
      //   splitChunks: {
      //     cacheGroups: {
      //       vendors: {
      //         test: /[\\/]node_modules[\\/]/,
      //         name: 'vendors',
      //         chunks: 'all',
      //         enforce: true,
      //       },
      //     },
      //   },
      // },
    })
  }
  return config
}
