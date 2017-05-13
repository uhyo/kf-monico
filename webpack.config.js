"use strict";
const path = require('path');
const webpack = require('webpack');

// production用の設定がある
const plugins = 
    process.env.NODE_ENV === 'production' ?
    [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
        }),
    ] :
    [];

module.exports = {
    devtool: 'source-map',
    entry: './dest/tsx/entrypoint.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'components.js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                enforce: 'pre',
            },
        ]
    },
    plugins,
    resolve: {
        extensions: ['.js'],
        modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    },
    performance: {
        //bye bye, FIXME...
        hints: false,
    },
    
    devServer: {
        contentBase: './dist',
        port: 8080,
    }
};
