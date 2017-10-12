const _ = require('lodash')

const db = require('db')

const algorithms = require('helper/algorithms')

function getUserMovieReviews (user) {
  return db.review.getBy(function (review) {
    return review.username === user.username
  })
}

function getUserMutualMovieReviews (user, mainUserMovies) {
  return db.review.getBy(function (review) {
    return review.username === user.username && _.includes(mainUserMovies, review.movieId)
  })
}

function filterUserMutualMovies (user1, user2) {
  let mutualMovies = _.intersection(
    _.map(user1.reviews, 'movieId'),
    _.map(user2.reviews, 'movieId')
  )

  function filterHelper (review) {
    return _.includes(mutualMovies, review.movieId)
  }

  let clonedUser1 = _.cloneDeep(user1)
  let clonedUser2 = _.cloneDeep(user2)

  clonedUser1.reviews = _(clonedUser1.reviews)
  .filter(filterHelper)
  .orderBy('movieId')
  .value()
  clonedUser2.reviews = _(clonedUser2.reviews)
  .filter(filterHelper)
  .orderBy('movieId')
  .value()

  return [clonedUser1, clonedUser2]
}

async function updateUserSimilarityScores (username) {
  const users = await db.user.getVals()
  const mainUser = await db.user.get(username)

  mainUser.reviews = await getUserMovieReviews(mainUser)
  const mainUserMovies = _.map(mainUser.reviews, 'movieId')

  return Promise.map(users, async function (user) {
    user.reviews = await getUserMutualMovieReviews(user, mainUserMovies)

    if (user.username === mainUser.username) {
      return
    }

    let clonedUsers = filterUserMutualMovies(mainUser, user)

    await db.similarity.put([user.username, mainUser.username].sort().join('-'), {
      euclideanDistance: algorithms.euclideanDistance(clonedUsers[0], clonedUsers[1]),
      pcc: algorithms.pcc(clonedUsers[0], clonedUsers[1]),
      users: [user.username, mainUser.username].sort(),
    })
  })
}

module.exports = {
  updateUserSimilarityScores,
}
