/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");

const merge = require("webpack-merge").merge;

// plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) => {
  const config = {
    entry: { game: ["./src/index.ts", "./src/style.css"] },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      // alias: {
      //     // Force CommonJS for PixiJS since some modules are not ES6 compatible
      //     "pixi.js": path.resolve(__dirname, "node_modules/pixi.js/dist/cjs/pixi.min.js"),
      // },
    },

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            "css-loader",
          ],
        },
        {
          test: /\.(png|jpg|ttf|gif|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          type: "asset/inline",
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },

    plugins: [
      new HtmlWebpackPlugin({
        inlineSource: env.mode === "production" ? ".(js|css)$" : undefined, // inlines js in html
      }),
    ],
  };
  const envConfig = require(path.resolve(__dirname, `./webpack.${env.mode}.js`))(env);

  const mergedConfig = merge(config, envConfig);

  return mergedConfig;
};
