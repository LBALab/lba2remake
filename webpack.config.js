var webpack = require('webpack');
var path = require('path');

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
            'glsl-custom-loader': path.join(__dirname, "./src/island/shaders/glslCustomLoader")
        }
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            },
            {
                test: /\.glsl?$/,
                loader: 'glsl-custom-loader'
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
        })
    ]
};
