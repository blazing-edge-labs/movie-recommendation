const db = require('db')

async function seedDb () {
  const user = {username: 'Seed User'}
  const allMovies = await db.movie.getVals()
  await db.user.put(user.username, user)

  await Promise.map(allMovies, function (movie) {
    return db.review.put(`${user.username}-${movie.id}`, {
      movieId: movie.id,
      rating: Math.round(Math.random() * (5 - 1) + 1),
      username: user.username,
    })
  })

  process.exit(0)
}

seedDb()
