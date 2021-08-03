const http = require('http')
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')
const serveIndex = require('serve-index')
const parseurl = require('parseurl')

const path = require('path').posix
const fs = require('fs');

const colors = require('./colors')

function onRequest (config) {
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

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, function () {
    console.info(colors.green, '[Info] Server stopped.', colors.reset);
    process.exit();
  });
});

module.exports = (config) => http.createServer(onRequest(config))