const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'none',
    entry: [
        '@babel/polyfill',
        './utils/babel-transforms/inspector-globals.js',
        './src/main.ts'
    ],
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js',
        publicPath: path.join(__dirname, './www'),
    },
    resolve: {
        extensions: ['.ts', '.js', '.glsl', '.proto', '.yaml', '.md']
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
                    presets: ['@babel/preset-react', '@babel/preset-env', ['minify', {
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
            test: /\.(ts)?$/,
            include: /src/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-typescript', ['minify', {
                        mangle: false
                    }]],
                    plugins: [
                        path.join(__dirname, './utils/babel-transforms/inspector-annotations.js'),
                        '@babel/plugin-proposal-class-properties',
                        '@babel/plugin-proposal-object-rest-spread'
                    ]
                }
            }, {
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    formatter: 'msbuild'
                }
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
            test: /\.md?$/,
            use: [{
                loader: 'raw-loader'
            }]
        }, {
            test: /\.yaml?$/,
            use: [{
                loader: 'yml-loader'
            }]
        }, {
            test: /\.css$/,
            use: [
                "style-loader",
                "css-loader",
            ]
        }, {
            test: /\.scss$/,
            use: [
                "style-loader",
                "css-loader",
                "sass-loader"
            ]
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
