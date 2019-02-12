'use strict';

/* Controllers */

angular.module('Giggity.controllers', [])
  .controller('Main', ['$scope', '$rootScope', '$window', '$route', '$routeParams', 'Requests', '$location', '$filter', '$position', '$timeout', '$modal', 'Members', 'Gigs',
	function($scope, $rootScope, $window, $route, $routeParams, Requests, $location, $filter, $position, $timeout, $modal, Members, Gigs) {
    $rootScope.app_loaded = false;
    $scope.Members = Members;
    $scope.Gigs = Gigs;
		$scope.gig = {};
		$scope.members = [];
		$scope.membersList = [];
    $scope.songs = [];
		$scope.currentGigIndex = 0;
		$scope.gig_loading = 0;
		$scope.membernamefilter = '';
		$scope.memberavailablefilter = '';
		$scope.currentUser = localStorage.currentUser;
		// $scope.editAvailability = 0;
		$scope.location = $location;
		$scope.tab = { 'gig_details': true };
		$scope.mobile = false; //$(window).width() <= 480;
		$scope.mobileView = 'mobile-view-nav';
    $scope.showModal = false;
    $scope.gigLimit = 15;
    $scope.page = 1;
    $scope.fetchAllGigs = false;
    $scope.fetchingGigs = false;

		$scope.$on('$routeUpdate', function() {
			$scope.setView();
		});

    $scope.setTab = function(tab) {
      $scope.tab = {};
      $scope.tab[tab] = true;
    }

		$scope.setView = function(clear) {
			if (clear) {
        $routeParams.gig_id = null;
        $location.path("/gigs", false);
      }
      var gig_id = $routeParams.gig_id;
			if (! $scope.mobile || gig_id) {
				$scope.mobileView = 'mobile-view-gig';
        if (gig_id) {
          if (gig_id != 'new') {
            $scope.fetchGig(gig_id);
            // $rootScope.app_loaded = true;
          } else if ($rootScope.app_loaded) {
            $scope.setTab(($scope.gig.type == 'gig' ? 'band' : 'gig') + '_details');
          } else {
            $rootScope.app_loaded = true;
          }
        } else {
          $scope.fetchGig();
          $rootScope.app_loaded = true;
        }
			} else {
				$scope.mobileView = 'mobile-view-nav';
        $rootScope.app_loaded = true;
			}
		};

		$scope.changeUser = function() {
			$scope.currentUser = null;
			$scope.currentUserName= null;
			$scope.user = null;
			localStorage.removeItem('currentUser');
			$('#current_user_input').val();
      $scope.showModal = 'login';
		}

		$scope.saveGig = function() {
			$scope.gig.tactical = $scope.gig.tactical ? $scope.gig.tactical.id : '';
			$scope.gig.musical = $scope.gig.musical ? $scope.gig.musical.id : '';
      if ($scope.gig.gig_id == 'new') { delete $scope.gig.gig_id; }
			return Requests.write('saveGig', $scope.gig, $scope.gig.gig_id).then(function(gig) {
        gig.is_musical = gig.musical == $scope.currentUser;
        gig.is_tactical = gig.tactical == $scope.currentUser;
        $scope.Gigs.gigs[gig.gig_id] = gig;
        $scope.Gigs.updateGigsList();
				$scope.setGig(gig);
			})
		}

		$scope.deleteGig = function(gig_id) {
      $scope.showModal = false;
			if (!gig_id) {
				$scope.fetchGig();
			} else {
				Requests.write('deleteGig',{}, gig_id).then(function(data) {
					delete $scope.Gigs.gigs[$scope.gig.gig_id];
					$scope.Gigs.updateGigsList();
					$scope.fetchGig();
				})
			}
			return false;
		}

    $scope.changeGig = function(gig_id, edit) {
  	  var type = $scope.Gigs.gigs[gig_id] ? $scope.Gigs.gigs[gig_id].type : 'gig';
  	  var tab = edit && type == 'gig' ? 'band_details': 'gig_details';
      $scope.setTab(tab);
      $routeParams.gig_id = gig_id;
      $location.path("/gigs/"+gig_id, false);
      $scope.setView();
    };

		$scope.setGig = function(gig) {
			$scope.gig = gig;
			$scope.setCurrentGigIndex();
			$scope.gig.tactical = $scope.gig.tactical ? $scope.members[$scope.gig.tactical] : '';
			$scope.gig.musical = $scope.gig.musical ? $scope.members[$scope.gig.musical] : '';
      $scope.gig.setlist = $scope.gig.setlist || [];
			$scope.membernamefilter = '';
			$scope.memberavailablefilter = '';
			$scope.gig_loading = 0;
      $rootScope.app_loaded = true;
      $scope.$broadcast('gigSet');
		}

		$scope.fetchGig = function(gig_id) {
			$scope.gig_loading = 1;
      if (!gig_id || ! $scope.Gigs.gigs[gig_id]) {
        gig_id = $scope.Gigs.gigsList[0].gig_id;
      }
			return Requests.fetch('fetchGig', {gig_id: gig_id}).then(function(gig) {
				$scope.setGig(gig);
			})
		}

    $scope.fetchGigs = function() {
      $scope.fetchingGigs = true;
      return $scope.Gigs.fetchGigs($scope.currentUser, $scope.fetchAllGigs).then(function() {
        $scope.fetchingGigs = false;
      });
    }

    $scope.fetchSongs = function() {
      return Requests.fetch('fetchSongs').then(function(results) {
        $scope.songs = results;
      });
    }

    $scope.refreshData = function() {
      $scope.fetchSongs();
      $scope.fetchGigs();
    }

		$scope.newGig = function(type) {
      var type = type ? type : 'gig';
      var title = type == 'gig' ? 'New Gig' : 'Rehearsal';

			$scope.gig = {
        title:title,
        availability: {},
        gig_id: 'new',
        type: type,
        meet_time: '01:00',
        band_start: type === 'gig' ? '02:00' : '19:00',
        band_end: type === 'gig' ? '03:00' : '22:00',
        start_time: '02:00',
        end_time: '03:00',
        approved: 0,
        publish: false,
        private: false
      };
      $scope.changeGig('new', true);
			// $scope.setTab('band_details');
		}

		$scope.setCurrentGigIndex = function() {
			if ($scope.gig) {
				var gig_id = $scope.gig.gig_id;
				$($scope.Gigs.gigsList).each(function(i, e) {
					if(e.gig_id == gig_id) {
						$scope.currentGigIndex = i;
						return false;
					}
				});
			}
		}

		$scope.getAvailability = function(gig_id, user_id) {
			var gig_id = gig_id ? gig_id : $scope.gig.gig_id;
			var user_id = user_id ? user_id : $scope.currentUser;
			var gig = $scope.Gigs.gigs[gig_id];
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
			$scope.setTab('availability');
			$scope.memberavailablefilter = type;
		}

    $scope.setAvailability = function(member_id, gig_id) {
      member_id = member_id || $scope.currentUser;
      var availability = {
        member_id: member_id
      };
      if (gig_id) {
        availability = $scope.Gigs.gigs[gig_id].availability[member_id];
      } else {
        gig_id = $scope.gig.gig_id;
        availability = $scope.gig.availability[member_id];
      }
      availability.action = 'setAvailability';
      return Requests.write('setAvailability', availability, gig_id).then(function(availability) {
        $scope.Gigs.gigs[gig_id].availability[member_id] = availability;
        if (gig_id == $scope.gig.gig_id) {
          $scope.gig.availability[member_id] = $scope.Gigs.gigs[gig_id].availability[member_id];
        }
        $scope.Gigs.updateGigsList();
      });
    }

    $scope.setModalState = function(modal) {
      $scope.showModal = modal;
    }

		if (! $scope.currentUser) { $scope.changeUser(); }

    $scope.$watch('fetchAllGigs', function(v, o) {
      if (v != o) {
        $scope.fetchGigs();
      }
    })

    $scope.$watch('Members.members', function() {
      $scope.members = Members.members;
      $scope.membersList = Members.membersList;
      if ($scope.members) {
        $scope.currentUserName = $scope.members[$scope.currentUser] ? $scope.members[$scope.currentUser].name : '';
      }
    });

    $scope.$watch('Gigs.hideRehearsals', function() {
      $scope.Gigs.updateGigsList();
    });

    $scope.fetchSongs();

    var initWatch = $scope.$watch(function() {
        return $scope.members && $scope.Gigs.gigsList;
      }, function(v) {
        if (v) {
          if ($routeParams.action && $routeParams.gig_id && $scope.currentUser) {
            $scope.Gigs.gigs[$routeParams.gig_id].availability[$scope.currentUser].available = $routeParams.action;
            $scope.setAvailability($scope.currentUser, $routeParams.gig_id).then(function() {
              $scope.setView($routeParams.gig_id == 'new');
            });
          } else {
            $scope.setView($routeParams.gig_id == 'new');
          }
          initWatch();
        }
      }
    );

	},
]);
