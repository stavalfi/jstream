const stringToBoolean = require('boolean')
const packagesProperties = require('./packages-properties')

const pwd = process.env.PWD || process.env['PWD'] || ''
const packageProperties =
  packagesProperties.find(({ packageDirectoryName }) => pwd.endsWith(packageDirectoryName)) || {}

// it will be used when ide-tools try to run this code. i must specify packageDirectoryName or else,
// we will get errors in other files in this package.
// also, the value i specify here won't be used by the ide so it's just a valid value, not more then that.
const defaultPackageDirectoryName = 'utils'

const packageDirectoryName =
  process.env.FOLDER || process.env['FOLDER'] || packageProperties.packageDirectoryName || defaultPackageDirectoryName

const isCI = stringToBoolean(process.env.CI || process.env['CI'])
const isManualRun = stringToBoolean(process.env.MANUAL_RUN || process.env['MANUAL_RUN'])
const isDevServer = stringToBoolean(process.env.DEV_SERVER || process.env['DEV_SERVER'])
const isMeasureWebpack = stringToBoolean(process.env.MEASURE_WEBPACK || process.env['MEASURE_WEBPACK'])
const isWebApp = stringToBoolean(process.env.WEB_APP || process.env['WEB_APP'])

module.exports = {
  packageDirectoryName,
  isWebApp,
  isCI,
  isManualRun,
  isDevServer,
  isMeasureWebpack,
}
