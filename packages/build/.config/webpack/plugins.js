const { DefinePlugin } = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const _startCase = require('lodash/startCase')
const HtmlWebpackTemplate = require('html-webpack-template')
const { ForkTsPluginAliases } = require('../utils/paths-resolving-strategies')
const MyPlugin = require('./custom-plugins/cdn-stav-webpack-plugin')
const WebpackCdnPlugin = require('webpack-cdn-plugin')

module.exports = ({ isDevelopmentMode, constants, paths }) => {
  const { isWebApp, packageDirectoryName, isCI, isDevServer } = constants
  const { linterTsconfigPath } = paths
  return [
    new FriendlyErrorsWebpackPlugin(getFriendlyErrorsWebpackPluginOptions({ isDevelopmentMode, constants, paths })),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: linterTsconfigPath,
      async: isDevelopmentMode,
      formatter: 'codeframe',
      compilerOptions: {
        ...ForkTsPluginAliases,
      },
    }),
    new DefinePlugin({
      __DEV__: isDevelopmentMode,
    }),
    isWebApp &&
      new HtmlWebpackPlugin({
        template: HtmlWebpackTemplate,
        title: 'Flow Editor',
        bodyHtmlSnippet: '<div id="app"></div>',
      }),
    !isCI &&
      new ProgressBarPlugin({
        format: `Building ${packageDirectoryName} [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
      }),
    !isDevServer && new CleanWebpackPlugin(),
    !isDevelopmentMode &&
      new MiniCssExtractPlugin({
        filename: '[chunkhash].css',
      }),
    // new DynamicCdnWebpackPlugin(),
    new MyPlugin({}),
  ].filter(Boolean)
}

const getFriendlyErrorsWebpackPluginOptions = ({
  isDevelopmentMode,
  constants: { isWebApp, packageDirectoryName, isCI, devServerHost, devServerPort, devServerHttpProtocol },
}) => {
  const mode = isDevelopmentMode ? 'Development' : 'Production'
  const link = `${devServerHttpProtocol ? 'http' : 'https'}://${devServerHost}:${devServerPort}`
  return {
    ...(!isCI && {
      compilationSuccessInfo: {
        notes: [
          `${chalk.bold(_startCase(packageDirectoryName))} - ${mode}${
            isWebApp ? `: ${chalk.blueBright(link)}` : ''
          }\n\n`,
        ],
      },
    }),
  }
}
