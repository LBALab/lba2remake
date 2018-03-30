const webpack = require('webpack');
const path = require('path');
const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');

const lba_mode = process.env.LBA_MODE || 'both';
let main_file;
switch(lba_mode) {
    case 'game':
        main_file = './src/main_game.jsx';
        break;
    case 'editor':
        main_file = './src/main_editor.jsx';
        break;
    case 'both':
    default:
        main_file = './src/main.jsx';
        break;
}

module.exports = {
    entry: main_file,
    output: {
        path: path.join(__dirname, './www'),
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
