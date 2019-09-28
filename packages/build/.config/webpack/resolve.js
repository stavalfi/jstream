const { webpackAliases } = require('../utils/paths-resolving-strategies')

module.exports = ({ constants: { isDevServer, isWebApp }, paths: { appEntryFilePath } }) => ({
  extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
  alias: {
    ...webpackAliases,
    ...(isDevServer && {
      'react-dom': '@hot-loader/react-dom',
    }),
    ...(isWebApp && {
      'webapp-main-component-path': appEntryFilePath,
    }),
  },
})
