const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/renderer/hockey-index.tsx',
  target: 'electron-renderer',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      path: false,
      fs: false,
      crypto: false,
      os: false,
      util: false,
      assert: false
    }
  },
  output: {
    filename: 'renderer/hockey.js',
    path: path.resolve(__dirname, '../../dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/hockey.html',
      filename: 'renderer/hockey.html',
      chunks: ['main']
    }),
  ],
}; 