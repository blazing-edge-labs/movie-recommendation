const _ = require('lodash')
const router = require('express-promise-router')()

const db = require('db')
const helper = require('helper/index')

router.get('/users', async function (req, res) {
  const {username} = req
  let similarityData = helper.sortByAlgorithm(await db.similarity.getBy(function (user) {
    return _.includes(user.users, username)
  }), 'pcc')

  let usernames = _(similarityData).map(function (userSimilarityData) {
    return _.remove(userSimilarityData.users, function (user) {
      return user !== username
    })
  }).flatten().value()

  let users = await Promise.map(usernames, function (user) {
    return db.user.get(user)
  })

  return res.render('users', {users})
})

module.exports = router
