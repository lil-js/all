# [lil](http://lil-js.github.io)'-all [![NPM version](https://badge.fury.io/js/lil.js.svg)](http://npmjs.org/package/lil.js) [![Stories in Ready](https://badge.waffle.io/lil-js/all.png?label=ready&title=Ready)](https://waffle.io/lil-js/all) [![Gitter chat](https://badges.gitter.im/lil-js/all.png)](https://gitter.im/lil-js/all)

<img align="center" height="150" src="http://lil-js.github.io/img/liljs-logo.png" />

All-in-one Lil'JS modules bundle

<table>
<tr>
<td><b>Name</b></td><td>all</td>
</tr>
<tr>
<td><b>Version</b></td><td>0.1.9</td>
</tr>
<tr>
<td><b>Size</b></td><td>12 KB / 4 KB (gzipped)</td>
</tr>
<tr>
<td><b>Environment</b></td><td>Browser</td>
</tr>
</table>

## Modules

- [http](https://github.com/lil-js/http) - `browser only`
- [uri](https://github.com/lil-js/uri)
- [type](https://github.com/lil-js/type)
- [uuid](https://github.com/lil-js/uuid)
- [event](https://github.com/lil-js/event)

## Installation

#### Node.js

```bash
npm install lil.js
```

#### Browser

Via [Bower](http://bower.io)
```bash
bower install lil
```
Via [Component](https://github.com/componentjs/component)
```bash
component install lil-js/all
```

Or loading the script remotely
```html
<script src="//cdn.rawgit.com/lil-js/all/0.1.9/lil.js"></script>
```

## Usage

Globalization shortcut alias
```js
var lil = require('lil')
lil.globalize() // expose lil as global with `_` (underscore) alias
_.VERSION // -> '0.1.3'
```

## Environments

- Node.js
- Chrome >= 5
- Firefox >= 3
- Safari >= 5
- Opera >= 10
- IE >= 9

## Contributing

Please, visit the specific module page to contribute.

You can aditionally open an issue to propose a new module

## License

[MIT](http://opensource.org/licenses/MIT) © Tomas Aparicio and contributors
