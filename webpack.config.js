const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'none',
    entry: ['babel-polyfill', './src/main.jsx'],
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.glsl', '.proto', '.yaml']
    },
    resolveLoader: {
        alias: {
            'glsl-custom-loader': path.join(__dirname, './utils/webpack-loaders/glsl_loader.js')
        }
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['react', 'env', 'flow', ['minify', {
                        mangle: false
                    }]],
                    plugins: [
                        path.join(__dirname, './utils/babel-transforms/location.js'),
                        'transform-decorators-legacy',
                        'transform-class-properties',
                        'transform-object-rest-spread'
                    ]
                }
            }, {
                loader: 'eslint-loader'
            }]
        }, {
            test: /\.glsl?$/,
            use: [{
                loader: 'glsl-custom-loader'
            }]
        }, {
            test: /\.proto?$/,
            use: [{
                loader: 'raw-loader'
            }]
        }, {
            test: /\.yaml?$/,
            use: [{
                loader: 'yml-loader'
            }]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"' + process.env.NODE_ENV + '"'
            }
        })
    ]
};
