// this file exists because karma-websotrm-plugin doesn't
// specify any information on where the user is running the tests from.

module.exports = [
  {
    packageDirectoryName: 'parser',
    isWebApp: false,
  },
  {
    packageDirectoryName: 'editor',
    isWebApp: true,
  },
  {
    packageDirectoryName: 'flower',
    isWebApp: false,
  },
]
