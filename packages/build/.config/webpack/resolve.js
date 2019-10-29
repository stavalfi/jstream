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
    'd3-color': 'd3-color/dist/d3-color.js', // to support webpack 5: https://github.com/webpack/webpack/issues/9802#issuecomment-547407544
    ...(notIdeMode ? webpackAliases : webpackAliasesIde),
    ...(isDevServer && {
      'react-dom': '@hot-loader/react-dom',
    }),
    ...(isWebApp && {
      'webapp-main-component-path': appEntryFilePath,
    }),
  },
})
