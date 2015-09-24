var app = angular.module("main");

app.service("io",[function() {
  this.connect = function() {
    var socket = io();
    return socket;
  };
  this.joinroom = function(socket,token) {
    socket.emit("room",token);
  }
  this.emitChat = function(socket,msg,usertoken,roomtoken) {
    var data = {
      usertoken: usertoken,
      room: roomtoken,
      msg: msg
    };
    socket.emit("chat message", data);
  };
  this.getChat = function(socket,onSuc) {
    socket.on("chat message", function(msg) {
      onSuc(msg);
    });
  };
  this.emitCode = function(socket,code,usertoken,roomtoken) {
    var data = {
      usertoken: usertoken,
      room: roomtoken,
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
