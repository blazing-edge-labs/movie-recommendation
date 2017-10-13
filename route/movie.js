const _ = require('lodash')
const joi = require('joi')
const router = require('express-promise-router')()

const db = require('db')
const helper = require('helper/index')
const validate = require('middleware/validate')

router.get('/movie', async function (req, res) {
  const {username} = req
  const similarityData = _(await db.similarity.getBy(function (similarity) {
    return _.includes(similarity.users, username)
  })).orderBy('pcc', 'desc').take(5).value()
  const users = _(similarityData).map(function (similarity) {
    return {
      ..._.omit(similarity, 'users'),
      username: _.remove(similarity.users, function (user) {
        return user !== username
      })[0],
    }
  }).value()

  const mainUser = await db.user.get(username)
  mainUser.reviewedMovies = _.map(await helper.getUserMovieReviews({username}), 'movieId')

  await Promise.map(users, async function (user) {
    user.reviews = _(await db.review.getBy(function (review) {
      return review.username === user.username && !_.includes(mainUser.reviewedMovies, review.movieId)
    })).orderBy('rating', 'desc').take(5).value()
  })

  let movieRecommendations = []

  _.forEach(users, function (user) {
    _.forEach(user.reviews, function (review) {
      movieRecommendations.push({
       movieId: review.movieId,
       rating: review.rating * user.pcc
      })
    })
  })

  movieRecommendations = _(movieRecommendations)
  .orderBy('rating', 'desc')
  .unionBy('movieId')
  .value()

  let movies = await Promise.map(movieRecommendations, function (movieRecommendation) {
    return db.movie.get(movieRecommendation.movieId)
  })

  if (!_.size(movies)) {
    movies = await db.movie.getVals()
  }

  return res.render('movies', {movies})
})

router.post('/movie/rate', validate('body', {
  movieId: joi.number().integer().positive().required(),
  rating: joi.number().integer().positive().required(),
}), async function (req, res) {
  const {username} = req
  const {movieId, rating} = req.v.body

  await db.review.put(`${username}-${movieId}`, {
    movieId,
    rating,
    username,
  })

  await helper.updateUserSimilarityScores(username)

  res.status(200).json(await db.review.get(`${username}-${movieId}`))
})

module.exports = router
