const _ = require('lodash')

const db = require('db')
const tmdb = require('tmdb')

function getMovies () {
  return tmdb.getPaginated('/movie/popular', 20)
}

async function sync () {
  const movies = await getMovies()
  await Promise.map(movies, function (movie) {
    return db.movie.put(movie.id, _.pick(movie, [
      'genre_ids',
      'id',
      'overview',
      'poster_path',
      'title',
    ]))
  })
  process.exit(0)
}
sync()
