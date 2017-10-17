function auth (req, res, next) {
  if (req.session.username) {
    req.username = res.locals.username = req.session.username
  } else {
    throw 'You need to be logged in'
  }

  return next()
}

module.exports = auth
