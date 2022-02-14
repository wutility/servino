const fs = require('fs');
const chokidar = require('chokidar');
const WebSocket = require('faye-websocket');

const Monitor = require('./MonitorEvent'),
  Log = require('../util/Log'),
  createServer = require('../server/createServer');

let clients = [];
let watcher;

Monitor.on('start-process', config => {

  createServer(config)
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
  watcher = chokidar.watch(config.wdir, {
    ignored: new RegExp(config.ignore, 'g'),
    persistent: true,
    ignoreInitial: true
  })
    .on('add', path => {
      Log('cyan', `[+File To Watch] ${path.replace(/\\/g, '/')}`);
    })
    .on('change', (filePath, Stats) => {
      setTimeout(() => {
        let content = fs.readFileSync(filePath, 'utf8'); // file content
        filePath = filePath.replace(__dirname, ''); // file path

        let fileType = 'reload'
        if (filePath.includes('.css')) fileType = 'reloadCss';
        if (filePath.includes('.js')) fileType = 'reloadJs';

        Log('cyan', `[Change] ${filePath} (${Stats.size} Byte)`);

        Monitor.emit('restart-process', { fileType, content, inject: config.inject });
      }, config.wait);
    })
    .on('error', error => {
      Monitor.emit('kill-process', 0, error);
    });
})

Monitor.on('restart-process', msg => {
  clients.forEach(ws => ws && ws.send(msg));
});

Monitor.on('upgrade-process', ({ request, socket, body }) => {
  let ws = new WebSocket(request, socket, body);

  clients.push(ws);

  ws.onclose = () => {
    clients = clients.filter(i => i !== ws)
  }
});

Monitor.on('kill-process', (signal, error) => {
  clients.forEach(ws => ws && ws.send({ message: 'close-socket' }));
  if (watcher) {
    watcher.close();
    Log('red', `[Server Closed] ${signal || 0} ${error}`);
    setTimeout(() => { process.exit(1); }, 500);
  }
});

["SIGTERM", "SIGINT", "SIGHUP", "SIGQUIT", "exit"].forEach(evt => {
  process.on(evt, (signal) => {
    Monitor.emit('kill-process', signal);
  });
});

module.exports = Monitor;