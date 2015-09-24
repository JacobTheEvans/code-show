var app = angular.module("main");

app.service("io",[function() {
  this.connect = function(token) {
    var socket = io("/" + token);
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
  this.emitCode = function(socket,code,usertoken) {
    var data = {
      usertoken: usertoken,
      code: code
    };
    socket.emit("code", data);
  };
  this.getCode = function(socket,onSuc) {
    socket.on("code", function(code) {
      onSuc(code);
    });
  };
}]);
