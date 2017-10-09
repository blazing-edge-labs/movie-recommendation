const _ = require('lodash')
const livereload = require('livereload')
const path = require('path')

module.exports = function (paths = []) {
  const lr = livereload.createServer({
    exts: [
      'pug',
    ],
  })

  lr.watch(_.map(paths, function (p) {
    return path.resolve(`${p}/**/*`)
  }))

  return require('connect-livereload')()
}
