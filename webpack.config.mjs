import path from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	entry: './public/index.ts',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public'),
	},
  	mode: 'development',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
						  	url: true,
							sourceMap: true,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: /\.svg$/i,
				type: 'asset/resource',
				generator: {
				  	filename: 'assets/icons/[name][ext]',
				},
			},
			{
				test: /\.ttf$/i,
				type: 'asset/resource',
				generator: {
				  	filename: 'assets/fonts/[name][ext]',
				},
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'styles/styles.css',
			chunkFilename: 'styles/[id].css',
		}),
	],
	resolve: {
		extensions: ['.ts', '.js', '.scss'],
		alias: {
			'@components': path.resolve('public/Components'),
			'@views': path.resolve('public/Views'),
			'@modules': path.resolve('public/modules'),
			'@styles': path.resolve('public/styles'),
			'@utils': path.resolve('public/utils'),
			'@assets': path.resolve('public/assets'),
			'@constants': path.resolve('public/constants.scss'),
			'@router': path.resolve('public/Router.ts')
		}
	},
	devtool: 'source-map',
	watch: true,
};
