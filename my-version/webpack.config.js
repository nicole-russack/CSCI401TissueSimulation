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
            test: /app\.js$/i,
            loader: 'raw-loader'
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
              { loader: 'worker-loader', 
              options: { inline: true, fallback: false   } 
            },
            ],
        },
        { test: /\.glsl$/i, loader: 'shader-loader' },
          
        ].concat(vtkRules),
      },
      resolve: {
        modules: [
          path.resolve(__dirname, 'node_modules'),
          sourcePath,
        ],
      },
};
    