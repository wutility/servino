const { EventEmitter } = require('events');

class MonitorEvent extends EventEmitter {

  static instance = new MonitorEvent();

  static getInstance() {
    return this.instance;
  }
}

module.exports = MonitorEvent.getInstance();