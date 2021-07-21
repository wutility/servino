# Servino

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url]

## Install
```json
$ npm i -g servino
```

## CLI
```json
// you can use servino or sv
servino --port 8125 --verbose false --wdir dist,public
```

## API
```js
const servino = require('servino')

// start serving
servino.start(config?)

// reload manually
servino.reload()

// stop serving
servino.stop()
```

## Configuration
```js
{
  host: '127.0.0.1', // Set the server address. Default: 0.0.0.0
  port: 5000, // Set the server port. Default: 8125
  root: 'public', // Set root directory that's being served. Default: current directory
  wait: 100, // Realod time between changes. Default(ms): 100
  wdir: ['dist', 'public'], // Paths to exclusively watch for changes. Default: watch everything under root directory
  verbose: true, // Log changed files. Default: true
}
```

## Todo
- [ ] Support SPA

----

MIT © [Haikel Fazzani](https://github.com/haikelfazzani)

[downloads-img]: http://img.shields.io/npm/dm/servino.svg?style=flat-square
[npm-img]:       http://img.shields.io/npm/v/servino.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/servino