const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: './src/sklz.js',
    output: {
        // [chunkhash:8] 保留 8 位 hash 值
        filename: 'a_[chunkhash:8].js',
        // __dirname 是 webpack.dev.js 所在的目录
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'b_[hash:8].css',
        }),
        new HtmlWebpackPlugin({
            title: 'Webpack App 123',
            filename: 'index.html',
            // 使用当前目录下的 a.html 作为模板文件
            template: path.resolve(__dirname, 'index.html')
        }),
        new OptimizeCSSAssetsPlugin(),
    ],
    watch: true,
    // devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                // loader 是用来处理其他类型(非 js)文件的程序
                // loader 的调用顺序是逆序的
                // 先用 style-loader 处理, 然后再用 style-loader 处理
                // style-loader 先把 style 文件处理成 js 能够解决的形式
                // style-loader 会把 style 的内容插入到页面的 style 标签中
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                ]
            }
        ]
    }
}