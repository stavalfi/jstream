const envVariables = require('./env-variables')
const packagesProperties = require('./packages-properties')

const mainProjectDirName = 'jstream'
const packagesDirName = 'packages'

const filesExt = ['ts', 'tsx', 'js', 'jsx']
const testFilesExt = 'spec'

module.exports = {
  mainProjectDirName,
  packagesDirName,
  publicPath: '/',
  devServerPort: 8002,
  devServerHost: 'localhost',
  devServerHttpProtocol: true,
  filesExt,
  testFilesExt,
  packagesProperties,
  ...envVariables,
}
