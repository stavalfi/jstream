const { constants } = require('../utils')

const { devServerHost, devServerPort, isBuildInfoMode } = constants

module.exports = () => ({
  host: devServerHost,
  port: devServerPort,
  quiet: isBuildInfoMode,
})
