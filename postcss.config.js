module.exports = {
  plugins: {
    'postcss-import': {},
    '@csstools/postcss-global-data': {
      files: [
        'src/styles/variables.css'
      ]
    },
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
        'custom-media-queries': true,
        'color-mix': true
      }
    },
  },
}
