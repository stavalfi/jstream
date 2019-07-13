module.exports = ({ constants: { isWebApp } }) =>
  isWebApp
    ? {}
    : {
        lodash: 'lodash',
        redux: 'redux',
        'redux-thunk': 'redux-thunk',
      }
