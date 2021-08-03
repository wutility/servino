# ⚡️ Servino
Fast and simple zero-configuration dev server with hot reload.

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url]

## Install
```js
$ npm i -g servino
```

## CLI
```shell
sv --port 8125 --wait 500 --inject true --wdir dist,public --wignore "/node_modules|(^|[\/\\])\../"
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

| Prop     | Example                         | Description                   |
|----------|---------------------------------|-------------------------------|
|host      | `'127.0.0.1'`                   | Set the server address      |
|port      | `8125`                          | Set the server port. |
|root      | `'public'`                      | Set root directory that's being served. Default: current working directory |
|wignore   | `\/node_modules|(^|[\/\\])\..\/`| which's files or folders should be ignored |
|wdir      | `['dist', 'public']`            | Paths to watch for changes. Default: watch everything under root directory |
|wait      | `100`                           | Realod time between changes (ms). |
|inject    | `false`                         | Inject Css and Javascript files without refresh the browser |
|open      | `true`                          | Open url on the browser |
|verbose   | `false`                         | Log changed files |

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
