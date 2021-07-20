const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const WebSocket = require('faye-websocket')
const serveIndex = require('serve-index')
const chokidar = require('chokidar')
const parseurl = require('parseurl')
const open = require('open')

const http = require('http')
const path = require('path').posix
const fs = require('fs')
require('colors')

let Servino = {
  server: null,
  watcher: null,
}

let clients = []

Servino.start = function (config = {}) {
  const host = config.host || '0.0.0.0'
  const port = config.port || 3000
  const root = config.root ? path.join(process.cwd(), config.root).replace(/\\/g, '/') : process.cwd().replace(/\\/g, '/')
  const wait = config.wait || 100
  const watch = config.watch || [root]
  const verbose = config.verbose === undefined || config.verbose === null ? true : config.verbose

  const index = serveIndex(root, { 'icons': true })
  const serve = serveStatic(root, { index: false })

  const server = http.createServer(function onRequest (req, res) {

    const done = finalhandler(req, res)
    const filePath = path.join(root, parseurl(req).pathname)

    if (req.url.endsWith('.html') && fs.existsSync(filePath)) {

      let content = fs.readFileSync(filePath, 'utf-8')
      let wsInject = fs.readFileSync(__dirname + '/injected.html', 'utf8')

      content = content.replace('</body>', `${wsInject}\n</body>`)
      res.writeHeader(200, { 'Content-Type': 'text/html' })
      res.write(content)
      res.end()
    }
    else {
      serve(req, res, function onNext (err) {
        if (err) return done(err)
        index(req, res, done)
      })
    }
  })
    .listen(port, host)
    .on('listening', () => {
      
      Servino.server = server
      const addr = server.address()
      const address = addr.address === '0.0.0.0' ? '127.0.0.1' : addr.address

      console.log(`Serving`, root.yellow, 'at', `http://${address}:${addr.port}/`.cyan)

      open(`http://${address}:${addr.port}/`)
      verbose && console.log('Ready for changes')
    })
    .on('error', e => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port`, e.port, 'is already in use. Trying another port.')
        setTimeout(() => server.listen(0, host), 200)
      }
      else {
        Servino.shutdown()
      }
    })

  // WebSocket
  server.on('upgrade', (request, socket, body) => {
    const ws = new WebSocket(request, socket, body)
    ws.onclose = () => clients = clients.filter(i => i !== ws)
    clients.push(ws)
  });

  // Watch & reload
  Servino.watcher = chokidar.watch(watch, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  })
    .on('change', path => {
      setTimeout(() => {
        let content = fs.readFileSync(path, 'utf8') // file content
        path = '/' + path.replace(__dirname, '') // file path

        let fileType = 'reload'
        if (path.includes('.css')) fileType = 'reloadCss'
        if (path.includes('.js')) type = 'reloadJs'

        verbose && console.log('Change detected'.cyan, path.replace(/\\/g, '/').yellow)
        Servino.reload({ fileType, path, content })
      }, wait)
    });
}

Servino.reload = function (msg) {
  clients.forEach(ws => ws && ws.send(JSON.stringify(msg)))
}

Servino.shutdown = function () {
  const watcher = Servino.watcher
  watcher && watcher.close()

  const server = Servino.server
  server && server.close()
}

module.exports = Servino