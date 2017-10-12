const _ = require('lodash')

function euclideanDistance (user1, user2) {
  const n = _.size(user1.reviews)
  let coefficient = 0

  if (n === 0) {
    return n
  }

  for (let i = 0; i < n; i++) {
    coefficient += Math.pow(user1.reviews[i].rating - user2.reviews[i].rating, 2)
  }

  return 1 / (1 + Math.sqrt(coefficient))
}

function squaredNum (review) {
  return Math.pow(review.rating, 2)
}

// pearson correlation coefficient
function pcc (user1, user2) {
  const n = _.size(user1.reviews)

  if (n === 0) {
    return n
  }

  const user1MovieScoreSum = _.sumBy(user1.reviews, 'rating')
  const user2MovieScoreSum = _.sumBy(user2.reviews, 'rating')
  const user1MovieScoreSqSum = _.sumBy(user1.reviews, squaredNum)
  const user2MovieScoreSqSum = _.sumBy(user2.reviews, squaredNum)
  let pSum = 0

  for (let i = 0; i < n; i++) {
    pSum += (user1.reviews[i].rating * user2.reviews[i].rating)
  }

  const num = pSum - ((user1MovieScoreSum * user2MovieScoreSum) / n)
  const den = Math.sqrt(
    (user1MovieScoreSqSum - (Math.pow(user1MovieScoreSum, 2) / n)) *
    (user2MovieScoreSqSum - (Math.pow(user2MovieScoreSum, 2) / n))
  )

  if (den === 0) {
    return 0
  }

  return num / den
}

module.exports = {
  euclideanDistance,
  pcc,
}
