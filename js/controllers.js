'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', ['$scope', '$http',  function($scope, $http, Members) {
		$http.post("backend/requests.php", {action:"showGigs"}).success(function(response)	{
			$scope.gigs = response.data
		})
  }])
  .controller('MyCtrl2', ['$scope', '$routeParams', '$http', '$location', '$filter', '$position', '$timeout', 'Members', 'Gigs',
	function($scope, $routeParams, $http, $location, $filter, $position,$timeout, Members, Gigs) { 
		$scope.gig = {};
		$scope.gigs = {};
		$scope.gigsList = [];
		$scope.members = [];
		$scope.membersList = [];
		$scope.currentGigIndex = 0;
		$scope.gig_loading = 0;
		$scope.membernamefilter = '';
		$scope.memberavailablefilter = '';
		$scope.currentUser = localStorage.currentUser;
		$scope.editAvailability = 0;
		$scope.timer = false;
		$scope.timeout = $timeout;
		$scope.location = $location; 
		$scope.savingText = "<i class='icon-spin icon-refresh'></i> Saving...";
		$scope.current_tab = 'gig_details';

		$scope.$on('$routeUpdate', function() {
			$scope.setView();
		});
		
		$scope.setView = function(first) {
			var gig_id = $location.search().gig_id;
			if (! first) { 
				$scope.changeGig(gig_id);
			} else {
				$scope.setGig(gig_id);
			}	
		};

		$scope.changeUser = function() {
			$scope.currentUser = null;
			$scope.currentUserName= null;
			$scope.user = null;
			delete localStorage.currentUser;
			$('#current_user_input').val();
			$('#loginModal').modal('show');
			$('#loginModal').on('shown', function() {
				$('#current_user_input').focus();	
			});
		}

		$scope.saveGig = function() {
			$('.save-gig-button').button('loading');
			var gig_id = $scope.gig.gig_id;
			$scope.gig.action = 'saveGig';
			$scope.gig.tactical = $scope.gig.tactical ? $scope.gig.tactical.id : '';
			$scope.gig.musical = $scope.gig.musical ? $scope.gig.musical.id : '';
			$http.post('backend/requests.php', $scope.gig).success(function(response) { 
				$('.save-gig-button').button('reset');
				if ($scope.checkResponse(response)) { 
					$scope.gigs[gig_id] = response.data;
					$scope.setGig(gig_id);
					$scope.updateGigsList();
				}
			})
		}
		$scope.deleteGig = function(gig_id) {
			$('#deleteModal').modal('hide');
			if (!gig_id) {
				$scope.setGig();
			} else {
				$http.post('backend/requests.php', {gig_id:gig_id, action:'deleteGig'}).success(function(response) { 
					if ($scope.checkResponse(response)) { 
						delete $scope.gigs[$scope.gig.gig_id];
						$scope.updateGigsList();
						$scope.setGig();
					}
				})
			}
			return false;
		}
		$scope.setAvailability = function($event, member_id, gig_id) {
			if($event && $($event.target).hasClass('btn')) {
				$($event.target).button('loading');
			}
			member_id = member_id ? member_id : $scope.currentUser;
			var availability = {};
			if (gig_id) { 
				availability = $scope.gigs[gig_id].availability[member_id];
			} else {
				gig_id = $scope.gig.gig_id;
				availability = $scope.gig.availability[member_id];
			}
			availability.action = 'setAvailability';
			$http.post('backend/requests.php', availability).success(function(response) { 
				$('#'+gig_id).removeClass('saving');	
				$('#availability_'+member_id).removeClass('saving');	
				$('.user_gig_details').removeClass('edit');
				if($event && $($event.target).hasClass('btn')) {
					$($event.target).button('reset');
				}
				if ($scope.checkResponse(response)) { 
					$scope.gigs[gig_id].availability[member_id] = response.data;
					if (gig_id == $scope.gig.gig_id) { 
						$scope.gig.availability[member_id] = $scope.gigs[gig_id].availability[member_id];
						//$scope.gig.availability = angular.copy($scope.gigs[gig_id].availability);
					}
					$scope.updateGigsList();
				}
			});
		}

		$scope.changeGig = function(gig_id, edit) {
			$scope.fetchGig(gig_id);
			if (edit) { 
				$scope.current_tab = 'band_details';
			} else {
				$scope.current_tab = 'gig_details';
			}
		}

		$scope.updateGigsList = function() {
			$scope.gigsList  = $filter("orderBy")($filter("toArray")($scope.gigs), 'date');
		}

		$scope.setGig = function(gig_id) {
			if (!gig_id || ! $scope.gigs[gig_id]) {
				gig_id = $scope.gigsList[0].gig_id;
			}	
			//$scope.gig = angular.copy($scope.gigs[gig_id]);
			$scope.gig = $scope.gigs[gig_id];
			$scope.setCurrentGigIndex();
			$scope.gig.tactical = $scope.gig.tactical ? $scope.members[$scope.gig.tactical] : '';
			$scope.gig.musical = $scope.gig.musical ? $scope.members[$scope.gig.musical] : '';
			$scope.editAvailability = ($scope.getAvailability() == 'Unknown');
			$scope.membernamefilter = '';
			$scope.memberavailablefilter = '';
			$scope.gig_loading = 0;
		}

		$scope.fetchGig = function(gig_id) {
			$scope.gig_loading = 1;
			var post = {action: 'fetchGig', gig_id: gig_id};
			$http.post('backend/requests.php', post).success(function(response) { 
				$scope.checkResponse(response);
				$scope.gigs[gig_id] = response.data;
				$scope.setGig(gig_id);
			})
		}

		$scope.newGig = function() {
			$scope.gig = {title:'New Gig', availability: {}};
			$scope.current_tab = 'band_details';
		}
		$scope.checkResponse = function(response) { 
			var message = 'An error occurred';
			if (response.statusCode !== 1) { 
				var statusString;
				if (typeof(response.statusCode) == 'undefined') {
					statusString = "<pre>"+response+"</pre>";
					message = 'An unknown error occurred';
				} else {
					statusString = response.statusString;
				}	
				$('#status').html(message+": "+statusString).removeClass().addClass('alert alert-error').show();
				return 0;
			} else {
				$('#status').hide();
				return 1;
			}
		}
		$scope.toggleDeleteModal = function() {
			$('#deleteModal').modal('toggle');
		}
		$scope.toggleEdit = function() {
	//		$('#edit_gig').toggle();
	//		$('#gig_details').toggle();
		}
		$scope.setCurrentGigIndex = function() {
			if ($scope.gig) { 
				var gig_id = $scope.gig.gig_id;
				$($scope.gigsList).each(function(i, e) { 
					if(e.gig_id == gig_id) { 
						$scope.currentGigIndex = i;
						return false;
					}
				});
			}
		}	
		$scope.setUser = function() {
			if($scope.user.id) { 
				$scope.currentUser = $scope.user.id;
				localStorage.currentUser = $scope.user.id;
				$scope.currentUserName = $scope.members[$scope.currentUser].name;
				$('#login_error').hide();
				$('#login_form').removeClass('error');
				$('#loginModal').modal('hide');
			} else {
				$('#login_form').addClass('error');
				$('#login_error').show();
			}
		}

		$scope.getAvailability = function(gig_id, user_id) {
			var gig_id = gig_id ? gig_id : $scope.gig.gig_id;
			var user_id = user_id ? user_id : $scope.currentUser;
			var gig = $scope.gigs[gig_id];
			if (user_id && gig && gig.availability && gig.availability[user_id]) {
				if (gig.approved == '-1') { return 'Gig Declined'; }
				return gig.availability[user_id].available;
			}
			return "";
		}

		$scope.editUserAttrib = function(type) {
			$('#'+type).addClass('edit');
			$('#'+type+'_input').focus();
		}

		$scope.editAvailable = function(type) {
			$scope.current_tab = 'availability';
			$scope.memberavailablefilter = type;
		}

		$scope.setAvailabilityFromList = function(gig_id) { 
			$('#'+gig_id).addClass('saving');	
			$('#'+gig_id+' .btn').button('loading');	
			$scope.setAvailability(null, $scope.currentUser, gig_id);
		}

		$scope.setAvailabilityFromGrid = function(member_id) { 
			$('#availability_'+member_id).addClass('saving');	
			$('#availability_'+member_id+' .btn').button('loading');	
			$scope.setAvailability(null, member_id);
		}

		if (! $scope.currentUser) { $scope.changeUser(); }
		$('#init-loading').hide();	
		var membersdata = Members.getMembers();
		if ($scope.checkResponse(membersdata)) {
			$scope.members = membersdata.data;
			$scope.membersList = $filter("orderBy")($filter("toArray")($scope.members), 'name');
			$scope.currentUserName = $scope.members[$scope.currentUser] ? $scope.members[$scope.currentUser].name : '';
			var gigsdata = Gigs.getGigs();
				if ($scope.checkResponse(gigsdata)) { 
					$scope.gigs = gigsdata.data
					$scope.updateGigsList();
					$scope.setView(1);
				}
		}
	},
 
  ]);
