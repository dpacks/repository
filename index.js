var Dwid = require('@dwauth/client')
var qs = require('querystring')
var nets = require('nets')
var xtend = require('xtend')

module.exports = API

function API (opts) {
  if (!(this instanceof API)) return new API(opts)
  if (!opts) opts = {}
  if (!opts.apiPath) opts.apiPath = ''

  // dpacks.io defaults, specify opts.server and opts.apiPath to override
  var SERVER = 'https://dpacks.io'
  var API_PATH = '/api/v1'

  var apiPath = !opts.server || (opts.server.indexOf('dpacks.io') > -1) ? API_PATH : opts.apiPath // only add default path to dpacks.io server
  var dwidOpts = Object.assign({}, opts)

  // set default dwid server & routes for dpacks.io
  if (!dwidOpts.config) dwidOpts.config = {}
  if (!dwidOpts.config.filename) dwidOpts.config.filename = '.dwebrc'
  if (!dwidOpts.server) dwidOpts.server = SERVER
  if (!opts.routes && apiPath) {
    dwidOpts.routes = {
      register: apiPath + '/register',
      login: apiPath + '/login',
      updatePassword: apiPath + '/updatepassword'
    }
  }

  var dwid = Dwid(dwidOpts)
  var api = dwid.server + apiPath // let dwid parse server

  return {
    login: dwid.login.bind(dwid),
    logout: dwid.logout.bind(dwid),
    register: dwid.register.bind(dwid),
    whoami: dwid.getLogin.bind(dwid),
    secureRequest: dwid.secureRequest.bind(dwid),
    dwebs: rest('/dwebs'),
    users: xtend(rest('/users'), {
      resetPassword: function (input, cb) {
        nets({method: 'POST', uri: api + '/password-reset', body: input, json: true}, cb)
      },
      resetPasswordConfirmation: function (input, cb) {
        nets({method: 'POST', uri: api + '/password-reset-confirm', body: input, json: true}, cb)
      },
      suspend: function (input, cb) {
        nets({method: 'PUT', uri: api + '/users/suspend', body: input, json: true}, cb)
      }
    })
  }

  function rest (path) {
    var defaults = {
      uri: api + path,
      json: true
    }
    return {
      get: function (input, cb) {
        var params = qs.stringify(input)
        var opts = Object.assign({}, defaults)
        opts.uri = defaults.uri + '?' + params
        opts.method = 'GET'
        dwid.secureRequest(opts, cb)
      },
      create: function (input, cb) {
        var opts = Object.assign({}, defaults)
        opts.body = input
        opts.method = 'POST'
        dwid.secureRequest(opts, cb)
      },
      update: function (input, cb) {
        var opts = Object.assign({}, defaults)
        opts.body = input
        opts.method = 'PUT'
        dwid.secureRequest(opts, cb)
      },
      delete: function (input, cb) {
        var opts = Object.assign({}, defaults)
        opts.body = input
        opts.method = 'DELETE'
        dwid.secureRequest(opts, cb)
      }
    }
  }
}
