const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: [path.resolve(__dirname, 'src/index.js')],
  // devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name]-[hash].js',
    publicPath: '/',
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        {
          from: 'static',
          to: path.resolve(__dirname, 'public'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/phaser/build/phaser.js'),
          to: path.resolve(__dirname, 'public'),
        },
      ],
      { debug: 'warning' },
    ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.ProvidePlugin({
      Promise: 'imports-loader?this=>global!exports-loader?global.Promise!es6-promise',
      fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'template.html',
    }),
  ].concat(
    isProd
      ? [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
          },
        }),
      ]
      : [],
  ),
  module: {
    rules: [
      {
        test: /\.json$/,
        use: 'file-loader',
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules/fp-api')],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              plugins() {
                return [autoprefixer];
              },
            },
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.woff|\.woff2|.eot|\.ttf/,
        use: 'url-loader?prefix=font/&limit=10000&name=[name]-[hash].[ext]',
      },
      {
        test: /\.mp3$/,
        use: 'file-loader?hash=sha512&digest=hex&name=[name]-[hash].[ext]',
      },
      {
        test: /\.(gif|png|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              hash: 'sha512',
              digest: 'hex',
              name: '[name]-[hash].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              progressive: true,
              optipng: {
                optimizationLevel: 7,
              },
              gifsicle: {
                interlaced: false,
              },
            },
          },
        ],
      },
      {
        test: /\.jpg$/,
        use: [
          {
            loader: 'url-loader?hash=sha512&digest=hex&name=[name]-[hash].[ext]',
            options: {
              limit: 25000,
            },
          },
        ],
      },
      {
        test: /\.xml$/,
        use: 'file-loader?hash=sha512&digest=hex&name=[name]-[hash].[ext]',
      },
    ],
  },
  node: {
    fs: 'empty',
  },
  resolve: {
    alias: {
      src: path.join(__dirname, 'src'),
      assets: path.join(__dirname, 'assets'),
    },
  },
  externals: {
    phaser: 'Phaser',
  },
};
