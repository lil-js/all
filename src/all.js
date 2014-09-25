(function (global) {
  var lil = global.lil = global.lil || {}

  lil.VERSION = '0.1.5'
  lil.alias = lil.globalize = function () {
    global._ = lil
  }
}(this))
