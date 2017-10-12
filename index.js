const _ = require('lodash')
const express = require('express')
const session = require('express-session')

require('env')
const db = require('db')

const app = express()
const LevelStore = require('express-session-level')(session)

function asset (name) {
  if (process.env.NODE_ENV === 'production') {
    return require('asset.json')[`dist/${name}`].slice(5)
  }
  return name
}

app.locals._ = _
app.locals.asset = asset
app.locals.TMDB_IMG_BASE = 'https://image.tmdb.org/t/p'

app.set('trust proxy', true)
app.set('view engine', 'pug')
app.set('views', 'view')
app.set('x-powered-by', false)
app.use(session({
  name: 'movie-recommendation',
  secret: 'CygjITXZVCwvg0KOYYoAqEOgfhHxnaXuNnFoaJJgWizaCP5eENvjVmHuRqTUK8yl',
  resave: false,
  saveUninitialized: false,
  store: new LevelStore(db.session),
}))
if (process.env.NODE_ENV === 'development') {
  app.use(require('lr')(['client/image', 'view', 'dist']))
}
app.use(require('slicica')({
  prefix: 'image',
  root: 'client/image',
  maxAge: '30 days',
  contentTypes: ['image/jpeg'],
  compression: process.env.NODE_ENV === 'production' ? 9 : 0,
}))
app.use('/image', express.static('client/image', {maxAge: '30 days'}))
app.use(express.static('dist', {maxAge: '30 days'}))
app.use(require('body-parser').urlencoded({
  extended: true,
  limit: '500kb',
}))

app.use(require('middleware/auth'))
app.use(require('route/index'))
app.use(require('route/movie'))
app.use(require('route/user'))

if (process.env.NODE_ENV === 'production') {
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.sendStatus(500)
  })
  process.on('uncaughtException', function (err) {
    console.error(err.stack)
    process.exit(1)
  })
}

app.use(function (req, res, next) {
  res.status(404).render('404')
})

app.listen(process.env.PORT, function () {
  console.log(`STARTED ENV=${process.env.NODE_ENV} PORT=${process.env.PORT}`)
})
