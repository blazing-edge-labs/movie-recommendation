const $ = require('jquery')

const $ratingHolder = $('.rating')

$ratingHolder.on('click', 'span', function (e) {
  const {id, rating} = $(this).data()

  $.ajax({
    type: 'POST',
    url: '/movie/rate',
    data: {
      id,
      rating
    },
    success: function (data) {
      console.log('Successfully rated movie', data)
    },
  })
})

