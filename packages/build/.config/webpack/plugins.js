const { DefinePlugin } = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const _startCase = require('lodash/startCase')
const { ForkTsPluginAliases } = require('../utils/paths-resolving-strategies')
const GitRevisionPlugin = require('git-revision-webpack-plugin')

const {
  paths: { linterTsconfigPath, eslintRcPath, htmlWebpackPluginIndexHtmlPath },
  constants: {
    isDevelopmentMode,
    isWebApp,
    packageDirectoryName,
    isCI,
    isDevServer,
    mainProjectDirName,
    isBuildInfoMode,
    devServerHost,
    devServerPort,
    devServerHttpProtocol,
  },
} = require('../utils')

module.exports = () => {
  const gitRevisionPlugin = new GitRevisionPlugin()

  const eslintConfig = require(eslintRcPath)

  return [
    !isBuildInfoMode && new FriendlyErrorsWebpackPlugin(getFriendlyErrorsWebpackPluginOptions()),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: linterTsconfigPath,
      async: isDevelopmentMode,
      formatter: 'codeframe',
      compilerOptions: {
        ...ForkTsPluginAliases,
      },
      eslint: true,
      eslintOptions: {
        ...eslintConfig,
        globals: Object.keys(eslintConfig.globals || {}),
      },
    }),
    new DefinePlugin({
      __DEV__: isDevelopmentMode,
    }),
    isWebApp &&
      new HtmlWebpackPlugin({
        template: htmlWebpackPluginIndexHtmlPath,
        build_info: [
          '<!--',
          `Project: ${mainProjectDirName}`,
          `Package: ${packageDirectoryName}`,
          `Repository-Git-Branch: ${JSON.stringify(gitRevisionPlugin.branch())}`,
          `Repository-Git-Hash: ${JSON.stringify(gitRevisionPlugin.commithash())}`,
          '-->',
        ].join('\n'),
      }),
    !isBuildInfoMode &&
      !isCI &&
      new ProgressBarPlugin({
        format: `Building ${packageDirectoryName} [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
      }),
    !isDevServer && new CleanWebpackPlugin(),
    !isDevelopmentMode &&
      new MiniCssExtractPlugin({
        filename: '[contenthash].css',
      }),
  ].filter(Boolean)
}

const getFriendlyErrorsWebpackPluginOptions = () => {
  const mode = isDevelopmentMode ? 'Development' : 'Production'
  const link = `${devServerHttpProtocol ? 'http' : 'https'}://${devServerHost}:${devServerPort}`
  return {
    ...(!isCI && {
      compilationSuccessInfo: {
        notes: [
          `${chalk.bold(_startCase(packageDirectoryName))} - ${mode}${
            isDevServer ? `: ${chalk.blueBright(link)}` : ''
          }\n\n`,
        ],
      },
    }),
  }
}
