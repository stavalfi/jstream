const {
  constants: { isWebApp },
} = require('../utils')

module.exports = () =>
  isWebApp
    ? {}
    : {
        react: 'react',
        'react-dom': 'reactDOM',
        'react-router': 'ReactRouter',
        lodash: 'lodash',
        redux: 'redux',
        'redux-thunk': 'redux-thunk',
        d3: 'd3',
        immer: 'immer',
      }
