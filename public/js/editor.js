var app = angular.module("main.editor",["ngCookies","ui.ace"]);

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/editor", {
    templateUrl: "/views/templates/editor.tpl.html",
    controller: "editorController"
  })
}]);

app.controller("editorController", ["$scope", "io", "$cookies", "codeMemoryStore", function($scope,io,$cookies,codeMemoryStore) {
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
