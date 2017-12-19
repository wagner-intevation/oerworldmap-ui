import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import StyleLintPlugin from 'stylelint-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import env from './config'

const TARGET = process.env.npm_lifecycle_event

let Config = {
  context: path.join(__dirname, 'src'),
  entry: [
    'babel-polyfill',
    './client.js',
    './views/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: `http://${env.host}:${env.port}/`,
    filename: 'bundle.js'
  },
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
          path.resolve(__dirname, 'node_modules/mapbox-gl/dist'),
        ],
      },

      {
        test: /\.(png|svg|jpg|gif|ico|woff|woff2|ttf|eot|otf)$/,
        use: [
          'file-loader'
        ]
      },

      {
        test: /\.json$/,
        use: [
          'json-loader'
        ]
      }
    ]
  },

  devtool: 'source-map',
}

if (TARGET === 'server:prod') {
  Config = merge(Config, {
    plugins: [
      new ExtractTextPlugin("styles.css"),
    ],
    module: {
      rules: [
        {
          test: /\.(css|pcss)$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/normalize.css'),
            path.resolve(__dirname, 'node_modules/font-awesome'),
            path.resolve(__dirname, 'node_modules/source-sans-pro'),
            path.resolve(__dirname, 'node_modules/mapbox-gl/dist'),
          ],
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          }),
        },
      ]
    }
  })
}

if (TARGET === 'server:dev') {
  Config.module.rules[0].use.query = {
    presets: ['react-hmre']
  }
  Config = merge(Config, {
    entry: [
      'webpack-hot-middleware/client?reload=true',
      'react-hot-loader/patch'
    ],
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new StyleLintPlugin(
        {
          emitErrors: false,
          configFile: '.stylelintrc',
          context: 'src',
          files: '**/*.pcss',
        },
      ),
    ],
    module: {
      rules: [
        {
          test: /\.(css|pcss)$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/normalize.css'),
            path.resolve(__dirname, 'node_modules/font-awesome'),
            path.resolve(__dirname, 'node_modules/source-sans-pro'),
            path.resolve(__dirname, 'node_modules/mapbox-gl/dist'),
          ],
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true
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

if (TARGET === 'server:static') {
  Config.module.rules[0].use.query = {
    presets: ['react-hmre']
  }
  Config = merge(Config, {
    entry: [
      'webpack-hot-middleware/client?reload=true',
      'react-hot-loader/patch'
    ],
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new ExtractTextPlugin("styles.css"),
      new StyleLintPlugin(
        {
          emitErrors: false,
          configFile: '.stylelintrc',
          context: 'src',
          files: '**/*.pcss',
        },
      ),
    ],
    module: {
      rules: [
        {
          test: /\.(css|pcss)$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/normalize.css'),
            path.resolve(__dirname, 'node_modules/font-awesome'),
            path.resolve(__dirname, 'node_modules/source-sans-pro'),
            path.resolve(__dirname, 'node_modules/mapbox-gl/dist'),
          ],
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          }),
        }
      ]
    }
  })
}

const WebpackConfig = Config
export default WebpackConfig