const _ = require('lodash')
const router = require('express-promise-router')()

const db = require('db')

router.get('/movie', async function (req, res) {
  const movies = await db.movie.getVals()
  return res.render('movies', {movies})
})

module.exports = router
