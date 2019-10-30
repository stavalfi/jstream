const {
  pathsResolvingStrategies: { webpackAliases, webpackAliasesIde },
} = require('../utils')
const {
  paths: { appEntryFilePath },
  constants: { isDevServer, isWebApp, notIdeMode, disableHmr, isExperimentalReactMode },
} = require('../utils')

module.exports = () => ({
  extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
  alias: notIdeMode
    ? {
        ...webpackAliases,
        ...getReactAliases(),
        // to support webpack 5: https://github.com/webpack/webpack/issues/9802#issuecomment-547407544
        'd3-color': 'd3-color/dist/d3-color.js',
        ...(isWebApp && {
          'webapp-main-component-path': appEntryFilePath,
        }),
      }
    : webpackAliasesIde,
})

function getReactAliases() {
  if (isExperimentalReactMode) {
    return {
      react: 'react-experimental',
      'react-dom': 'react-dom-experimental',
    }
  }
  if (!disableHmr && isDevServer) {
    return {
      'react-dom': '@hot-loader/react-dom',
    }
  }
  return {}
}
