const http = require('http')
const fs = require('fs');
const path = require('path').posix;

const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const serveIndex = require('serve-index')
const parseurl = require('parseurl')

const Log = require('../util/Log'),
  open = require('open');

function onRequest(config) {
  return (req, res) => {

    const done = finalhandler(req, res)
    const filePath = path.join(config.root, parseurl(req).pathname)

    if (req.url.endsWith('.html') && fs.existsSync(config.root)) {

      let content = fs.readFileSync(filePath, 'utf-8')
      let wsInject = fs.readFileSync(__dirname + '/injected.html', 'utf8')

      content = content.replace('</body>', `${wsInject}\n</body>`)
      res.writeHeader(200, { 'Content-Type': 'text/html' })
      res.write(content)
      res.end()
    }
    else {
      const index = serveIndex(config.root, { 'icons': true })
      const serve = serveStatic(config.root, { index: false })

      serve(req, res, onNext = (err) => {
        if (err) return done(err)
        index(req, res, done)
      });
    }
  }
}

function createServer(config) {
  let server = http.createServer(onRequest(config))
    .listen(config.port, config.host)
    .on('listening', () => {

      const addr = server.address()
      const address = addr.address === '0.0.0.0' ? '127.0.0.1' : addr.address
      const serverUrl = `http://${address}:${addr.port}`

      if (config.open) {
        open(serverUrl) // open in the browser
      }

      const localTime = new Date().toLocaleTimeString();
      Log('yellow', `[Serving ${localTime}] ${serverUrl}`);
      Log('yellow', '[CWD] ' + path.relative(process.cwd(), config.root));
      Log('yellow', '[Waiting For Changes]');
    });

  return server;
}

module.exports = createServer