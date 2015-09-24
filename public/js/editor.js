var app = angular.module("main.editor",["ngCookies", "ngRoute","ui.ace","ngClipboard"]);

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/editor/:ind", {
    templateUrl: "/views/templates/editor.tpl.html",
    controller: "editorController"
  })
}]);

app.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf");
}]);

app.controller("editorController", ["$scope", "io", "$cookies", "codeMemoryStore", "$routeParams", function($scope,io,$cookies,codeMemoryStore,$routeParams) {
  $scope.domain = "localhost:8080";
  $scope.ind = $routeParams.ind;
  $scope.link = $scope.domain + "/#/editor/" + $scope.ind;
  $scope.code = "";
  $scope.$watch('code', function() {
    io.emitCode(socket,$scope.code,$cookies.get("UserToken"),$scope.ind);
    codeMemoryStore.setCode($scope.code);
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
    io.emitChat(socket,$scope.message,$cookies.get("UserToken"),$scope.ind);
    $scope.message = "";
  };
  $scope.setCode = function(code) {
    $scope.code = code;
    $scope.$apply();
  };
  var socket = io.connect();
  io.joinroom(socket,$scope.ind);
  io.getChat(socket,$scope.addMessage);
  io.getCode(socket,$scope.setCode);
}]);
