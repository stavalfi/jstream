const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const { externals, output, moduleWithRules, resolve, plugins, devServer, optimization, entry } = require('./webpack')
const {
  constants: { isMeasureWebpack, isDevelopmentMode, isBuildInfoMode },
} = require('./utils')

const smp = new SpeedMeasurePlugin({
  // to enable -> you will ALSO need to downgrade HtmlWebpackPlugin from 4.x to 3.x.
  disable: !isMeasureWebpack,
  granularLoaderData: false,
})

const config = {
  mode: isDevelopmentMode ? 'development' : 'production',

  stats: isDevelopmentMode && !isBuildInfoMode ? 'none' : 'normal',

  devtool: isDevelopmentMode ? 'cheap-module-eval-source-map' : 'none',

  entry: entry(),

  output: output(),

  devServer: devServer(),

  externals: externals(),

  resolve: resolve(),

  plugins: plugins(),

  module: moduleWithRules(),

  optimization: optimization(),
}

module.exports = smp.wrap(config)
