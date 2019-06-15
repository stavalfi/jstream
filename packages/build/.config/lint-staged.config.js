const { paths } = require('./utils')

const { eslintRcPath } = paths

module.exports = {
  linters: {
    '*.{js,jsx,ts,tsx,json,d.ts}': [`eslint --config ${eslintRcPath} --fix`, 'git add'],
  },
}
