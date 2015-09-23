var app = angular.module("main",["ngCookies","ui.ace"]);

app.service("login",["$http", function($http) {
  this.requestLogin = function(username,isSuc,isFail) {
    var item = {
      username: username,
    };
    $http.post("http://localhost:8080/login",item).then(isSuc,isFail);
  };
  this.requestLogout = function(usertoken,isSuc,isFail) {
    var item = {
      usertoken: usertoken
    };
    $http.post("http://localhost:8080/logout",item).then(isSuc,isFail);
  };
}]);

app.service("codeMemoryStore", function() {
  var self = this;
  this.setCode = function(code) {
    self.code = code;
  };
  this.download = function() {
    var filename = "codeshow.js";
    var text = self.code;
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
});

app.controller("loginController", ["$scope", "login", "$cookies", "codeMemoryStore", function($scope,login,$cookies,codeMemoryStore) {
  if($cookies.get("UserToken")) {
    $scope.isLoggedIn = true;
  } else {
    $scope.isLoggedIn = false;
  }
  $scope.loginData = {};
  $scope.setUserToken = function(response) {
    if(response.data == "Username Taken") {
      alert("Username Taken");
    } else {
      var minutes = 30;
      var date = new Date();
      var expires = new Date(date.getTime() + minutes*60000);
      $cookies.put("UserToken",response.data,{expires:expires});
      $scope.isLoggedIn = true;
    }
  };
  $scope.download = function() {
    console.log("Called");
    codeMemoryStore.download();
  }
  $scope.requestFail = function(response) {
    console.log(response.data)
  };
  $scope.login = function() {
    login.requestLogin($scope.loginData.username,$scope.setUserToken,$scope.requestFail);
    $scope.loginData = {};
  };
  $scope.logout = function() {
    login.requestLogout($cookies.get("UserToken"),$scope.requestFail,$scope.requestFail);
    $scope.isLoggedIn = false;
    $cookies.remove("UserToken");
  };
}]);

app.controller("mainController", ["$scope", "io", "$cookies", "codeMemoryStore", function($scope,io,$cookies,codeMemoryStore) {
  $scope.code = "";
  var oldCode = $scope.code;
  $scope.$watch('code', function() {
    if($scope.code != oldCode) {
      io.emitCode(socket,$scope.code,$cookies.get("UserToken"));
      oldCode = $scope.code;
      codeMemoryStore.setCode($scope.code);
    }
  });
  $scope.messages = [];
  $scope.addMessage = function(msg) {
    var newMessages = $scope.messages;
    newMessages.push(msg);
    $scope.messages = newMessages;
    $("#mes-box").animate({ scrollTop: $('#mes-box')[0].scrollHeight}, 1000);
    $scope.$apply()
  };
  $scope.sendMessage = function() {
    io.emitChat(socket,$scope.message,$cookies.get("UserToken"));
    $scope.message = "";
  };
  $scope.setCode = function(code) {
    $scope.$apply();
  };
  var socket = io.connect();
  io.getChat(socket,$scope.addMessage);
  io.getCode(socket,$scope.setCode);
}]);
