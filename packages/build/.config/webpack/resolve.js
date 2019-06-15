module.exports = ({ paths: { resolveModulesPathsArray } }) => ({
  extensions: ['.js', '.sass', '.json', '.ts', '.tsx'],
  modules: resolveModulesPathsArray,
  alias: { 'react-dom': '@hot-loader/react-dom' },
})
