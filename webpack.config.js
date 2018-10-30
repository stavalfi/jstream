const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const isDevelopmentMode = process.env.NODE_ENV === 'development';

// show stacktrace when Deprecation warning occurs so I can understand from which dependency it is coming from.
// process.traceDeprecation = true

module.exports = {
    devtool: "source-map",
    // in production mode, the webpack does uglify and Scope Hoisting which means that all the modules are under
    // the same scope and not in different scopes. it's slow down the build but makes the code run faster.
    mode: isDevelopmentMode ? "development" : "production",
    entry: path.join(__dirname, "src", "index.js"),
    output: {
        // default output directory: "dist" under the main folder.
        // the amount of output files depends on the webpack configurations.
        // first of all, webpack will produce a file which contain modules for each of the entry files listed above.
        // if you use spiting, then those files will be slitted according the strategy under "optimisation".
        // each final output file is called chunk.
        // all the output files are called bundles and chunks and also bundles contain one or more chunks.
        // ....................................................................
        // [name] == the name of the chunk
        // [chunkhash] == a hash code that is generated from the content (without metadata of webpack) of the chunk.
        filename: isDevelopmentMode ? "[hash].bundle.js" : "[contenthash].bundle.js",
        path: path.join(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: true
                    }
                }
            }
        ]
    },
    plugins: [
        // generate a html file after every time webpack end
        new HtmlWebpackPlugin({
            title: "tracker",
            template: path.join(__dirname, 'output-index-tamplate.html')
        }),
        // remove the dist folder before every webpack build.
        new CleanWebpackPlugin([path.join(__dirname, "dist")]),
    ].concat(
        isDevelopmentMode ? [
            // new BundleAnalyzerPlugin()
        ] : []
    ),
    // the dev server doesn't save any files in FS. he use in-memory FS because it is faster. so I won't find any actual bundled files in my actual FS.
    serve: {
        // stats: "errors-only",
        // Open the page in browser
        open: true
    },
    // control the bundle size.
    // it minimize using UglifyWebpackPlugin plugin by default.
    optimization: {
        // when running in HMR mode, it will tell in the logs which files have been changed and caused regenerating chunks.
        namedModules: true,
        // will remove all webpack metadata from all chunks and extract them to one single chunk.
        // if not, the content of each chunk will change because of this even if we didn't change anything in the code or in the npm modules
        // .
        // then the hash will change and then the user will have to download some of the chunks again.
        runtimeChunk: 'single',
        // by default if we don't specify anything, the source code of every lib I'm importing in my JS code, will be added to the final bundle file.
        // the advantage is less calls to other files when the browser runs the code but the disadvantage is that the file is too big to cache it.
        // the solution is to split my code from the libs code I'm using. the advantage is that my code can be cached and the disadvantage that
        // I Will have a lot of calls to other files which contain the libs code. The libs must be in node_modules.
        // //  In production mode, there is a split by default.
        splitChunks: {
            // by default, webpack 4 only split the bundle to 2 chunks: vendor (my dependencies from node_modules) and my actual source of of my app
            // only for vendors that I require by async. because this is not supported in JS spec yet then I will activate this optimization to the
            // modules I require sync. which is all the modules.
            // initial refer to the vendors I require from the entry files listed in webpack config file not async (sync).
            // all == async + sync
            // async == only async.
            chunks: 'all'
        }
    }
};

/*
Additional notes:
1. hash is calculated for a build, chunkhash is calculated for chunk (entry file), contenthash
    is special hash generated in ExtractTextPlugin and is calculated by extracted content, not by
    whole chunk content. See this article https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95#.f9aon6s3b
2.
 */