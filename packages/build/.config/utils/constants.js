const envVariables = require('./env-variables')
const packagesProperties = require('./packages-properties')

const mainProjectDirName = 'jstream'
const packagesDirName = 'packages'

const filesExt = ['ts', 'tsx', 'js', 'jsx']
const testFilesExt = 'spec'

const currentPackageProperties =
  packagesProperties.find(
    packageProperties => packageProperties.packageDirectoryName === envVariables.packageDirectoryName,
  ) || {}

module.exports = {
  mainProjectDirName,
  packagesDirName,
  devServerPort: 8002,
  devServerHost: 'localhost',
  devServerHttpProtocol: true,
  filesExt,
  testFilesExt,
  ...envVariables,
  packagesProperties,
  isWebApp: currentPackageProperties.isWebApp,
  keepConsole: currentPackageProperties.keepConsole,
}
