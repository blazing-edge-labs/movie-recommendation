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
