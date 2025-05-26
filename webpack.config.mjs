import path from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	entry: {
		main: './public/index.ts',
		sw: './public/sw.ts',
	},
	output: {
		filename: (pathData) => {
			return pathData.chunk.name === 'sw' ? '[name].js' : 'bundle.js';
		},
		path: path.resolve(__dirname, 'public'),
		// clean: true, // очищать папку output перед сборкой
	},
	mode: 'development',
	watch: true,
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
							sourceMap: false,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: false,
						},
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/images/[name][ext]',
				},
			},
			{
				test: /\.ttf$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/fonts/[name][ext]',
				},
			},
			{
				test: /\.woff2$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/fonts/[name][ext]',
				},
			},
		],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					format: {
						comments: false,
					},
				},
				extractComments: false,
			}),
			new CssMinimizerPlugin(),
			new ImageMinimizerPlugin({
				minimizer: {
					implementation: ImageMinimizerPlugin.imageminMinify,
					options: {
						plugins: [
							['gifsicle', { interlaced: true }],
							['jpegtran', { progressive: true }],
							['optipng', { optimizationLevel: 5 }],
							[
								'svgo',
								{
									plugins: [
										{
											name: 'removeViewBox',
											active: false,
										},
									],
								},
							],
						],
					},
				},
			}),
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
			'@router': path.resolve('public/Router.ts'),
			'@config': path.resolve('public/config')
		}
	},
	devtool: 'source-map',
};
