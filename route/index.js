const router = require('express-promise-router')()

const db = require('db')

router.get('/', function (req, res) {
  return res.render('index')
})

module.exports = router
