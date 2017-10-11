const _ = require('lodash')
const got = require('got')

const concurrency = 5

function tmdb (method, path, data = {}) {
  const opts = {
    method: _.upperCase(method),
    json: true,
    query: {
      api_key: process.env.TMDB_KEY,
    },
    body: {},
  }
  if (opts.method === 'GET') {
    opts.query = {
      ...opts.query,
      ...data,
    }
  } else {
    opts.body = {
      ...opts.body,
      ...data,
    }
  }

  return got(`${process.env.TMDB_URL}/${_.trimStart(path, '/')}`, opts)
  .then(function (response) {
    return response.body
  })
  .tapCatch(console.error)
}

function getPaginated (path, nPages = 10, data = {}) {
  return Promise.map(_.range(1, nPages), function (page) {
    return tmdb('GET', path, {
      ...data,
      page,
    })
    .get('results')
  }, {concurrency})
  .then(_.flatten)
}

tmdb.delete = _.partial(tmdb, 'delete')
tmdb.get = _.partial(tmdb, 'get')
tmdb.getPaginated = getPaginated
tmdb.post = _.partial(tmdb, 'post')
tmdb.put = _.partial(tmdb, 'put')

module.exports = tmdb
