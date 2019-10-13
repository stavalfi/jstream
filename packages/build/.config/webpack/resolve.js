const { webpackAliases, webpackAliasesIde } = require('../utils/paths-resolving-strategies')
const {
  paths: { appEntryFilePath },
  constants: { isDevServer, isWebApp, notIdeMode },
} = require('../utils')

module.exports = π => ({
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
