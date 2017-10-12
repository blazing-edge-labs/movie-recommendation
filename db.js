const _ = require('lodash')
const _fp = require('lodash/fp')
const getStream = require('get-stream')
const level = require('level')
const levelPromise = require('level-promise')
const sublevel = require('subleveldown')

const db = level(process.env.DB, {valueEncoding: 'json'})

function getVals () {
  return getStream.array(this.createValueStream())
}

function getKeys () {
  return getStream.array(this.createKeyStream())
}

function getBy (predicate) {
  return this.getVals().then(_fp.filter(predicate))
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
