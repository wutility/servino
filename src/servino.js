const path = require('path').posix;
const Monitor = require('./monitor/Monitor');

module.exports = function Servino(options) {
  let rootPath = path.join(process.cwd(), (options.root || '.'));

  config = {
    host: options.host || '0.0.0.0',
    port: options.port || 8125,
    root: rootPath,

    wdir: options.wdir ? options.wdir.split(',') : [rootPath],

    delay: options.delay || 100,
    ignore: options.ignore || /node_modules|(^|[\/\\])\../,
    inject: options.inject || true,
    open: options.open || true,
    verbose: options.verbose || true
  }

  Monitor.emit('start-process', config);
  Monitor.emit('start-watching-files', config);
}