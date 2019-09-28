const { webpackDevelopmentAlias, webpackOtherAlias, webpackProdAlias } = require('../utils/paths-resolving-strategies')

module.exports = ({ isDevelopmentMode, constants: { isDevServer, isWebApp }, paths: { appEntryFilePath } }) => {
  const baseAlias = isDevelopmentMode ? webpackDevelopmentAlias : webpackProdAlias
  return {
    extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
    alias: {
      ...baseAlias,
      ...webpackOtherAlias,
      ...(isDevServer && {
        'react-dom': '@hot-loader/react-dom',
      }),
      ...(isWebApp && {
        'webapp-main-component-path': appEntryFilePath,
      }),
    },
  }
}
