var app = angular.module("main",["ngCookies","ngRoute","ui.ace","main.editor","main.home"]);

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/", {
    redirectTo: "/home"
  })
  .otherwise({
    redirectTo: "/home"
  });
}]);

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

app.service("newroom", ["$http", function($http) {
  this.requestRoom = function(token,isSuc,isFail) {
    var item = {
      token: token,
    };
    $http.post("http://localhost:8080/newroom",item).then(isSuc,isFail);
  };
}]);

app.service("privilege",["$http", function($http) {
  this.requestPriv = function(usertoken,room,isSuc,isFail) {
    var item = {
      token: usertoken,
      room: room
    };
    $http.post("http://localhost:8080/privilege",item).then(isSuc,isFail);
  };
}]);

app.service("codeMemoryStore", function() {
  var self = this;
  this.setCode = function(code) {
    self.code = code;
  };
  this.download = function() {
    if(self.code) {
      var filename = "codeshow.js";
      var text = self.code;
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      alert("No Code Present");
    }
  };
});

app.controller("loginController", ["$scope", "login", "$cookies", "codeMemoryStore", "newroom", "$location", function($scope,login,$cookies,codeMemoryStore,newroom,$location) {
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
      var minutes = 35;
      var date = new Date();
      var expires = new Date(date.getTime() + minutes*60000);
      $cookies.put("UserToken",response.data,{expires:expires});
      $scope.isLoggedIn = true;
    }
  };
  $scope.download = function() {
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
  $scope.redirect = function(response) {
    $location.path("/editor/" + response.data);
  };
  $scope.new = function() {
    var token = newroom.requestRoom($cookies.get("UserToken"),$scope.redirect,$scope.requestFail);
  };
}]);

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
