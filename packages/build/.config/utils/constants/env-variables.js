const stringToBoolean = require('boolean')
const packagesProperties = require('./packages-properties')

const pwd = process.env['PWD'] || ''
const packageProperties = packagesProperties.find(({ name }) => pwd.endsWith(name)) || {}

// it will be used when ide-tools try to read eslintrc.js/webpack.connfig.js/...
// to prevent failure, we must specify packageDirectoryName or else,
// we will get errors in other files in this package.
// also, the value we specify here won't be used by the ide so it's just a valid value, not more then that.
const defaultPackageDirectoryName = packagesProperties[0].name

const folder = process.env['FOLDER']
const packageDirectoryName = folder || packageProperties.name || defaultPackageDirectoryName

const isCI = stringToBoolean(process.env['CI'])
const isDevServer = stringToBoolean(process.env['DEV_SERVER'])
const isMeasureWebpack = stringToBoolean(process.env['MEASURE_WEBPACK'])
const isWebApp = stringToBoolean(process.env['WEB_APP'])
// we specify default `true` because the ide-tools try to read eslintrc.js/webpack.connfig.js/...
// and we want to give him the DEV configuration for every config file.
const isDevelopmentMode = 'DEV' in process.env ? stringToBoolean(process.env['DEV']) : true
const isTestMode = stringToBoolean(process.env['TEST'])
const notIdeMode = stringToBoolean(process.env['NOT_IDE'])
const isBuildInfoMode = stringToBoolean(process.env['BUILD_INFO'])
const devServerHost = process.env.HOST || 'localhost'
const devServerPort = process.env.LOADER_PORT || '8080'
const disableHmr = stringToBoolean(process.env.DISABLE_HMR)
const isExperimentalReactMode = stringToBoolean(process.env.REACT_EXPERIMENTAL)

const env = {
  isExperimentalReactMode,
  disableHmr: isExperimentalReactMode || disableHmr,
  devServerHost,
  devServerPort,
  pwd,
  folder,
  packageDirectoryName,
  isWebApp,
  isCI,
  isDevServer,
  isMeasureWebpack,
  isDevelopmentMode,
  isTestMode,
  notIdeMode,
  isBuildInfoMode,
}
module.exports = env
