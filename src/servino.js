const path = require('path').posix;
const Monitor = require('./monitor/Monitor');

module.exports = function Servino(cfg) {
  let rootPath = path.join(process.cwd(), (cfg.root || '.'));

  config = {
    host: cfg.host || '0.0.0.0',
    port: cfg.port || 8125,
    root: rootPath,
    wdir: cfg.wdir || [rootPath],
    delay: cfg.delay || 100,
    ignore: cfg.ignore || /node_modules|(^|[\/\\])\../,
    inject: cfg.inject !== undefined ? cfg.inject : false,
    open: cfg.open !== undefined ? cfg.open : true,
    verbose: cfg.verbose !== undefined ? cfg.verbose : true
  }

  Monitor.emit('start-process', config);
  Monitor.emit('start-watching-files', config);
}