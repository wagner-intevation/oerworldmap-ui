import custom from './webpack.config.babel.js';

module.exports = {
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-controls',
    '@storybook/addon-styling-webpack',
    '@storybook/addon-storysource'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  stories: ['../stories/*.stories.js'],
  webpackFinal: async (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: config.module.rules.concat(custom.module.rules),
      },
      plugins: config.plugins.concat(custom.plugins)
    };
  },
};
