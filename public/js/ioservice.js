var app = angular.module("main");

app.service("io",[function() {
  this.connect = function() {
    var socket = io();
    return socket;
  };
  this.emitChat = function(socket,msg,usertoken) {
    var data = {
      usertoken: usertoken,
      msg: msg
    };
    socket.emit("chat message", data);
  };
  this.getChat = function(socket,onSuc) {
    socket.on("chat message", function(msg) {
      onSuc(msg);
    });
  };
}]);
