const _ = require('lodash')

const db = require('db')
const tmdb = require('tmdb')

tmdb.getPaginated('/movie/popular').then(console.log)
