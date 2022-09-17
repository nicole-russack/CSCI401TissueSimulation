const webpack = require('webpack');


module.exports = {
    entry: [ './src/index.js' ],
    module: {
        rules: [
          {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
          },
          {
            test: /\.svg$/,
            use: ['@svgr/webpack'],
          },
          {
            test: /\.(glsl|vs|fs|vert|frag)$/,
            exclude: /node_modules/,
            use: [
              'raw-loader',
              'glslify-loader'
            ]
          },
          
          
          {
            test: /\.(glsl|frag|vert)$/,
            use: ['glslify-import-loader', 'raw-loader', 'glslify-loader']
        },
        {
            test: /\.(glsl|frag|vert)$/,
            exclude: /node_modules/,
            loader: 'glslify-import-loader'
        }, {
            test: /\.(glsl|frag|vert)$/,
            exclude: /node_modules/,
            loader: 'raw-loader'
        }, {
            test: /\.(glsl|frag|vert)$/,
            exclude: /node_modules/,
            loader: 'glslify-loader'
        },
        
          {
            test: /\.(glsl|frag|vert)$/,
            exclude: /node_modules/,
            loader: 'glslify-import-loader'
        }, {
            test: /\.(glsl|frag|vert)$/,
            exclude: /node_modules/,
            loader: 'raw-loader'
        }, {
            test: /\.(glsl|frag|vert)$/,
            exclude: /node_modules/,
            loader: 'glslify-loader'
        },
        {
            test: /\.worker\.js$/,
            use: [
              { loader: 'worker-loader', options: { inline: 'no-fallback' } },
            ],
          },
          
        ],
        
        
      },
};
    