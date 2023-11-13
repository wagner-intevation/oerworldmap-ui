import path from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import i18ns from '../src/i18ns'

import { mapboxConfig } from '../config'

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      mapboxConfig: JSON.stringify(mapboxConfig),
      i18ns: JSON.stringify(i18ns)
    }),
    new MiniCssExtractPlugin({
      filename: './public/styles.css',
    }),
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
          path.resolve(__dirname, '..')
        ],
        use: [
          MiniCssExtractPlugin.loader,
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
      },
      {
        test: /\.(png|svg|jpg|gif|ico|woff|woff2|ttf|eot|otf)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'public/'
          }
        }
      }
    ]
  }
}