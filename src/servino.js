const path = require('path').posix;
const fs = require('fs');
const Monitor = require('./monitor/Monitor');

let config = {};

module.exports = function Servino(options) {
  let rootPath = path.join(process.cwd(), (options.root || '.'));

  if (options.configFile) {
    try {
      const jsonConfig = fs.readFileSync(
        path.resolve(process.cwd(), options.configFile, 'servino.json'), {
        encoding: 'utf8'
      });

      config = JSON.parse(jsonConfig);
    } catch (error) {
      console.log(error.message);
    }
  }
  else {
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
  }

  // Monitor.emit('start-process', config);
  // Monitor.emit('start-watching-files', config);
}