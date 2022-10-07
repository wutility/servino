# ⚡️ Servino
[Servino](https://wutility.github.io/servino) is zero-configuration http server with hot reload.

![][version] ![][downloads] ![][dependency] ![][license]

## Install
```shell
$ npm i -g servino
# or
$ npm i servino --save-dev
```

## CLI
```shell
# Getting start
sv -r src -p 3000

# long command
sv --port 8125 --delay 500 --inject --wdir tests,public --ignore node_modules,.git

# short
sv -p 8125 -d 500 -w tests,public -i node_modules,.git -s tests/cert.pem,tests/key.pem
```

## API
```js
const servino = require('servino')

servino(options?: object) : void
```

## Available Options

| options/Command     | Example                         | Description                   |
|----------|---------------------------------|-------------------------------|
|`--config` or `-c`      | `null`                   | specify where config json file is located (directory)     |
|`--host` or `-h`      | `'127.0.0.1'`                   | Set the server address      |
|`--port` or `-p`      | `8125`                          | Set the server port. |
|`--root` or `-r`     | `'public'`                      | Set root directory that\'s being served. Default: current working directory |
|`--ignore` or `-i`  | `node_modules,.git` | which\'s files or folders should be ignored (Watch ignore) |
|`--wdir` or `-w`     | `tests,public`            | Paths to watch for changes. Default: watch everything under root directory |
|`--delay` or `-d`      | `200`                           | Realod time between changes (ms). |
|`--inject` or `-I`  | `true`                         | Inject Css and Javascript files without refresh the browser |
|`--open` or `-o`      | `true`                          | Open url on the browser |
|`--verbose` or `-V`  | `true`                         | Show logs |
|`--ssl` or `-s`  | `tests/cert.pem,tests/key.pem`                         | ssl certifications |

## Config file: [servino.json](tests/servino.json)
```js
/*
  command: sv -c tests
  A config file can take any of the command line arguments as JSON key values, for example:
*/
{
  "host": "0.0.0.0",
  "port": 8125,
  "root": ".",
  "wdir": [
    "app",
    "src"
  ],
  "delay": 100,
  "ignore":[
    "node_modules",
    "dist",
    ".git"
  ],
  "inject": true,
  "open": true,
  "verbose": true,
  "ssl": [
    "tests/cert.pem",
    "tests/key.pem"
  ]
}
```

## TLS/SSL
First, you need to make sure that openssl is installed correctly, and you have key.pem and cert.pem files. You can generate them using this command:

```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

Then you need to run the server with -s for your certificate files.
```shell
# Note: order important
servino -s tests/cert.pem,tests/key.pem
```

## Notes
- All pull requests are welcome, feel free.

## Author
- [Haikel Fazzani](https://github.com/haikelfazzani)

## License
MIT

[downloads]: https://badgen.net/npm/dt/servino
[version]:       http://img.shields.io/npm/v/servino.svg?style=flat-square
[dependency]:       https://badgen.net/bundlephobia/dependency-count/react
[license]: https://badgen.net/npm/license/servino