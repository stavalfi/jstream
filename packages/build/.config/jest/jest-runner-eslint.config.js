const { paths } = require('../utils')

const { eslintRcPath } = paths

module.exports = {
  cliOptions: {
    config: eslintRcPath,
    format: 'eslint-formatter-friendly',
  },
}
