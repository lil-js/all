/*! lil-type - v0.1 - MIT License - https://github.com/lil-js/type */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory)
  } else if (typeof exports === 'object') {
    factory(exports)
    if (typeof module === 'object' && module !== null) {
      module.exports = exports
    }
  } else {
    factory((root.lil = root.lil || {}))
  }
}(this, function (exports) {
  var VERSION = '0.1.0'
  var toStr = Object.prototype.toString
  var nativeIsFinite = isFinite
  var nativeIsArray = Array.isArray
  var keys = Object.keys
  var binaryRegex = /[U]?Int|Float[0-9]{1,2}Array\]$/i
  var types = [
    'Boolean', 'NaN', 'Number', 'String', 'Null',
    'Undefined', 'RegExp', 'Date', 'Function', 'Symbol',
    'Arguments', 'Error', 'Array', 'Element',
    'Generator', 'Map', 'Binary', 'Object'
  ]

  exports.type = { VERSION: VERSION }

  function isNull(o) {
    return o === null
  }
  exports.isNull = isNull

  function isObject(o) {
    return o && toStr.call(o) === '[object Object]' || false
  }
  exports.isObject = isObject

  exports.isPlainObject = function isPlainObject(o) {
    return isObject(o)
      && isObject(Object.getPrototypeOf(o))
      && isNull(Object.getPrototypeOf(Object.getPrototypeOf(o)))
  }

  function isArray(o) {
    return nativeIsArray ? nativeIsArray(o) : (o && toStr.call(o) === '[object Array]') || false
  }
  exports.isArray = isArray

  function isFn(fn) {
    return typeof fn === 'function'
  }
  exports.isFn = exports.isFunction = isFn

  function isBool(o) {
    return o === true || o === false || o && toStr.call(o) === '[object Boolean]' || false
  }
  exports.isBool = exports.isBoolean = isBool

  function isDate(o) {
    return o && toStr.call(o) === '[object Date]' || false
  }
  exports.isDate = isDate

  exports.isElement = function isElement(o) {
    return o && o.nodeType === 1 || false
  }

  function isString(o) {
    return typeof o === 'string' ||
      o && typeof o === 'object' && toStr.call(o) === '[object String]' || false
  }
  exports.isString = isString

  function isNumber(o) {
    return typeof o === 'number' ||
      o && typeof o === 'object' && toStr.call(o) === '[object Number]' || false
  }
  exports.isNumber = isNumber

  function isRegExp(o) {
    return o && toStr.call(o) === '[object RegExp]' || false
  }
  exports.isRegExp = isRegExp

  function isNaN(o) {
    return isNumber(o) && o != +o
  }
  exports.isNaN = isNaN

  exports.isFinite = function isFinite(o) {
    return nativeIsFinite(o) && !isNaN(parseFloat(o)) || false
  }

  function isError(o) {
    return o && toStr.call(o).indexOf('Error') !== -1 || false
  }
  exports.isError = isError

  exports.isMap = function isMap(o) {
    return o && toStr.call(o) === '[object Map]' || false
  }

  exports.isPromise = function isPromise(o) {
    return isObject(o) && isFn(o.then) || false
  }

  exports.isGenerator = function isGenerator(o) {
    return isObject(o) && isFn(o.next) && isFn(o.send) || false
  }

  exports.isBuffer = function isBuffer(o) {
    return o && toStr.call(o) === '[object Buffer]'
      || toStr.call(o) === '[object ArrayBuffer]'
      || toStr.call(o) === '[object DataView]' || false
  }

  function isBlob(o) {
    return o && toStr.call(o) === '[object Blob]' || toStr.call(o) === '[object BlobBuilder]' || false
  }
  exports.isBlob = isBlob

  function isFile(o) {
    return o && toStr.call(o) === '[object File]' || toStr.call(o) === '[object FileReader]' || false
  }
  exports.isBlob = isFile

  exports.isBinary = function isBinary(o) {
    return o && isBlob(o) || isFile(o) || binaryRegex.test(toStr.call(o)) || false
  }

  function isUndefined(o) {
    return typeof o === 'undefined'
  }
  exports.isUndefined = isUndefined

  function isSymbol(o) {
    return o && toStr.call(o) === '[object Symbol]' || false
  }
  exports.isSymbol = isSymbol

  function isArguments(o) {
    return o && toStr.call(o) === '[object Arguments]' || false
  }
  exports.isArguments = isArguments

  function isEmpty(o) {
    if (!o) return true
    if (isString(o) || isArray(o)) return o.length === 0
    if (isObject(o)) return keys(o).length === 0
    return false
  }
  exports.isEmpty = isEmpty

  exports.notEmpty = function (o) {
    return !isEmpty(o)
  }

  exports.isMutable = function isMutable(o) {
    return isObject(o) || isArray(o) || isError(o) || isArguments(o) || isDate(o) || isFn(o) || false
  }

  exports.isIterable = function isIterable(o) {
    return isObject(o) || isArray(o) || isArguments(o) || false
  }

  exports.isPrimitive = function (o) {
    return isBool(o) || isString(o) || isNumber(o)
      || isFn(o) || isNull(o) || isUndefined(o)
      || isRegExp(o) || isSymbol(o) || false
  }

  exports.is = exports.isType = function isType(o) {
    for (var i = 0, l = types.length; i < l; i += 1) {
      if (exports['is' + types[i]](o)) {
        return types[i].toLowerCase()
      }
    }
    return 'undefined'
  }
}))
