const $ = require('jquery')

const $ratingHolder = $('.rating')

$ratingHolder.on('click', 'span', function (e) {
  const {movieid: movieId, rating} = $(this).data()

  $.ajax({
    type: 'POST',
    url: '/movie/rate',
    data: {movieId, rating},
    success: function (data) {
      console.log('Successfully rated movie', data)
    },
  })
})

