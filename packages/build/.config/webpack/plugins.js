const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const _startCase = require('lodash/startCase')
const _flatMap = require('lodash/flatMap')

module.exports = ({ isDevelopmentMode, constants, paths }) => {
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
    new FriendlyErrorsWebpackPlugin(getFriendlyErrorsWebpackPluginOptions({ isDevelopmentMode, constants, paths })),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: linterTsconfigPath,
      async: false,
      formatter: 'codeframe',
      compilerOptions: getCompilerOptions(isDevelopmentMode, { isDevelopmentMode, constants, paths }),
    }),
    ...(isDevelopmentMode ? developmentPlugins : productionPlugins),
    new CleanWebpackPlugin(),
  ]
}

const getCompilerOptions = (
  isDevelopmentMode,
  { constants: { packagesProperties, mainProjectDirName }, paths: { packagesPath, mainTestsFolderPath } },
) => ({
  baseUrl: packagesPath,
  paths: {
    '*': _flatMap(['src', 'test', 'node_modules'], subFolder =>
      packagesProperties.map(packageProperties => `${packageProperties.packageDirectoryName}/${subFolder}/*`),
    ).concat(['../node_modules/*']),
    ...packagesProperties
      .map(packageProperties => ({
        [`@${packageProperties.packageDirectoryName}/*`]: [`${packageProperties.packageDirectoryName}/src/*`],
        [`@${packageProperties.packageDirectoryName}-test/*`]: [`${packageProperties.packageDirectoryName}/test/*`],
      }))
      .reduce((acc, obj) => ({ ...acc, ...obj }), {}),
    ...(isDevelopmentMode &&
      packagesProperties
        .map(packageProperties => ({
          [`@${mainProjectDirName}/${packageProperties.packageDirectoryName}`]: [
            `${packageProperties.packageDirectoryName}/src/${packageProperties.isWebApp ? 'index.tsx' : 'index.ts'}`,
          ],
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})),
  },
})

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
