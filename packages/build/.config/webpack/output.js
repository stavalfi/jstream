const {
  paths: { distPath },
  constants: { isWebApp, isDevServer, publicPath },
} = require('../utils')

module.exports = () => ({
  path: distPath,
  pathinfo: false,
  publicPath,
  filename: `[${isDevServer ? 'hash' : 'contenthash'}].[name].js`,
  ...(!isWebApp && { libraryTarget: 'umd' }),
})
