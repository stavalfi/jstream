const envVariables = require('./env-variables')
const packagesProperties = require('./packages-properties')

const mainProjectDirName = 'jstream'
const packagesDirName = 'packages'

const filesExt = ['ts', 'tsx', 'js', 'jsx']
const testFilesExt = 'spec'

const constants = {
  mainProjectDirName,
  packagesDirName,
  publicPath: '/',
  devServerHttpProtocol: true,
  filesExt,
  testFilesExt,
  packagesProperties,
  ...envVariables,
}

module.exports = constants
