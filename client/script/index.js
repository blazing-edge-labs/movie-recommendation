global.jQuery = require('jquery')
require('bootstrap')
require('bootstrap-star-rating')

const $ = global.jQuery

$('#movie-rating').rating({
  max: 5,
  min: 0,
  showClear: false,
  step: 1,
})
