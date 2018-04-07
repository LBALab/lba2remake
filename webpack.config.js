const webpack = require('webpack');
const path = require('path');
const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');

module.exports = {
    entry: './src/main.jsx',
    output: {
        path: path.join(__dirname, './www'),
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    resolveLoader: {
        alias: {
            'glsl-custom-loader': path.join(__dirname, "./utils/webpack-loaders/glsl_loader.js")
        }
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['babel', 'eslint']
            },
            {
                test: /\.glsl?$/,
                loader: 'glsl-custom-loader'
            },
            {
                test: /\.proto?$/,
                loader: 'raw-loader'
            },
            {
                test: /\.json?$/,
                loader: 'json-loader'
            },
            {
                test: /\.yaml?$/,
                loader: 'yml-loader'
            }
        ]
    },
    devServer: {
        inline: true,
        contentBase: path.join(__dirname, './www')
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"' + process.env.NODE_ENV + '"'
            }
        }),
        new FlowStatusWebpackPlugin({
            failOnError: true,
            binaryPath: require('flow-bin')
        })
    ]
};
