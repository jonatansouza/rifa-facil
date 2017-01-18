angular.module('rifa-facil', ['ngRoute'])
.config(function($routeProvider){
	$routeProvider.when('/rifas', {
		templateUrl: 'partials/rifas.html',
		controller: 'ListController'
	})
	.otherwise({
		redirectTo: '/rifas'
	});

});
