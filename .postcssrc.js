module.exports = {
  parser: 'sugarss',
  plugins: {
    'postcss-easy-import': {
      extensions: [
        '.sss',
        '.css',
      ],
    },
    'postcss-conditionals': {},
    'postcss-custom-media': {},
    'postcss-cssnext': {
      browsers: [
        '>1% in us',
        'firefox esr',
        'not ie > 0',
      ],
    },
    'postcss-color-function': {},
    'postcss-current-selector': {},
    'postcss-each': {},
    'postcss-nested': {},
    'postcss-nested-ancestors': {},
    'postcss-simple-vars': {},
    'postcss-size': {},
    'postcss-url': {
      url: function (asset, dir, options) {
        if (asset.url.startsWith('../fonts/')) {
          return `/font/${asset.url.replace('../fonts/', '')}`
        }
        return asset.url
      }
    },
    'rucksack-css': {},
    'postcss-browser-reporter': {},
    'postcss-reporter': {},
  },
}
