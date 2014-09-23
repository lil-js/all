(function (global) {
  var lil = global.lil = global.lil || {}

  lil.VERSION = '0.1.4'
  lil.alias = lil.globalize = function () {
    global._ = lil
  }
}(this))
