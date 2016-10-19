var webpack = require('webpack');
var path = require('path');
var FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');

module.exports = {
    entry: "./src/main.jsx",
    output: {
        path: './www',
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    resolveLoader: {
        alias: {
            'glsl-custom-loader': path.join(__dirname, "./webpack/loaders/glsl_loader.js")
        }
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel'
            },
            {
                test: /\.glsl?$/,
                loader: 'glsl-custom-loader'
            },
            {
                test: /\.proto?$/,
                loader: 'raw-loader'
            }
        ]
    },
    devServer: {
        inline: true,
        contentBase: "./www"
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
