const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackBar = require('webpackbar');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
console.log(isDevelopment);

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  stats: {
    errorDetails: true,
  },
  optimization: {
    innerGraph: false,
    minimize: false,
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  entry: './src/index.tsx',
  devtool: isDevelopment ? 'inline-source-map' : 'source-map',
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    port: 4000,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'public'),
      publicPath: '/',
      watch: true,
    },
    proxy: {
      '/api': 'http://localhost:3000',
    },
    hot: true,
    devMiddleware: {
      publicPath: '/',
      writeToDisk: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean),
              }),
              transpileOnly: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|ico|txt)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '/',
              publicPath: '/',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve('resources/js'),
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CleanWebpackPlugin(),
    new WebpackBar({
      name: `${isDevelopment ? 'dev' : 'build'}:${currentBranch}`,
      color: isDevelopment ? '#008cff' : '#c91313',
    }),
    new EslintWebpackPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      cache: true,
      files: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: '/node_modules/',
    }),
    new ForkTsCheckerWebpackPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
};
