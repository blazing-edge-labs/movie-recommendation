const _ = require('lodash')
const getStream = require('get-stream')
const level = require('level')
const levelPromise = require('level-promise')
const sublevel = require('subleveldown')

const db = level(process.env.DB, {valueEncoding: 'json'})

async function getVals () {
  return getStream.array(this.createValueStream())
}

function getKeys (cb) {
  const keys = []
  this.createKeyStream()
  .on('error', cb)
  .on('data', (key) => keys.push(key))
  .on('end', () => cb(null, keys))
}

function getBy (predicate, cb) {
  this.getVals(function (err, vals) {
    if (err) {
      return cb(err)
    }
    return cb(null, _.filter(vals, predicate))
  })
}

function sub (name) {
  const subdb = sublevel(db, name, {valueEncoding: 'json'})
  subdb.getVals = getVals.bind(subdb)
  subdb.getKeys = getKeys.bind(subdb)
  subdb.getBy = getBy.bind(subdb)
  return subdb
}

const movie = levelPromise(sub('movie'))
const review = levelPromise(sub('review'))
const session = sub('session')
const user = levelPromise(sub('user'))

module.exports = {
  movie,
  review,
  session,
  user,
}
