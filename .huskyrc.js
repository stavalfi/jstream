const tasks = arr => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': tasks([
      'pretty-quick --staged',
      'lerna run --parallel tsc',
      'lerna run --concurrency 1 --stream lint-staged',
    ]),
  },
}
