const { babelDevelopmentAlias, babelProdAlias } = require('../utils/paths-resolving-strategies')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const jsonImporter = require('node-sass-json-importer')

module.exports = ({
  isDevelopmentMode,
  constants: { isWebApp, isCI },
  publicPath = '.',
  paths: { srcPath, eslintRcPath, libTsconfigFilePath, babelRcPath, packageJsonFolderPath },
}) => ({
  rules: [
    {
      test: /\.(ts|js)x?$/,
      exclude: /(node_module|dist)/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            context: packageJsonFolderPath,
            configFile: libTsconfigFilePath,
          },
        },
      ],
    },
  ],
})
