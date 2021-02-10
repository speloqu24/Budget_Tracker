// EDIT THE COLORS/NAMES/WHATEVER I WANT

const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");
const config = {
  mode: "production",
  entry: {
    app: "./index.js",
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].bundle.js",
  },
  plugins: [
    new WebpackPwaManifest({
      fingerprints: false,
      inject: false,
      name: "Budget Tracker",
      short_name: "Budget Tracker",
      description: "An application for budget tracking.",
      background_color: "#DDDDDD",
      theme_color: "#DDDDDD",
      start_url: "/",
      icons: [
        {
          src: path.resolve("./icons/icon-192x192.png"),
          sizes: [96, 128, 192, 256, 384, 512],
          destination: path.join("assets", "icons"),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};

module.exports = config;
