const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/messaging-service'),
  },
  resolve: {
    alias: {
      '@packages': join(__dirname, '../../packages'),
    },
  },
  externals: {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    // Externalize the custom Prisma generated client path
    '../../../../generated/prisma-messaging': 'commonjs ../../../../generated/prisma-messaging',
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
