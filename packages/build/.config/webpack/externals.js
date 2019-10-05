const nodeExternals = require('webpack-node-externals')

module.exports = ({ constants: { isWebApp } }) => [
  function(context, request, callback) {
    if (/^(react|react-dom)$/.test(request)) {
      return callback(null, 'commonjs ' + request)
    }
    callback()
  },
]
// isWebApp
//   ? {
//       react: 'React',
//       'react-dom': 'ReactDOM',
//     }
//   : {
//       react: 'React',
//       'react-dom': 'ReactDOM',
//       'react-router': 'ReactRouter',
//       lodash: 'lodash',
//       redux: 'redux',
//       'redux-thunk': 'redux-thunk',
//       d3: 'd3',
//       immer: 'immer',
//     }
