angular.module('rifa-facil').controller('ListController', function($scope, $routeParams, $http, $location) {
    $http({
        method: 'GET',
        url: '/rifas'
    }).then(function successCallback(response) {
        $scope.rifas = response.data;
    }, function errorCallback(response) {
        console.log(response);
    });

    $scope.getTemplate = function(id) {
        console.log(id);
        window.location.href = "/rifa/" + id;
    }
});
