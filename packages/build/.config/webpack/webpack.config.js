const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const { externals, output, moduleWithRules, resolve, plugins, devServer } = require('./index')
const { paths, constants } = require('../utils')

const { appEntryFilePath, webappReactHmrEntryFile } = paths
const { isMeasureWebpack, isWebApp } = constants

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

      devtool: isDevelopmentMode ? 'cheap-module-eval-source-map' : 'none',

      entry: {
        index: isWebApp ? webappReactHmrEntryFile : appEntryFilePath,
      },

      output: output({ isDevelopmentMode, constants, paths }),

      devServer: devServer({ isDevelopmentMode, constants, paths }),

      externals: externals({ isDevelopmentMode, constants, paths }),

      resolve: resolve({ isDevelopmentMode, constants, paths }),

      plugins: plugins({ isDevelopmentMode, constants, paths }),

      module: moduleWithRules({ isDevelopmentMode, constants, paths }),
    })
  }
  return config
}
