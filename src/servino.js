const Monitor = require('./monitor/Monitor');
const Config = require('./util/Config')

module.exports = function Servino(options) {
  const config = Config(options);

  Monitor.emit('start-process', config);
  Monitor.emit('start-watching-files', config);
}