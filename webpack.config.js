const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'none',
    entry: './src/main.ts',
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js',
        publicPath: path.join(__dirname, './www'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.glsl', '.proto', '.yaml', '.md']
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
            test: /\.tsx?$/,
            include: /src/,
            exclude: /node_modules/,
            use: [{
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        noEmit: false
                    }
                }
            }/*, {
                loader: 'tslint-loader',
                options: {
                    emitErrors: true,
                    formatter: 'msbuild'
                }
            }*/]
        }, {
            test: /\.glsl?$/,
            use: [{
                loader: 'glsl-custom-loader'
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
