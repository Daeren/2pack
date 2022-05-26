const path = require('path');

//---]>

const TerserPlugin = require('terser-webpack-plugin');

//-----------------------------------------------------

module.exports = (env, argv) => {
    const options = {};

    let name = '2pack';

    //---]>

    if(argv.env.min) {
        name += '.min';

        Object.assign(options, {
            optimization: {
                minimize: true,
                minimizer: [new TerserPlugin()],
            }
        });
    }

    if(argv.mode === 'production') {
        Object.assign(options, {
            devtool: 'source-map',
            mode: 'production'
        });
    }

    if(argv.mode === 'development') {
        name += '.dev';

        Object.assign(options, {
            devtool: 'source-map',
            mode: 'development'
        });
    }

    //---]>

    return {
        entry: path.resolve(__dirname, 'src/index.js'),

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: name + '.js',

            library: {
                name: 'packer',
                type: 'umd',
            }
        },

        module: {
            rules: [
                {
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader',
                },
            ],
        },

        ...options
    };
}
