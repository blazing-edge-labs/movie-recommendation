const _ = require('lodash')
const joi = require('joi')
const router = require('express-promise-router')()

const auth = require('middleware/auth')
const db = require('db')
const helper = require('helper/index')
const validate = require('middleware/validate')

router.get('/user', auth, async function (req, res) {
  const {username} = req
  const similarity = helper.sortByAlgorithm(await db.similarity.getBy(function (user) {
    return _.includes(user.users, username)
  }), 'pcc')

  const usersSimilarities = await Promise.map(similarity, async function (similarityData) {
    return {
      ...similarityData,
      user: await db.user.get(_.remove(similarityData.users, function (user) {
        return user !== username
      })[0]),
    }
  })

  res.render('users', {usersSimilarities})
})

router.get('/user/:id', auth, validate('params', {
  id: joi.string().trim().required(),
}), async function (req, res, next) {
  let loggedUser = await db.user.get(req.username)
  let user

  try {
    user = await db.user.get(req.v.params.id)
  } catch (e) {
    return next()
  }

  loggedUser.reviews = await db.review.getBy(helper.filterUserReviews(loggedUser.username))
  user.reviews = await db.review.getBy(helper.filterUserReviews(user.username))

  helper.filterUserMutualMovies(loggedUser, user, true)

  const similarity = await db.similarity.get(
    [loggedUser.username, user.username].sort().join('-')
  )
  const mutualMovieData = await Promise.map(_.map(loggedUser.reviews, 'movieId'), function (movieId) {
    return db.movie.get(movieId)
  })
  const movies = {}

  _.forEach(mutualMovieData, function (movie) {
    movies[movie.id] = movie.title
  })

  res.render('user', {user, loggedUser, movies, similarity})
})

module.exports = router
