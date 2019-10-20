const tasks = arr => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': tasks(['yarn lerna run lint-staged --stream --scope=@jstream/parser', 'pretty-quick --staged']),
  },
}
