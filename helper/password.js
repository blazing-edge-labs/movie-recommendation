const _ = require('lodash')
const bcrypt = require('bcrypt')

async function hash (password) {
  return bcrypt.hash(password, _.toInteger(process.env.BCRYPT_ROUNDS))
}

async function check (password, hash) {
  return bcrypt.compare(password, hash)
}

module.exports = {
  check,
  hash,
}
