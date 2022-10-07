const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const WebSocket = require('faye-websocket');

const Monitor = require('./MonitorEvent'),
  Log = require('../util/Log'),
  createServer = require('../server/createServer');

let clients = [];
let watcher;
let server;

const validFileExtensions = ['.js', '.ts', '.html', '.htm', '.css', '.scss', '.less'];

Monitor.on('start-process', config => {
  server = createServer(config)
    .on('error', e => {
      if (e.code === 'EADDRINUSE') {
        Log('cyan', `Port ${e.port} is already in use. Trying another port.`);
        setTimeout(() => server.listen(0, config.host), 200);
      }
      else {
        Log('red', e.message);
        Monitor.emit('kill-process');
      }
    })
    .on('upgrade', (request, socket, body) => {
      Monitor.emit('upgrade-process', { request, socket, body })
    });
});

Monitor.on('start-watching-files', config => {
  watcher = chokidar.watch(config.wdir, { ignored: config.ignore, persistent: true, ignoreInitial: true })
    .on('add', path => {
      Log('cyan', `[New File To Watch] ${path.replace(/\\/g, '/')}`);
    })
    .on('change', (filePath, Stats) => {
      setTimeout(() => {

        const content = fs.readFileSync(filePath, 'utf8'); // file content
        const relativeFilePath = filePath.replace(__dirname, ''); // file path
        const fileExtension = relativeFilePath.match(/\.[0-9a-z]+$/i)[0];

        if (validFileExtensions.includes(fileExtension)) {
          const actionType = ['.css', '.scss', '.less'].includes(fileExtension)
            ? 'reloadCss' : ['.js', '.ts'].includes(fileExtension) ? 'reloadJs'
              : 'reloadHTML';

          Log('cyan', `[FILE CHANGE] ${path.relative(process.cwd(), relativeFilePath)} (${Stats.size} Byte)`);

          Monitor.emit('restart-process', { actionType, content, ...config });
        }
      }, config.wait);
    })
    .on('error', error => {
      Monitor.emit('kill-process', 0, error);
    });
});

Monitor.on('restart-process', msg => {
  clients.forEach(ws => ws && ws.send(JSON.stringify(msg)));
});

Monitor.on('upgrade-process', ({ request, socket, body }) => {
  let ws = new WebSocket(request, socket, body);

  clients.push(ws);

  ws.onclose = () => {
    clients = clients.filter(i => i !== ws)
  }
});

Monitor.on('kill-process', (signal, error) => {
  clients.forEach(ws => {
    if (ws) {
      ws.send(JSON.stringify({ message: 'close-socket' }));
      ws.close();
    }
  });
  if (watcher) {
    watcher.close();
    server.close();

    Log('red', `[STOP WATCHING] ${signal || 0} ${error || ''}`);
    Log('red', `[STOP SERVER] ${signal || 0} ${error || ''}`);
  }
});

["SIGTERM", "SIGINT", "SIGHUP", "SIGQUIT"].forEach(evt => {
  process.on(evt, (signal) => {
    Monitor.emit('kill-process', signal);
  });
});

module.exports = Monitor;