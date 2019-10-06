const { webpackAliases, webpackAliasesIde } = require('../utils/paths-resolving-strategies')

module.exports = ({ constants: { isDevServer, isWebApp, notIdeMode }, paths: { appEntryFilePath } }) => ({
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
