const Server = require('./server');
const WebSocket = require('faye-websocket')
const chokidar = require('chokidar')
const open = require('open')
const path = require('path').posix
const fs = require('fs')

const fgColors = require('./colors')

let server = null;
let watcher = null;
let clients = [];
let config = {};

module.exports = class Servino {
  static start (cfg) {

    let rootPath = cfg.root
      ? path.join(process.cwd(), cfg.root).replace(/\\/g, '/')
      : process.cwd().replace(/\\/g, '/');

    config = {
      host: cfg.host || '0.0.0.0',
      port: cfg.port || 8125,
      root: rootPath,
      wdir: cfg.wdir || [rootPath],
      wait: cfg.wait || 100,
      wignore: cfg.wignore || /node_modules|(^|[\/\\])\../, // ignore dotfiles and node_modules
      verbose: cfg.verbose || true
    }

    let self = this

    server = Server(config)
      .listen(config.port, config.host)
      .on('listening', () => {

        const addr = server.address()
        const address = addr.address === '0.0.0.0' ? '127.0.0.1' : addr.address
        const serverUrl = `http://${address}:${addr.port}/`

        open(serverUrl) // open in the browser

        self.log('[Serving]', serverUrl)
        self.log('[Path]', config.root)

        self.log('[Waiting for changes]', '')
      })
      .on('error', e => {
        if (e.code === 'EADDRINUSE') {
          self.log(`Port ${e.port}`, 'is already in use. Trying another port.')
          setTimeout(() => server.listen(0, config.host), 200)
        }
        else {
          self.stop()
        }
      });

    // Create WebSocket
    server.on('upgrade', (request, socket, body) => {
      let ws = new WebSocket(request, socket, body)

      clients.push(ws)

      ws.onclose = () => {
        clients = clients.filter(i => i !== ws)
      }
    });

    // Watch & reload files
    watcher = chokidar.watch(config.wdir, {
      ignored: new RegExp(config.wignore, 'g'),
      persistent: true
    })
      .on('change', path => {
        setTimeout(() => {
          let content = fs.readFileSync(path, 'utf8') // file content
          path = path.replace(__dirname, '') // file path

          let fileType = 'reload'
          if (path.includes('.css')) fileType = 'reloadCss'
          if (path.includes('.js')) fileType = 'reloadJs'

          self.log('[Change Detected]', path.replace(/\\/g, '/'))

          self.reload({ fileType, path, content })
        }, config.wait)
      })
      .on('error', path => {
        self.log('[Error Watch] ---> ', path);
      });
  }

  static reload (msg) {
    clients.forEach(ws => ws && ws.send(JSON.stringify(msg)))
  }

  static async stop () {
    if (watcher) {
      await watcher.close()
    }

    //  close all your connections immediately
    server.close();

    this.log('[Server Closed]', '')
  }

  static log (label, msg) {
    if (config.verbose) {
      console.log(fgColors.cyan, label, fgColors.yellow, msg, fgColors.reset)
    }
  }
}