const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const jsonImporter = require('node-sass-json-importer')
const { babelDevelopmentAlias, babelProdAlias } = require('../utils/paths-resolving-strategies')

module.exports = ({
  isDevelopmentMode,
  constants: { isWebApp, isCI, isManualRun, keepConsole, publicPath, isDevServer },
  paths: { srcPath, eslintRcPath, libTsconfigFilePath, babelRcPath, packageJsonFolderPath },
}) => ({
  rules: [
    {
      test: /\.(ts|js)x?$/,
      exclude: /(node_module|dist|my-symphony.font.js)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            ...require(babelRcPath)({ isDevelopmentMode, isCI, isManualRun, keepConsole, isDevServer, isWebApp }),
          },
        },
        ...(isWebApp || isDevelopmentMode
          ? []
          : [
              {
                loader: 'ts-loader',
                options: {
                  context: packageJsonFolderPath,
                  configFile: libTsconfigFilePath,
                  experimentalFileCaching: true,
                  // to speed up build: we can set to true when this fixed: https://github.com/TypeStrong/ts-loader/issues/957
                  transpileOnly: false,
                },
              },
              {
                loader: '@stavalfi/babel-plugin-module-resolver-loader',
                options: {
                  cwd: srcPath,
                  root: [srcPath],
                  extensions: ['.js', '.jsx', '.d.ts', '.ts', '.tsx'],
                  alias: isDevelopmentMode ? babelDevelopmentAlias : babelProdAlias,
                },
              },
            ]),
        // {
        //   loader: 'eslint-loader',
        //   options: {
        //     failOnError: !isDevelopmentMode,
        //     failOnWarning: !isDevelopmentMode,
        //     configFile: eslintRcPath,
        //     fix: false,
        //     cache: true,
        //     formatter: require('eslint-formatter-friendly'),
        //   },
        // },
      ],
    },
    {
      test: /\.css$/,
      loaders: getCssLoaders({ isDevelopmentMode, isWebApp }),
    },
    {
      test: /\.font\.js$/,
      loaders: [
        ...getCssLoaders({ isDevelopmentMode, isWebApp }),
        {
          loader: 'webfonts-loader',
          options: {
            types: 'ttf',
            publicPath,
            baseSelector: '.sf',
          },
        },
      ],
    },
    {
      test: /\.(jpe?g|png|gif)$/i,
      loaders: [
        {
          loader: 'file-loader',
          options: {
            query: {
              name: 'assets/[hash].[name].[ext]',
            },
          },
        },
        !isDevelopmentMode && {
          loader: 'image-webpack-loader',
          options: {
            query: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: true,
              },
              optipng: {
                optimizationLevel: 7,
              },
            },
          },
        },
      ].filter(Boolean),
    },
    {
      test: /\.svg(\?.*)?$/,
      loaders: ['url-loader?limit=10000&mimetype=image/svg+xml'],
    },
    {
      test: /\.ttf(\?.*)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/octet-stream',
    },
    {
      test: /\.(woff|woff2)(\?.*)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff',
    },
    {
      test: /\.eot(\?.*)?$/,
      loader: 'url-loader?limit=10000&mimetype=application/vnd.ms-fontobject',
    },
    {
      test: /\.(scss|sass)$/,
      exclude: /(node_modules)/,
      use: [
        ...getCssLoaders({ isDevelopmentMode, isWebApp }),
        {
          loader: 'sass-loader',
          options: {
            indentedSyntax: true,
            importer: jsonImporter,
          },
        },
      ],
    },
  ],
})

function getCssLoaders({ isDevelopmentMode, isWebApp }) {
  return [!isWebApp || isDevelopmentMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'fast-css-loader']
}
