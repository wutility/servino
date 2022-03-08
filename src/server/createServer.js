const http = require('http'),
  https = require('https'),
  fs = require('fs'),
  path = require('path').posix;

const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const parseurl = require('parseurl');

const Log = require('../util/Log'),
  open = require('open');

const localTime = new Date().toLocaleTimeString();
let sslCert = {};
let protocol = 'http';

function createServer(config) {
  const onRequest = (req, res) => {
    const done = finalhandler(req, res);
    const filePath = path.join(config.root, parseurl(req).pathname);

    if (req.url.endsWith('.html') && fs.existsSync(config.root)) {

      let content = fs.readFileSync(filePath, 'utf-8');
      let wsInject = fs.readFileSync(__dirname + '/injected.html', 'utf8');

      content = content.replace('</body>', `${wsInject}\n</body>`);
      res.writeHeader(200, { 'Content-Type': 'text/html' });
      res.write(content);
      res.end();
    }
    else {
      const index = serveIndex(config.root, { 'icons': true });
      const serve = serveStatic(config.root, { index: false });

      serve(req, res, onNext = (err) => {
        if (err) return done(err)
        index(req, res, done)
      });
    }
  }

  const isSSlEnabled = config.ssl && Array.isArray(config.ssl);
  if (isSSlEnabled) {

    const [cert, key] = config.ssl;

    protocol = 'https';

    sslCert = {
      cert: fs.readFileSync(path.resolve(process.cwd(), cert)).toString().trim(),
      key: fs.readFileSync(path.resolve(process.cwd(), key)).toString().trim()
    };
  }

  const server = isSSlEnabled ? https.createServer(sslCert, onRequest) : http.createServer(onRequest);

  server
    .listen(config.port, config.host)
    .on('listening', () => {

      const addr = server.address();
      const address = addr.address === '0.0.0.0' ? '127.0.0.1' : addr.address;
      const serverUrl = `${protocol}://${address}:${addr.port}`;

      if (config.open) {
        open(serverUrl) // open in the browser
      }

      if (config.verbose) {
        Log('yellow', `> [START SERVER ${localTime}] ${serverUrl}`);
        Log('yellow', '> [ROOT DIR] ' + path.relative(process.cwd(), config.root));
        Log('cyan', '> [WATCHING DIR] ' + config.wdir);

        if (isSSlEnabled) Log('yellow', `[SSL ENABLED] ${localTime}`);
        Log('yellow', '[WAITING FOR CHANGES]');
      }
    });

  return server;
}

module.exports = createServer