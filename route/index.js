const _ = require('lodash')
const router = require('express-promise-router')()

const db = require('db')
const passwordHelper = require('helper/password')

router.get('/', function (req, res) {
  const {username} = req.session
  return res.render('index', {username})
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
