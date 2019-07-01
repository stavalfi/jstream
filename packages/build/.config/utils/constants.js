const envVariables = require('./env-variables')

const mainProjectDirName = 'flow'
const packagesDirName = 'packages'

const filesExt = ['ts', 'tsx', 'js', 'jsx']
const testFilesExt = 'spec'

module.exports = {
  mainProjectDirName,
  packagesDirName,
  devServerPort: 8002,
  devServerHost: 'localhost',
  devServerHttpProtocol: true,
  filesExt,
  testFilesExt,
  ...envVariables,
  packagesProperties: require('./packages-properties'),
}
