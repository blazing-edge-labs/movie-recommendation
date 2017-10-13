const _ = require('lodash')

const db = require('db')

const algorithms = require('helper/algorithms')

function extractUsernamesFromSimilarityData (similarityData, username) {
  return _(similarityData).map(function (userSimilarityData) {
    return _.remove(userSimilarityData.users, function (user) {
      return user !== username
    })
  }).flatten().value()
}

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

function filterUserMutualMovies (user1, user2, mutateObjects = false) {
  let mutualMovies = _.intersection(
    _.map(user1.reviews, 'movieId'),
    _.map(user2.reviews, 'movieId')
  )

  function filterHelper (review) {
    return _.includes(mutualMovies, review.movieId)
  }

  let tempUser1, tempUser2

  if (mutateObjects) {
    tempUser1 = user1
    tempUser2 = user2
  } else {
    tempUser1 = _.cloneDeep(user1)
    tempUser2 = _.cloneDeep(user2)
  }

  tempUser1.reviews = _(tempUser1.reviews)
  .filter(filterHelper)
  .orderBy('movieId')
  .value()
  tempUser2.reviews = _(tempUser2.reviews)
  .filter(filterHelper)
  .orderBy('movieId')
  .value()

  return [tempUser1, tempUser2]
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

    const clonedUsers = filterUserMutualMovies(mainUser, user)

    return db.similarity.put([user.username, mainUser.username].sort().join('-'), {
      euclideanDistance: algorithms.euclideanDistance(clonedUsers[0], clonedUsers[1]),
      pcc: algorithms.pcc(clonedUsers[0], clonedUsers[1]),
      users: [user.username, mainUser.username].sort(),
    })
  })
}

function sortByAlgorithm (dataArray, algorithm) {
  return _.orderBy(dataArray, algorithm, 'desc')
}

function filterUserReviews (username) {
  return function (review) {
    return review.username === username
  }
}

module.exports = {
  extractUsernamesFromSimilarityData,
  filterUserReviews,
  filterUserMutualMovies,
  getUserMovieReviews,
  sortByAlgorithm,
  updateUserSimilarityScores,
}
