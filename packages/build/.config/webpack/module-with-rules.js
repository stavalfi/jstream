const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const jsonImporter = require('node-sass-json-importer')
const {
  pathsResolvingStrategies: { babelAliases },
} = require('../utils')
const {
  paths: { srcPath, libTsconfigFilePath, babelRcPath, packageJsonFolderPath },
  constants: { isDevelopmentMode, isWebApp, publicPath },
} = require('../utils')

module.exports = () => ({
  rules: [
    {
      test: /\.(ts|js)x?$/,
      exclude: /(node_module|dist|my-symphony.font.js)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            ...require(babelRcPath),
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
                  alias: babelAliases,
                },
              },
            ]),
      ],
    },
    {
      test: /\.css$/,
      use: getCssLoaders({ isDevelopmentMode, isWebApp }),
    },
    {
      test: /\.font\.js$/,
      use: [
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
      use: [
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
      use: ['url-loader?limit=10000&mimetype=image/svg+xml'],
    },
    {
      test: /\.ttf(\?.*)?$/,
      use: ['url-loader?limit=10000&mimetype=application/octet-stream'],
    },
    {
      test: /\.(woff|woff2)(\?.*)?$/,
      use: ['url-loader?limit=10000&mimetype=application/font-woff'],
    },
    {
      test: /\.eot(\?.*)?$/,
      use: ['url-loader?limit=10000&mimetype=application/vnd.ms-fontobject'],
    },
    {
      test: /\.(scss|sass)$/,
      exclude: /(node_modules)/,
      use: [...getCssLoaders({ isDevelopmentMode, isWebApp }), 'fast-sass-loader'],
    },
  ],
})

function getCssLoaders({ isDevelopmentMode, isWebApp }) {
  return [!isWebApp || isDevelopmentMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'fast-css-loader']
}
