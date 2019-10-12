const stringToBoolean = require('boolean')
const packagesProperties = require('./packages-properties')

const pwd = process.env.PWD || process.env['PWD'] || ''
const packageProperties = packagesProperties.find(({ name }) => pwd.endsWith(name)) || {}

// it will be used when ide-tools try to read eslintrc.js/webpack.connfig.js/...
// to prevent failure, we must specify packageDirectoryName or else,
// we will get errors in other files in this package.
// also, the value we specify here won't be used by the ide so it's just a valid value, not more then that.
const defaultPackageDirectoryName = 'utils'

const packageDirectoryName =
  process.env.FOLDER || process.env['FOLDER'] || packageProperties.packageDirectoryName || defaultPackageDirectoryName

const isCI = stringToBoolean(process.env.CI || process.env['CI'])
const isManualRun = stringToBoolean(process.env.MANUAL_RUN || process.env['MANUAL_RUN'])
const isDevServer = stringToBoolean(process.env.DEV_SERVER || process.env['DEV_SERVER'])
const isMeasureWebpack = stringToBoolean(process.env.MEASURE_WEBPACK || process.env['MEASURE_WEBPACK'])
const isWebApp = stringToBoolean(process.env.WEB_APP || process.env['WEB_APP'])
// we specify default `true` because the ide-tools try to read eslintrc.js/webpack.connfig.js/...
// and we want to give him the DEV configuration for every config file.
const isDevelopmentMode = stringToBoolean(process.env.DEV || process.env['DEV']) || true
const isTestMode = stringToBoolean(process.env.TEST || process.env['TEST'])
const notIdeMode = stringToBoolean(process.env.NOT_IDE || process.env['NOT_IDE'])
const isBuildInfoMode = stringToBoolean(process.env.BUILD_INFO || process.env['BUILD_INFO'])

module.exports = {
  packageDirectoryName,
  isWebApp,
  isCI,
  isManualRun,
  isDevServer,
  isMeasureWebpack,
  isDevelopmentMode,
  isTestMode,
  notIdeMode,
  isBuildInfoMode,
}
