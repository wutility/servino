# Servino

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url]

## Install
```json
$ npm i -g servino
```

## CLI
- **Example 1**
```json
// Command: servino or sv
servino

/* -> Example of console ouput
  [Serving]  http://127.0.0.1:8125
  [CWD]  E:/public/test 
  [Waiting For Changes]
*/
```
- **Example 2**
```json
sv --injection true --wait 500
```

- **Example 3**
```json
sv --port 8125 --verbose false --wdir dist,public --wignore "/node_modules|(^|[\/\\])\\../"
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
  root: 'public', // Set root directory that's being served. Default: current working directory
  wait: 100, // Realod time between changes. Default(ms): 100
  wdir: ['dist', 'public'], // Paths to watch for changes. Default: watch everything under root directory
  injection: true, // Inject Css and Javascript files without refresh the browser. Default: false
  wignore: '/node_modules|(^|[\/\\])\../', // which's files or folders should be ignored
  verbose: false // Log changed files. Default: true
}
```

## Todo
- [ ] Support SPA

## Notes
- All pull requests are welcome, feel free.

## Author
- [Haikel Fazzani](https://github.com/haikelfazzani)

## License
MIT

[downloads-img]: http://img.shields.io/npm/dm/servino.svg?style=flat-square
[npm-img]:       http://img.shields.io/npm/v/servino.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/servino