angular.module('ionic.utils', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('$im', [function() {
  var client;
  var self_user = '';
  var ProtoBuf = dcodeIO.ProtoBuf;
  var Im = ProtoBuf.loadProtoFile("lib/protobuf/message.proto").build("Im"), 
      ImMessage = Im.Message;
  
  return {
    connect: function(server, imuser, imcred) {
      self_user = imuser;
      client = mqtt.connect(server, {auth:imuser+':'+imcred});
      client.on('connect', function () {
        console.log('$im successful connect');
      });
      client.on('close', function () {
        console.log('$im successful close');
      });
      client.on('error', function () {
        console.log('$im successful error');
      });
    },
    sendusermsg: function(target_user, message) {
      if (self_user<target_user) {
        topic = "convs/p|"+self_user+"|"+target_user;
      } else {
        topic = "convs/p|"+self_user+"|"+self_user;
      }
      var msg = new ImMessage(0, 'text', message);
      client.publish(topic, msg.encode64());
      //client.publish(topic, message);
    },
    recvmsg: function(callback) {
      client.publish("users/"+self_user+"/status", "online");
      client.subscribe("users/"+self_user+"/msgs");
      client.on("message", function(topic, message, packet) {
        var msg = ImMessage.decode64(message.toString());
        callback(topic, msg.content, msg.id);
      });
    },
    disconnect: function() {
      client.end();
    }
  }
}]);
