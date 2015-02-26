'use strict';

/* Services */

var app = angular.module('Giggity.services', []);

app.service('Members', function(Requests, $filter) {
	var service = this;
	service.members = null;
	service.membersList = null;

	service.promise = Requests.fetch('fetchMembers').then(function(data)	{
		service.members = data;
		service.membersList = $filter("orderBy")($filter("toArray")(service.members), 'name');
	});

	service.getMembers = function () { return members; }

	return service;
});

app.service('Gigs', function(Requests, $filter) {
	var service = this;
	service.gigs = null;
	service.gigsList = null;

	service.updateGigsList = function() {
		service.gigsList  = $filter("orderBy")($filter("toArray")(service.gigs), 'date');
	}
	service.fetchGigs = function(user_id, fetchAllGigs) {
		return Requests.fetch('fetchGigs', {fetchAllGigs: fetchAllGigs, user_id: user_id}).then(function(data) {
			service.gigs = data;
			service.updateGigsList();
		});
	}

	return service;
});

app.service('Requests', function($http, $rootScope) {
	var service = this;
	var checkResponse = function(response) {
		$rootScope.remoteAction = false;
		var response = response.data;
		var message = 'An error occurred';
		if (response.statusCode !== 1) {
			var statusString;
			if (typeof(response.statusCode) == 'undefined') {
				statusString = "<pre>"+response+"</pre>";
				message = 'An unknown error occurred';
			} else {
				statusString = response.statusString;
			}
			$('#status').html(message+": "+statusString).removeClass().addClass('alert alert-danger').show();
			$rootScope.app_loaded = true;
			return;
		} else {
			$('#status').hide();
			return response.data;
		}
	}

	service.fetch = function(action, params) {
		$rootScope.remoteAction = action;
		params = params || {};
		params.action = action;
		return $http.get('backend/requests.php', {params:params, timeout:600000}).then(checkResponse);
	}
	service.write = function(action, data, id) {
		$rootScope.remoteAction = action;
		//data = data || {};
		//data.action = action;
		return $http.post('backend/requests.php', {action: action, gig_id: id, data:data}, {timeout:600000}).then(checkResponse);
	}
	// service.handleError = function(data, status, headers, config) {
	// 	console.log('Error');
	// 	console.log(status);
	// }
});
