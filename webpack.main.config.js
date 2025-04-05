module.exports = {
  entry: './src/main/main.ts',
  target: 'electron-main',
  output: {
    filename: 'index.js',
    path: require('path').resolve(__dirname, '.webpack/main')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
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
}; 