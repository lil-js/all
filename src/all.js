(function (global) {
  var lil = global.lil = global.lil || {}

  lil.VERSION = '0.1.3'
  lil.alias = function () {
    global._ = lil
  }
}(this))
