const { paths } = require('../utils')

const { eslintRcPath } = paths

module.exports = {
  cliOptions: {
    cache: true,
    config: eslintRcPath,
    format: 'eslint-formatter-friendly',
  },
}
