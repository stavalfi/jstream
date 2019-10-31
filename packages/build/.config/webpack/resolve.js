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
