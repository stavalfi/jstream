module.exports = ({ constants: { isWebApp } }) =>
  isWebApp
    ? {}
    : {
        react: 'react',
        lodash: 'lodash',
        redux: 'redux',
        'redux-thunk': 'redux-thunk',
      }
