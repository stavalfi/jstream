const stringToBoolean = require('boolean')
const packagesProperties = require('./packages-properties')

const pwd = process.env.PWD || process.env['PWD'] || ''
const packageProperties =
  packagesProperties.find(({ packageDirectoryName }) => pwd.endsWith(packageDirectoryName)) || {}

const packageDirectoryName = process.env.FOLDER || process.env['FOLDER'] || packageProperties.packageDirectoryName
const isCI = stringToBoolean(process.env.CI || process.env['CI'])

module.exports = {
  packageDirectoryName,
  isCI,
}
