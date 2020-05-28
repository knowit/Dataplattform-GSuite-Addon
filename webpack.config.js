const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

module.exports = {
	entry:{
		index:'./src/client/index.tsx'
	},
	output: {
		filename: '[name].stage.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [{
			test: /\.tsx?$/,
			loader: 'babel-loader',
		}] 
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx"]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/client/index.html",
			filename: "index.html",
			inlineSource: ".(js|css)$" // embed all javascript and css inline
		}),
		new HtmlWebpackInlineSourcePlugin(),
		new CleanWebpackPlugin(),
		new CopyPlugin({
			patterns: [
				{from: 'src/gas/**/*', flatten: true},
				'appsscript.json',
				'.clasp.json'
			]
		})
	]
};