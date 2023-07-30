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
        extensions: ['.ts', '.tsx', '.js', '.glsl', '.proto', '.yaml', '.md'],
        alias: {
            three$: path.resolve(__dirname, 'node_modules/three/build/three.module.js'),
        }
    },
    resolveLoader: {
        alias: {
            'glsl-custom-loader': path.join(__dirname, './utils/webpack-loaders/glsl_loader.js')
        }
    },
    optimization: {
        minimize: process.env.NODE_ENV === 'production' ? true : false
    },
    module: {
        rules: [{
            test: /((blockly|file-saver|xxhash-wasm)\/.*\.js)$/,
            enforce: "pre",
            use: ["source-map-loader"],
        }, {
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
            }]
        }, {
            test: /\.tsx?$/,
            include: /src/,
            exclude: /node_modules/,
            enforce: 'pre',
            use: [
                {
                    loader: 'tslint-loader',
                    options: {
                        configFile: './tslint.yaml',
                        tsConfigFile: './tsconfig.json',
                        emitErrors: false
                    }
                }
            ]
        }, {
            test: /\.glsl?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'glsl-custom-loader'
            }]
        }, {
            test: /\.md?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'raw-loader'
            }]
        }, {
            test: /\.yaml?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'yml-loader'
            }]
        }, {
            test: /\.css$/,
            exclude: /node_modules/,
            use: [
                "style-loader",
                {
                    loader: 'css-loader',
                    options: {
                        url: false,
                    }
                },
            ]
        }, {
            test: /\.scss$/,
            exclude: /node_modules/,
            use: [
                "style-loader",
                {
                    loader: 'css-loader',
                    options: {
                        url: false,
                    }
                },
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
