const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const { externals, output, moduleWithRules, resolve, plugins, devServer, optimization } = require('./webpack')
const { paths, constants } = require('./utils')

const { appEntryFilePath, webappReactHmrEntryFile } = paths
const { isMeasureWebpack, isWebApp, isDevelopmentMode, isBuildInfoMode } = constants

const smp = new SpeedMeasurePlugin({
  // to enable -> you will need to downgrade HtmlWebpackPlugin to 3.x also.
  disable: !isMeasureWebpack,
  granularLoaderData: false,
})

const config = {
  mode: isDevelopmentMode ? 'development' : 'production',

  stats: isDevelopmentMode && !isBuildInfoMode ? 'none' : 'normal',

  devtool: isDevelopmentMode ? 'cheap-module-eval-source-map' : 'none',

  entry: {
    index: isWebApp ? webappReactHmrEntryFile : appEntryFilePath,
  },

  output: output({ constants, paths }),

  devServer: devServer({ constants, paths }),

  externals: externals({ constants, paths }),

  resolve: resolve({ constants, paths }),

  plugins: plugins({ constants, paths }),

  module: moduleWithRules({ constants, paths }),

  optimization: optimization({ constants, paths }),

  node: {
    Buffer: false,
    process: false,
  },
}

module.exports = smp.wrap(config)
