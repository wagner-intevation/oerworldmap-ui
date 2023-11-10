import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import i18ns from './src/i18ns'

const ENV = process.env.NODE_ENV

let Config = {
  context: path.join(__dirname, 'src'),
  entry: [
    '@babel/polyfill',
    './site.js'
  ],
  output: {
    path: path.join(__dirname, 'docs'),
    publicPath: '/oerworldmap-ui/',
    filename: 'assets/js/bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      i18ns: JSON.stringify(i18ns)
    }),
    new webpack.ProgressPlugin()
  ],
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },

      {
        test: /\.(css|pcss)$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/normalize.css'),
          path.resolve(__dirname, 'node_modules/font-awesome'),
          path.resolve(__dirname, 'node_modules/source-sans-pro'),
        ],
      },

      {
        test: /\.(png|svg|jpg|gif|ico|woff|woff2|ttf|eot|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/'
          }
        }
      }
    ]
  }
}

if (ENV === 'production') {
  Config = merge(Config, {
    plugins: [
      new MiniCssExtractPlugin({
        filename: "assets/css/styles.css"
      }),
      new CssMinimizerPlugin(),
    ],
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(css|pcss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            "postcss-loader"
          ]
        },
      ]
    }
  })
}

if (ENV === 'development') {
  Config = merge(Config, {
    devtool: 'source-map',
    mode: 'development',
    entry: [
      'webpack-hot-middleware/client',
    ],
    devServer: {
      contentBase: __dirname + "/assets/",
      inline: true,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.(css|pcss)$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true,
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        }
      ]
    }
  })
}

const WebpackConfig = Config
export default WebpackConfig
