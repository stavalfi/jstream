const {
  pathsResolvingStrategies: { webpackAliases, webpackAliasesIde },
} = require('../utils')
const {
  paths: { appEntryFilePath },
  constants: { isDevServer, isWebApp, notIdeMode },
} = require('../utils')

module.exports = () => ({
  extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
  alias: {
    ...(notIdeMode ? webpackAliases : webpackAliasesIde),
    ...(isDevServer && {
      'react-dom': '@hot-loader/react-dom',
    }),
    ...(isWebApp && {
      'webapp-main-component-path': appEntryFilePath,
    }),
  },
})
