var app = angular.module("main.home",["ngRoute"]);

app.config(["$routeProvider", function($routeProvider) {
  $routeProvider.when("/home", {
    templateUrl: "/views/templates/home.tpl.html",
    controller: "homeController"
  })
}]);

app.controller("homeController", ["$scope", "newroom", "$location", "$cookies", function($scope, newroom, $location, $cookies) {
  $scope.redirect = function(response) {
    $location.path("/editor/" + response.data);
  };
  $scope.new = function() {
    if($cookies.get("UserToken")) {
      var token = newroom.requestRoom($cookies.get("UserToken"),$scope.redirect,$scope.requestFail);
    } else {
      alert("Must Login To Start A New Session");
    }
  };
}]);
