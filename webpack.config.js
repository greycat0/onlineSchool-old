const path = require('path');

module.exports = {
  mode: 'development',
  entry:[
    'babel-polyfill',
    './src/index.js'
  ],
  output: {
    filename: "../public/index.js"
  },
  node: {
    fs: "empty"
  }
}
