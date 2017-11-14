function EventHUB() {
  if (EventHUB.caller != EventHUB.getInstance) {
    throw new Error('Object can`t be instanciated');
  }
  this.handlers = {};
}

EventHUB.instance = null;

EventHUB.getInstance = function() {
  if (this.instance === null) {
    this.instance = new EventHUB();
  }
  return this.instance;
};

EventHUB.prototype.on = function(key, handler) {
  this.handlers[key] = handler;
};

EventHUB.prototype.emit = function(key, data) {
  if (this.handlers[key]) {
    this.handlers[key].call(this, data);
  }
};

module.exports = EventHUB.getInstance();
