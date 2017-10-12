const _ = require('lodash')
const joi = require('joi')

const defaults = {
  abortEarly: false,
  allowUnknown: false,
  convert: true,
}

const path = {
  body: 'body',
  header: 'headers',
  param: 'params',
  query: 'query',
}

function validate (target, schema, options = {}) {
  const opts = _.defaults(options, defaults)
  const schemaCompiled = joi.compile(schema)

  return function (req, res, next) {
    const input = _.get(req, path[target])
    const {error: err, value: data} = schemaCompiled.validate(input, opts)

    if (err) {
      _.set(req, `v.err${target}`, err.details)
    }
    _.set(req, `v.${target}`, {
      ..._.get(req, `v.${target}`),
      ...data,
    })
    next()
  }
}

module.exports = validate
