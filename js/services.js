'use strict';

/* Services */

var app = angular.module('myApp.services', []);

app.service('Members', function($http) {
	var members = null;

	var promise = $http.post("backend/requests.php", {action:"fetchMembers"}).success(function(response)	{
		members = response;
	});

	return {
		promise:promise,
		setMembers: function (data) {
			members = data;
		},
		getMembers: function () {
			return members;
		}
	};
});

app.service('Gigs', function($http) {
	var gigs = null;

	var promise = $http.post("backend/requests.php", {action:"fetchGigs"}).success(function(response)	{
		gigs = response;
	});

	return {
		promise:promise,
		setGigs: function (data) {
			gigs = data;
		},
		getGigs: function () {
			return gigs;
		}
	};
});
