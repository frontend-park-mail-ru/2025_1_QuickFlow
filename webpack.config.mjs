import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	entry: './public/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public'),
	},
  	mode: 'development',
	// module: {
	// 	rules: [
	// 		{
	// 			test: /\.js$/,
	// 			exclude: /node_modules/,
	// 			use: {
	// 				loader: 'babel-loader',
	// 			},
	// 		},
	// 	],
	// },
  	devtool: 'eval-source-map',
	watch: true,
	// devServer: {
	// 	static: './public',
	// 	port: 3000,
	// 	hot: true
	// },
};
