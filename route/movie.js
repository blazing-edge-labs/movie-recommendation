const _ = require('lodash')
const joi = require('joi')
const router = require('express-promise-router')()

const db = require('db')
const validate = require('middleware/validate')

router.get('/movie', async function (req, res) {
  const movies = await db.movie.getVals()
  return res.render('movies', {movies})
})

router.post('/movie/rate', validate('body', {
  id: joi.number().integer().positive().required(),
  rating: joi.number().integer().positive().required(),
}), async function (req, res) {
  const {username} = req
  const {id, rating} = req.v.body

  await db.review.put(`${username}-${id}`, {
    id,
    rating,
    username,
  })

  // TODO update user similarity

  res.status(200).json(await db.review.get(`${username}-${id}`))
})

module.exports = router
