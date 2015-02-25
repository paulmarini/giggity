'use strict';

// Declare app level module which depends on filters, and services
angular.module('Giggity', ['Giggity.filters', 'Giggity.services', 'Giggity.directives', 'Giggity.controllers', 'ui.bootstrap', 'ngSanitize', 'ngRoute', 'ui.bootstrap.datetimepicker']).
  config(['$compileProvider', function ($compileProvider) {
	  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|sms):/);
  }]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/gigs/:gig_id?/:action?', {
  		templateUrl: 'partials/partial2.html',
  		controller: 'Main',
  		reloadOnSearch: false,
  		resolve: {'MembersData': function(Members) {
  				return Members.promise; },
  			'GigsData': function(Gigs) {
  				return Gigs.promise;
  			}}
  	})

    // $routeProvider.when('/create_gig', {templateUrl: 'partials/partial2.html', controller: 'Main'});
    $routeProvider.otherwise({redirectTo: '/gigs'});

  }])
  .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
      var original = $location.path;
      $location.path = function (path, reload) {
          if (reload === false) {
              var lastRoute = $route.current;
              var un = $rootScope.$on('$locationChangeSuccess', function () {
                  $route.current = lastRoute;
                  un();
              });
          }
          return original.apply($location, [path]);
      };
  }])
