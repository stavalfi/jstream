module.exports = ({ constants: { isWebapp } }) =>
  isWebapp
    ? {}
    : {
        lodash: 'lodash',
      }
