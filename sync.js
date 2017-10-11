const _ = require('lodash')

const db = require('db')
const tmdb = require('tmdb')

function getMovies () {
  return tmdb.getPaginated('/movie/popular')
}

async function sync () {
  const movies = await getMovies()
  await Promise.map(movies, function (movie) {
    return db.movie.put(movie.id, movie)
  })
  process.exit(0)
}
sync()
