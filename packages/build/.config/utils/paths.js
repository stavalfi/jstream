const fs = require('fs')
const path = require('path')
const findGitRoot = require('find-git-root')

const { packageDirectoryName, packagesProperties, packagesDirName } = require('./constants')

function getEntryFileName(entryFolderPath) {
  return ['index.ts', 'index.tsx'].find(entryFileName => fs.existsSync(path.resolve(entryFolderPath, entryFileName)))
}

function getEntryFilePath(entryFolderPath) {
  const entryFileName = getEntryFileName(entryFolderPath)
  return path.resolve(entryFolderPath, entryFileName)
}

const repositoryDirPath = path.resolve(findGitRoot(__dirname), '..')
const mainTsconfigPath = path.resolve(repositoryDirPath, 'tsconfig.json')
const packagesPath = path.resolve(repositoryDirPath, packagesDirName)

const currentPackageRootPath = (packagesProperties.find(({ name }) => name === 'build') || {}).path
const configFolderPath = path.resolve(currentPackageRootPath, '.config')
const packageJsonFolderPath = (packagesProperties.find(({ name }) => name === packageDirectoryName) || {}).path
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
const ideEslintRcPath = path.join(configFolderPath, 'ide-eslintrc.js')
const eslintIgnorePath = path.join(packageJsonFolderPath, '.eslintignore')
const nodeModulesPath = path.resolve(packageJsonFolderPath, 'node_modules')
const mainTestsFolderPath = path.resolve(packageJsonFolderPath, 'test')
const webpackConfigPath = path.resolve(configFolderPath, 'webpack.config.js')
const webpackFolderPath = path.resolve(configFolderPath, 'webpack')
const webappReactEntryPointFolderPath = path.resolve(webpackFolderPath, 'webapp-react-entry-point')
const webappReactHmrEntryFile = path.resolve(webappReactEntryPointFolderPath, 'entry-file.jsx')
const htmlWebpackPluginIndexHtmlPath = path.resolve(webappReactEntryPointFolderPath, 'index.html')
const jsonStylesFilePathsPath = path.resolve(webappReactEntryPointFolderPath, 'json-sass-files.js')
const testPolyfillFilePath = path.resolve(mainTestsFolderPath, 'utils', 'import-polyfills.ts')

const allTestsFolders = [srcPath, mainTestsFolderPath]

const paths = {
  jsonStylesFilePathsPath,
  repositoryDirPath,
  mainTsconfigPath,
  htmlWebpackPluginIndexHtmlPath,
  webappReactEntryPointFolderPath,
  ideEslintRcPath,
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

module.exports = paths
