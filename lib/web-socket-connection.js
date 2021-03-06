var util = require('util'),
  events = require('events'),
  WebSocket = require('ws'),
  Message = require('./models/message'),
  PlayerIOError = require('./models/playerio-error'),
  BinarySerializer = require('./helpers/binary-serializer');

function Connection(endpoint, joinKey, joinData) {
  events.EventEmitter.call(this);
        
  this.connected = false;
  var that = this;
  
  var serializer = new BinarySerializer();
  serializer.on('message', function (message) {
    if (!that.connected && message.type == "playerio.joinresult") {
      if (!message.items[0]) {
        that.error = new PlayerIOError(message.items[1], message.items[2]);
        that.disconnect();
      } else {
        that.connected = true;
        that.emit('connect');        
      }
    } else {
      that.emit('message', message);
    }
  })
  
  var sock = new WebSocket('ws://' + endpoint.address + ':' + endpoint.port + '/');
  sock.on('open', function () {
    var msg = new Message('join', joinKey);
    for (var kv in joinData) {      
      msg.add(kv.key);
      msg.add(kv.value);
    }
    //that.send(msg);
  });
  
  sock.on('data', function (data) {    
    serializer.addBytes(data);
  });
  
  sock.on('close', function () {
    if (that.connected) {    
      that.connected = false;
      that.emit('disconnect');
    } else {
      that.error = that.error | new PlayerIOError(0, "Error connecting to server.");
      that.emit('error');
    }
  });  
  
  this.send = function (message) {
    sock.send(BinarySerializer.serializeMessage(message));
  }
  
  this.disconnect = function () {
    this.sock.close();
  }  
}
util.inherits(Connection, events.EventEmitter);

module.exports = Connection;