module.exports = ({ constants: { isWebApp }, paths: { distPath } }) => ({
  path: distPath,
  pathinfo: false,
  filename: `[${isWebApp ? 'hash' : 'name'}].js`,
  ...(!isWebApp && { libraryTarget: 'umd' }),
})
