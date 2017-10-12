const _ = require('lodash')
const joi = require('joi')
const router = require('express-promise-router')()

const db = require('db')
const helper = require('helper/index')
const validate = require('middleware/validate')

router.get('/movie', async function (req, res) {
  const movies = await db.movie.getVals()
  return res.render('movies', {movies})
})

router.get('/users', async function (req, res) {
  const {username} = req
  let similarityData = helper.sortByAlgorithm(await db.similarity.getBy(function (user) {
    return _.includes(user.users, username)
  }), 'pcc')

  let usernames = _(similarityData).map(function (userSimilarityData) {
    return _.remove(userSimilarityData.users, function (user) {
      return user !== username
    })
  }).flatten().value()

  let users = await Promise.map(usernames, function (user) {
    return db.user.get(user)
  })

  return res.render('users', {users})
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
