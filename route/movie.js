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

async function getPreviousAndNextMovie (movieId) {
  const movies = _(await db.movie.getVals()).orderBy('id').map('id').value()
  const lastMovieArrayElement = _.size(movies) - 1
  const movieArrayIndex = _.indexOf(movies, movieId)
  const prevMovie = movies[movieArrayIndex === 0 ? lastMovieArrayElement : movieArrayIndex - 1]
  const nextMovie = movies[movieArrayIndex === lastMovieArrayElement ? 0 : movieArrayIndex + 1]

  return {prevMovie, nextMovie}
}

router.get('/movie/:id', validate('params', {
  id: joi.number().integer().positive().required(),
}), async function (req, res) {
  const movie = await db.movie.get(req.v.params.id)
  let userRating

  try {
    userRating = (await db.review.get(`${req.username}-${movie.id}`)).rating
  } catch (e) {
    userRating = 0
  }

  res.render('movie', {
    movie,
    userRating,
    ...(await getPreviousAndNextMovie(req.v.params.id)),
  })
})

router.post('/movie/:id', validate('params', {
  id: joi.number().integer().positive().required(),
}), validate('body', {
  rating: joi.number().integer().positive().required(),
}), async function (req, res) {
  const {username} = req
  const {id: movieId} = req.v.params
  const {rating} = req.v.body

  if (req.v.errbody) {
    let userRating

    try {
      userRating = (await db.review.get(`${req.username}-${movie.id}`)).rating
    } catch (e) {
      userRating = 0
    }

    return res.render('movie', {
      error: 'Rating is required',
      userRating,
      movie: await db.movie.get(movieId),
      ...(await getPreviousAndNextMovie(req.v.params.id)),
    })
  }

  await db.review.put(`${username}-${movieId}`, {
    movieId,
    rating,
    username,
  })

  await helper.updateUserSimilarityScores(username)

  res.redirect(`/movie/${movieId}`)
})

module.exports = router
