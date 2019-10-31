const { DefinePlugin } = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
const _startCase = require('lodash/startCase')
const {
  pathsResolvingStrategies: { ForkTsPluginAliases },
} = require('../utils')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')

const {
  paths: { mainTsconfigPath, htmlWebpackPluginIndexHtmlPath },
  constants: {
    isWebpack5Mode,
    isDevelopmentMode,
    isExperimentalReactMode,
    isWebApp,
    packageDirectoryName,
    isCI,
    disableHmr,
    isDevServer,
    mainProjectDirName,
    isBuildInfoMode,
    devServerHost,
    devServerPort,
    devServerHttpProtocol,
  },
} = require('../utils')

const HtmlWebpackPlugin = isWebpack5Mode ? require('html-webpack-plugin-webpack5') : require('html-webpack-plugin')

module.exports = () => {
  const gitRevisionPlugin = new GitRevisionPlugin()

  return [
    !isBuildInfoMode && new FriendlyErrorsWebpackPlugin(getFriendlyErrorsWebpackPluginOptions()),
    !isDevelopmentMode &&
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /node_modules/,
        // add errors to webpack instead of warnings
        failOnError: false,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      }),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: mainTsconfigPath,
      async: isDevelopmentMode,
      formatter: 'codeframe',
      compilerOptions: {
        ...ForkTsPluginAliases,
      },
      eslint: false,
    }),
    new DefinePlugin({
      __DEV__: isDevelopmentMode,
      __DEV_SERVER__: isDevServer,
      __HMR__: !disableHmr,
      __REACT_EXPERIMENTAL__: isExperimentalReactMode,
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
