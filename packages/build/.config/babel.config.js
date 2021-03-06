const { constants } = require('./utils')

const { isWebApp, isTestMode, disableHmr } = constants

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        modules: false,
      },
    ],
    '@babel/typescript',
  ].filter(Boolean),
  plugins: [
    !disableHmr && isWebApp && 'react-hot-loader/babel',
    '@babel/proposal-object-rest-spread',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    isTestMode && 'babel-plugin-rewire',
    '@babel/proposal-class-properties',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    isTestMode && 'dynamic-import-node',
  ].filter(Boolean),
}
