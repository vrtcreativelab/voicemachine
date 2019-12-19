const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  target: "node",

  output: {
    path: path.resolve("dist"),
    filename: "index.js",
    libraryTarget: "commonjs"
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: "babel-loader"
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  },
  externals: {
    "actions-on-google": "actions-on-google"
  }
};
