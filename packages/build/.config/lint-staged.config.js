const { paths } = require('./utils')

const { eslintRcPath } = paths

module.exports = {
  '*.{js,jsx,ts,tsx,json,d.ts}': [`eslint --config ${eslintRcPath} --max-warnings 0 --fix`, 'git add'],
}
