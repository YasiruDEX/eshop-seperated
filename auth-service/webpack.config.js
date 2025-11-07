const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      '@packages': join(__dirname, '../../packages'),
    },
  },
  externals: {
    '@prisma/client': 'commonjs @prisma/client',
    '@prisma/auth-client': 'commonjs @prisma/auth-client',
    '.prisma/client': 'commonjs .prisma/client',
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
