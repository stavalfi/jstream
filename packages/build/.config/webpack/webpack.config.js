const { externals, moduleWithRules, resolve, plugins, devServer } = require('./index')
const { paths, constants } = require('../utils')

const { distPath, appEntryFilePaths } = paths
const { isWebApp } = constants

module.exports = (env = {}, argv = {}) => {
  const isDevelopmentMode = argv.mode === 'development' || env.devServer
  const publicPath = '/'

  return {
    stats: isDevelopmentMode ? 'none' : 'normal',

    devtool: isDevelopmentMode ? 'source-map' : 'none',

    entry: {
      index: appEntryFilePaths,
    },

    output: {
      path: distPath,
      filename: `[${isWebApp ? 'hash' : 'name'}].js`,
      ...(!isWebApp && { libraryTarget: 'umd' }),
    },

    devServer: devServer({ isDevelopmentMode, isTestMode: false, constants, publicPath, paths }),

    externals: externals({ isDevelopmentMode, isTestMode: false, constants, publicPath, paths }),

    resolve: resolve({ isDevelopmentMode, isTestMode: false, constants, publicPath, paths }),

    plugins: plugins({ isDevelopmentMode, isTestMode: false, constants, publicPath, paths }),

    module: moduleWithRules({ isDevelopmentMode, isTestMode: false, constants, publicPath, paths }),
  }
}
