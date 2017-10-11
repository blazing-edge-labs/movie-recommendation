const _ = require('lodash')

const db = require('db')
const tmdb = require('tmdb')

tmdb.get('/movie/popular').then(console.log)
