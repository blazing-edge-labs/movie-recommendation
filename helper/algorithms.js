const _ = require('lodash')

function euclideanDistance (user1, user2) {
  const n = _.size(user1.reviews)
  let coefficient = 0

  for (let i = 0; i < n; i++) {
    coefficient += Math.pow(user1.reviews[i].rating - user2.reviews[i].rating, 2)
  }

  return 1 / (1 + Math.sqrt(coefficient))
}

// pearson correlation coefficient
function pcc (user1, user2) {
  // TODO add algortihm
}

module.exports = {
  euclideanDistance,
  pcc,
}
