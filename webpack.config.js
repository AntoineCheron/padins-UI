/**
 * Created by antoine on 23/06/17.
 */

let ExtractTextPlugin = require('extract-text-webpack-plugin');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let path = require('path');

module.exports = {

    entry: {
        // Here all your entry points from
        // your application are mentioned
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/main.ts',
    },

    output: {
        // Here we can specify the output
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].bundle.js',
        chunkFilename: 'js/[id].chunck.js',
    },

    resolve: {
        extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'awesome-typescript-loader',
                    'angular-router-loader',
                    'angular2-template-loader',
                    'source-map-loader'
                ]
            },
            {
                test: /\.html$/,
                use: 'raw-loader'
            },
            {
                test: /\.(png|jpg|gif|ico|woff|woff2|ttf|svg|eot)$/,
                loader: 'file-loader?name=assets/[name].[ext]',
            },
            // {
            //     test: /\.scss$/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: 'style-loader',
            //         use: ['css-loader', 'sass-loader']
            //     }),
            //     exclude: [
            //         path.resolve(__dirname, 'src/app'),
            //         path.resolve(__dirname, 'src/stylesheets'),
            //         path.resolve(__dirname, 'node_modules'),
            //     ]
            // }
        ]
    },

    plugins: [
        // new ExtractTextPlugin({
        //     filename: 'style.css',
        //     allChunks: true,
        //     disable: true
        //
        // }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            inject: 'body',
            template: './src/index.html'
        }),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        })
    ],

    devServer: {
        contentBase: [path.join(__dirname), path.join(__dirname, '/src/')]
    }
};