const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'none',
    entry: [
        '@babel/polyfill',
        './utils/babel-transforms/inspector-globals.js',
        './src/main.js'
    ],
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
            test: /\.(js|jsx)?$/,
            include: /src/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-flow', ['minify', {
                        mangle: false
                    }]],
                    plugins: [
                        path.join(__dirname, './utils/babel-transforms/inspector-annotations.js'),
                        '@babel/plugin-proposal-class-properties',
                        '@babel/plugin-proposal-object-rest-spread'
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
