module.exports = ({ constants: { isWebApp }, paths: { distPath } }) => ({
  path: distPath,
  pathinfo: false,
  filename: `[hash].[name].js`,
  ...(!isWebApp && { libraryTarget: 'umd' }),
})
