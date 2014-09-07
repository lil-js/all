# [lil](http://lil-js.github.io)'-type [![Build Status](https://api.travis-ci.org/lil-js/type.svg?branch=master)][travis] ![Stories in Ready](https://badge.waffle.io/lil-js/type.png?label=ready&title=Ready)](https://waffle.io/lil-js/type)  [![Gitter chat](https://badges.gitter.im/lil-js/type.png)](https://gitter.im/lil-js/type)

<img align="center" height="150" src="http://lil-js.github.io/img/liljs-logo.png" />

Reliable, full featured, type checking helpers (based on [hu](https://github.com/h2non/hu))

<table>
<tr>
<td><b>Name</b></td><td>type</td>
</tr>
<tr>
<td><b>Version</b></td><td>0.1.0</td>
</tr>
<tr>
<td><b>Size</b></td><td>2 KB / >1 KB (gzipped)</td>
</tr>
<tr>
<td><b>Environment</b></td><td>Node, Browser</td>
</tr>
</table>

## Features

- Full type-checking support
- Support upcoming ES6 data types (generators, promises, maps...)
- Support for binary data types (Blob, File, FileReader...)
- Support for buffer data types (ArrayBuffer, DataView...)
- Support for typed arrays (Int8Array, Float32Array...)
- Smart type inference

## Installation

#### Node.js
```bash
npm install lil-type
```

#### Browser
Via [Bower](http://bower.io)
```bash
bower install lil-type
```
Via [Component](https://github.com/componentjs/component)
```bash
component install lil-js/type
```
Or loading the script remotely
```html
<script src="//cdn.rawgit.com/lil-js/type/0.1.0/type.js"></script>
```

### Environments

- Node.js
- Chrome >= 5
- Firefox >= 3
- Safari >= 5
- Opera >= 10
- IE >= 9

### Usage

You could fetch de module via `require()` if it's available.
Otherwise, global fallback will be used, exposed via `lil.type`
```js
var lil = require('lil-type')
```

##### Type checking
```js
lil.isObject({}) // -> true
lil.isArray([1,2,3]) // -> true
lil.isNumber(1.2) // -> true
lil.isBool(1.2) // -> true
lil.isRegExp(/[a-z]/) // -> true
```

##### Content checking
```js
lil.isEmpty(void 0) // -> true
lil.isEmpty('') // -> true
lil.isEmpty([]) // -> true
lil.isEmpty({}) // -> true
lil.isEmpty(1.5) // -> false
lil.isEmpty(new Date) // -> false
```

##### Getting data type
```js
lil.is('name') // -> 'string'
lil.is({}) // -> 'object'
lil.is([1]) // -> 'array'
lil.is(/[a-z]/) // -> 'regexp'
lil.is(function () {}) // -> 'function'
lil.is(void 0) // -> 'undefined'
```

##### Type handle helpers
```js
lil.isIterable([1,2,3]) // -> true
lil.isIterable({ name: 'Chuck' }) // -> true
lil.isIterable(function () {}) // -> false
lil.isIterable(true) // -> false
lil.isMutable({}) // -> true
lil.isMutable([]) // -> true
lil.isMutable('') // -> false
lil.isMutable(/[a-z]/) // -> false
```

## API

#### lil.isBool(o)
Alias: `isBoolean`

#### lil.isNumber(o)

#### lil.isNaN(o)

#### lil.isFinite(o)

#### lil.isString(o)

#### lil.isDate(o)

#### lil.isRegExp(o)

#### lil.isError(o)

#### lil.isFn(o)
Alias: `isFunction`

#### lil.isArguments(o)

#### lil.isSymbol(o)

#### lil.isArray(o)

#### lil.isObject(o)

#### lil.isPlainObject(o)

#### lil.isElement(o)

#### lil.isNull(o)

#### lil.isUndefined(o)

#### lil.isPromise(o)

#### lil.isGenerator(o)

#### lil.isMap(o)

#### lil.isBinary(o)

#### lil.isBlob(o)

#### lil.isFile(o)

#### lil.isBuffer(o)

#### lil.isEmpty(o)

#### lil.notEmpty(o)

#### lil.isIterable(o)

#### lil.isPrimitive(o)

#### lil.isMutable(o)

#### lil.is(o)
Alias: `isType`

#### lil.type.VERSION

## Contributing

Wanna help? Cool! It will be appreciated :)

You must add new test cases for any new feature or refactor you do,
always following the same design/code patterns that already exist

### Development

Only [node.js](http://nodejs.org) is required for development

Clone the repository
```bash
$ git clone https://github.com/lil-js/type.git && cd type
```

Install dependencies
```bash
$ npm install
```

Generate browser bundle source
```bash
$ make browser
```

Run tests
```bash
$ make test
```

## License

[MIT](http://opensource.org/licenses/MIT) © Tomas Aparicio

[travis]: http://travis-ci.org/lil-js/type
