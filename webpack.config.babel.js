import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
require('dotenv').config({ path: './.env' });

const { NODE_ENV } = process.env
const isProduction = NODE_ENV === 'production'
const directory = isProduction ? 'dist' : 'dev'

const loaders = [
  {
    test: /\.jsx?$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    },
  },
  {
    test: /\.(css|pcss)$/,
    include: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules/normalize.css'),
      path.resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free'),
      path.resolve(__dirname, 'node_modules/source-sans-pro'),
      path.resolve(__dirname, 'node_modules/mapbox-gl/dist'),
      path.resolve(__dirname, 'node_modules/simplemde/dist'),
      path.resolve(__dirname, 'node_modules/react-select'),
      path.resolve(__dirname, 'node_modules/c3'),
    ],
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          sourceMap: !isProduction,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: !isProduction,
        },
      },
    ],
  },
  {
    test: /\.(png|svg|jpg|gif|ico|woff|woff2|ttf|eot|otf)$/,
    type: 'asset/resource'
  }
]

const baseConfig = {
  mode: NODE_ENV,
  devtool: 'cheap-source-map',
  externals: [
    'bufferutil',
    'utf-8-validate',
    // Workaround for this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/194
    {'node-fetch': 'commonjs2 node-fetch'}
  ],
  context: path.join(__dirname, 'src'),
  module: {
    exprContextCritical: false,
    rules: loaders,
  },
  output: {
    path: path.join(__dirname, directory),
    publicPath: !isProduction ? `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/`
      : `${process.env.API_SCHEME}://${process.env.API_HOST}`
        .concat(process.env.API_PORT ? `:${process.env.API_PORT}/` : '/'),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /canvas/
    }),
    new MiniCssExtractPlugin({
      filename: 'public/styles.css',
    }),
  ],
}

const configServer = merge(baseConfig, {
  entry: [
    '@babel/register',
    '@babel/polyfill',
    './server.js',
  ],
  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
    filename: 'server.js',
  },
})

if (isProduction) {
  // Minimize all CSS
  configServer.plugins.push(
    new CssMinimizerPlugin(),
  )
}

const configClient = merge(baseConfig, {
  target: 'web',
  entry: [
    '@babel/polyfill',
    './client.js',
  ],
  output: {
    filename: 'public/client.js',
  },
})

export default [configClient, configServer]
