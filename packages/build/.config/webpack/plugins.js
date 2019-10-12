const { DefinePlugin } = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const _startCase = require('lodash/startCase')
const HtmlWebpackTemplate = require('html-webpack-template')
const { ForkTsPluginAliases } = require('../utils/paths-resolving-strategies')
const GitRevisionPlugin = require('git-revision-webpack-plugin')

module.exports = ({ constants, paths }) => {
  const {
    isDevelopmentMode,
    isWebApp,
    packageDirectoryName,
    isCI,
    isDevServer,
    mainProjectDirName,
    isBuildInfoMode,
  } = constants
  const { linterTsconfigPath, eslintRcPath } = paths
  const gitRevisionPlugin = new GitRevisionPlugin()

  const eslintConfig = require(eslintRcPath)

  const htmlComment = [
    `Project: ${mainProjectDirName}`,
    `Package: ${packageDirectoryName}`,
    `Repository-Git-Branch: ${JSON.stringify(gitRevisionPlugin.branch())}`,
    `Repository-Git-Hash: ${JSON.stringify(gitRevisionPlugin.commithash())}`,
  ].join('\n')

  const bodyHtmlSnippet = `
  <!--
${htmlComment}
  -->
  <div id="app"></div>
  `

  return [
    !isBuildInfoMode && new FriendlyErrorsWebpackPlugin(getFriendlyErrorsWebpackPluginOptions({ constants, paths })),
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
        template: HtmlWebpackTemplate,
        title: 'Flow Editor',
        bodyHtmlSnippet,
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

const getFriendlyErrorsWebpackPluginOptions = ({
  constants: {
    isDevelopmentMode,
    packageDirectoryName,
    isCI,
    devServerHost,
    devServerPort,
    devServerHttpProtocol,
    isDevServer,
  },
}) => {
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
