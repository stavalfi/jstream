module.exports = ({ constants: { isWebApp, isDevServer, publicPath }, paths: { distPath } }) => ({
  path: distPath,
  pathinfo: false,
  publicPath,
  filename: `[${isDevServer ? 'hash' : 'contenthash'}].[name].js`,
  ...(!isWebApp && { libraryTarget: 'umd' }),
})
