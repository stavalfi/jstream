const stringToBoolean = require('boolean')

const packageDirectoryName = process.env.FOLDER || process.env['FOLDER']
const isCI = stringToBoolean(process.env.CI || process.env['CI'])

module.exports = {
  packageDirectoryName,
  isCI,
}
