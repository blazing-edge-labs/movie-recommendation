const _ = require('lodash')
const router = require('express-promise-router')()

const db = require('db')

router.get('/movie', function (req, res) {
  const {username} = req.session
  return res.render('index', {username})
})

module.exports = router
