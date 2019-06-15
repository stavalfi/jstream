const { constants } = require('../utils')

const { devServerHost, devServerPort } = constants

module.exports = () => ({
  host: devServerHost,
  port: devServerPort,
  quiet: true,
})
