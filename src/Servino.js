const Monitor = require('./monitor/Monitor');
const Config = require('./Config')

module.exports = function Servino(options) {
  const config = Config(options);

  return {
    start() {
      Monitor.emit('start-process', config);
      Monitor.emit('start-watching-files', config);
    },

    stop() {
      Monitor.emit('kill-process');
    }
  }
}