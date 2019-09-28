const fs = require('fs')
const path = require('path')

const { packageDirectoryName } = require('./constants')

function getEntryFileName(entryFolderPath) {
  return ['index.ts', 'index.tsx'].find(entryFileName => fs.existsSync(path.resolve(entryFolderPath, entryFileName)))
}

function getEntryFilePath(entryFolderPath) {
  const entryFileName = getEntryFileName(entryFolderPath)
  return path.resolve(entryFolderPath, entryFileName)
}

const currentPackageRootPath = path.resolve(__dirname, '..', '..')
const packagesPath = path.resolve(currentPackageRootPath, '..')
const configFolderPath = path.resolve(currentPackageRootPath, '.config')

const packageJsonFolderPath = path.resolve(packagesPath, packageDirectoryName)
const libTsconfigFilePath = path.resolve(configFolderPath, 'lib-tsconfig.json')
const linterTsconfigPath = path.resolve(packageJsonFolderPath, 'tsconfig.json')
const mainNodeModulesPath = path.resolve(packageJsonFolderPath, '..', '..', 'node_modules')
const srcPath = path.resolve(packageJsonFolderPath, 'src')
const appEntryFileName = getEntryFileName(srcPath)
const appEntryFilePath = getEntryFilePath(srcPath)
const distPath = path.join(packageJsonFolderPath, 'dist')
const babelRcPath = path.join(configFolderPath, 'babel.config.js')
const jestFolderPath = path.join(configFolderPath, 'jest')
const jestConfigFilePath = path.join(jestFolderPath, 'jest.config.js')
const testPolyfillsFilePath = path.join(jestFolderPath, 'polyfills.js')
const eslintRcPath = path.join(configFolderPath, '.eslintrc.js')
const eslintIgnorePath = path.join(packageJsonFolderPath, '.eslintignore')
const nodeModulesPath = path.resolve(packageJsonFolderPath, 'node_modules')
const mainTestsFolderPath = path.resolve(packageJsonFolderPath, 'test')
const webpackFolderPath = path.resolve(configFolderPath, 'webpack')
const webpackConfigPath = path.resolve(webpackFolderPath, 'webpack.config.js')
const webappReactHmrEntryFile = path.resolve(webpackFolderPath, 'webapp-react-hmr', 'index.tsx')
const testPolyfillFilePath = path.resolve(mainTestsFolderPath, 'utils', 'import-polyfills.ts')

const allTestsFolders = [srcPath, mainTestsFolderPath]

module.exports = {
  getEntryFileName,
  getEntryFilePath,
  webappReactHmrEntryFile,
  allTestsFolders,
  appEntryFileName,
  appEntryFilePath,
  babelRcPath,
  distPath,
  eslintIgnorePath,
  eslintRcPath,
  jestConfigFilePath,
  libTsconfigFilePath,
  linterTsconfigPath,
  mainNodeModulesPath,
  mainTestsFolderPath,
  nodeModulesPath,
  packageJsonFolderPath,
  packagesPath,
  srcPath,
  testPolyfillFilePath,
  testPolyfillsFilePath,
  webpackConfigPath,
  webpackFolderPath,
}
