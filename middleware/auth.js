function auth (req, res, next) {
  if (req.session.username) {
    req.username = res.locals.username = req.session.username
  } else {
    return res.redirect('/login')
  }

  return next()
}

module.exports = auth
