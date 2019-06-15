const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const terminalLink = require('terminal-link')
const _startCase = require('lodash/startCase')

module.exports = ({ isDevelopmentMode, isTestMode, constants, paths }) => {
  const { isWebApp, packageDirectoryName, isCI } = constants
  const { linterTsconfigPath, indexHtmlPath } = paths

  const productionPlugins = [
    new MiniCssExtractPlugin({
      filename: '[chunkhash].css',
    }),
  ]
  const developmentPlugins = []
  return [
    ...(isWebApp
      ? [
          new HtmlWebpackPlugin({
            template: indexHtmlPath,
          }),
        ]
      : []),
    ...(!isCI
      ? [
          new ProgressBarPlugin({
            format: `Building ${packageDirectoryName} [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
          }),
        ]
      : []),
    new FriendlyErrorsWebpackPlugin(
      getFriendlyErrorsWebpackPluginOptions({ isDevelopmentMode, isTestMode, constants, paths }),
    ),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: linterTsconfigPath,
      async: false,
    }),
    ...(isDevelopmentMode ? developmentPlugins : productionPlugins),
    ...(isTestMode ? [new CleanWebpackPlugin()] : []),
  ]
}

const getFriendlyErrorsWebpackPluginOptions = ({
  isDevelopmentMode,
  isTestMode,
  constants: { isWebApp, packageDirectoryName, isCI, devServerHost, devServerPort, devServerHttpProtocol },
}) => {
  const mode = isDevelopmentMode ? 'Development' : 'Production'
  const link = `${devServerHttpProtocol ? 'http' : 'https'}://${devServerHost}:${devServerPort}`
  const coloredLink = terminalLink('WebApp', chalk.blueBright(link))
  return {
    ...(!isCI && {
      compilationSuccessInfo: {
        notes: [
          `${chalk.bold(_startCase(packageDirectoryName))} - ${mode}${isWebApp ? `: ${coloredLink}` : ''}\n\n`,
          ...(isTestMode ? ['Test Mode'] : []),
        ],
      },
    }),
  }
}
