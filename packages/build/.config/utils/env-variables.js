const stringToBoolean = require('boolean')
const packagesProperties = require('./packages-properties')

const pwd = process.env.PWD || process.env['PWD'] || ''
const packageProperties = packagesProperties.find(({ packageDirectoryName }) => pwd.endsWith(packageDirectoryName))

const packageDirectoryName = packageProperties
  ? packageProperties.packageDirectoryName
  : process.env.FOLDER || process.env['FOLDER']

const isWebApp = packageProperties
  ? packageProperties.isWebApp
  : stringToBoolean(process.env.WEBAPP || process.env['WEBAPP'])

const isCI = stringToBoolean(process.env.CI || process.env['CI'])

module.exports = {
  packageDirectoryName,
  isWebApp,
  isCI,
}
