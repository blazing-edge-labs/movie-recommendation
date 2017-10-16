const _ = require('lodash')
const router = require('express-promise-router')()

const db = require('db')
const helper = require('helper/index')
const passwordHelper = require('helper/password')

router.get('/', async function (req, res) {
  const {username} = req.session

  return res.render('index', {
    username,
    totalUsers: _.size(await db.user.getVals()),
    totalReviews: _.size(await db.review.getVals()),
  })
})

router.get('/me', async function (req, res) {
  const user = await db.user.get(req.session.username)
  user.reviews = await Promise.map(await helper.getUserMovieReviews(user), async function (review) {
    return {
      ...review,
      movie: await db.movie.get(review.movieId),
    }
  })

  return res.render('profile', {user})
})

router.get('/login', function (req, res) {
  if (req.username) {
    return res.redirect('/')
  }
  return res.render('login')
})

router.get('/logout', function (req, res) {
  req.session.destroy()
  return res.redirect('/')
})

router.post('/login', async function (req, res) {
  const {username, password} = req.body
  const user = await db.user.get(username).catch(_.noop)
  if (!user || !await passwordHelper.check(password, user.password)) {
    return res.render('login', {error: 'invalid username/password'})
  }
  req.session.username = user.username
  return res.redirect('/')
})

router.get('/register', function (req, res) {
  return res.render('register')
})

router.post('/register', async function (req, res) {
  const {username, password} = req.body
  if (await db.user.get(username).catch(_.noop)) {
    return res.render('register', {error: 'username taken'})
  }
  await db.user.put(username, {
    username,
    password: await passwordHelper.hash(password),
  })
  return res.redirect('/login')
})

module.exports = router
