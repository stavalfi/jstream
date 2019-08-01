const { externals, moduleWithRules, resolve, plugins, devServer } = require('./index')
const { paths, constants } = require('../utils')

const { distPath, appEntryFilePaths } = paths
const { isWebApp } = constants

let config // because `eslint-import-resolver-webpack` calls webpack.config too much times.

module.exports = (env = {}, argv = {}) => {
  const isDevelopmentMode = env.devServer || argv.mode !== 'production'
  const publicPath = '/'
  if (!config) {
    config = {
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

      devServer: devServer({ isDevelopmentMode, constants, publicPath, paths }),

      externals: externals({ isDevelopmentMode, constants, publicPath, paths }),

      resolve: resolve({ isDevelopmentMode, constants, publicPath, paths }),

      plugins: plugins({ isDevelopmentMode, constants, publicPath, paths }),

      module: moduleWithRules({ isDevelopmentMode, constants, publicPath, paths }),
    }
  }
  return config
}
