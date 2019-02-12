'use strict';

/* Directives */
var app = angular.module('Giggity.directives', []);

app.directive('memberComments', [function() {
	return {
		restrict: 'A',
		link:function(scope, elm, attrs) {
			var type = attrs.type ? attrs.type : 'concerns';
			function updateConcerns(availability) {
				if (! availability) { return; }
				var concerns = scope.membersList;
				var output = '';
				$(concerns).each(function(i, m) {
					if (availability[m.id]) {
						if (availability[m.id][type]) {
							var name = m.name;
							var detail = scope.gig.availability[m.id][type];
							output += "<strong>"+name+"</strong>:&nbsp;&nbsp;<span>"+detail+"</span><br/>";
						}
					}
				});
				elm.html(output);
			}
			scope.$watch('gig.availability[currentUser]', function(value) {
				updateConcerns(scope.gig.availability);
			}, true);
			updateConcerns(scope.gig.availability);
		}
	}
}]);

app.directive('fadeIn', function () {
	return {
		restrict: 'A',
		link: function (scope, element, attribs) {
			scope.$watch(attribs.fadeIn, function (value) {
				if (value) {
					$(element).fadeIn();
				} else {
					$(element).hide(); // hide immediately; don't fade out
				}
			});
		}
	};
});

app.directive('gigDetails', [function() {
	return {
		restrict: 'A',
		link:function(scope, elm, attrs) {
			function updateDetails(string) {
				if (! string) { return; }
				var output = '';
				$(string.split('\n\n')).each( function(i, item) {
					var values = item.split(':');
					values[0] = values[0].replace(/_/g, ' ');
					if (values[0]) {
						values[0].toLowerCase();
					}
					if (! values[1]) { values[1] = '&nbsp;'; }
					output+='<dt style="text-transform:capitalize">'+values[0]+"</dt><dd class='clearfix'>"+values[1]+'</dd>';
				});
				elm.html(output);
			}
			scope.$watch('gig.details', function(value) {
				updateDetails(value);
			});
			updateDetails(scope.gig.details);
		}
	}
}]);

app.directive('eatClick', function() {
	return function(scope, element, attrs) {
		$(element).click(function(event) {
			event.stopPropagation();
			return false;
		});
	}
});

app.directive('feedbackButton', function($rootScope) {
	return {
		restrict: 'A',
		scope: {
			'status': '@',
		},
		link:function(scope, element, attribs) {
			scope.rootScope = $rootScope;
			element.bind('click', function(e) {
				scope.$apply(function() {
					scope.rootScope.remoteAction = 'pending';
					attribs.$set('disabled', true);
					$(element).find('.glyphicon').hide();
					element.prepend("<span class='processing-spinner glyphicon glyphicon-refresh glyphicon-spin'></span>");
				})
			})
			scope.$watch('rootScope.remoteAction', function(value, old) {
				if (! scope.rootScope.remoteAction) {
					attribs.$set('disabled', null);
					$(element).find('.processing-spinner').remove();
					$(element).find('.glyphicon').show();
				}
			})
		}
	}
});

app.directive('gigStatus', [function() {
	return {
		restrict: 'A',
		link:function(scope, elm, attrs) {
			function updateStatus(string) {
				//var string = attrs.gigStatus;
				var icon = 'glyphicon glyphicon-thumbs-up';
				var color = 'text-success';
				var text = 'Approved';
				if(string == -1) {
					icon = 'glyphicon glyphicon-thumbs-down';
					color = 'text-error';
					text = 'Declined';
				} else if(string == 0 ) {
					icon = 'glyphicon glyphicon-question-sign';
					color = 'text-warning';
					text = 'Undecided';
				}
				elm.html("<span class='"+color+"'><i class='"+icon+"'></i> "+text+"</span>");
			}
			scope.$watch('gig.approved', function(value) {
				updateStatus(value);
			});
			updateStatus(attrs.gigStatus);
		}
	}
}]);

app.directive('addclassonhover', function() {
	return {
  	link : function(scope, element, attrs) {
			var classname = attrs.addclassonhover;
			$(element).mouseenter(function() {
				$('.'+classname).removeClass(classname);
        element.addClass(classname);
      });
			$(element).mouseleave(function(e) {
				if (e.target.nodeName == 'SELECT') { return; }
      	element.removeClass(classname);
      });
    }
  };
});

app.directive('editToggle', function($compile){
	return {
		scope: true,
		link: function(scope, element, attrs) {
			scope.editing = false;
			scope.showEdit = function() {
				scope.editing = true;
				element.addClass('edit');
				$(element).find('textarea, select').focus();
			}
			element.find('span').after($compile(
				"<span ng-show='editing' class='btn btn-default btn-sm'><i class='glyphicon glyphicon-check'></i> Save</span>" +
				"<span ng-hide='editing' class='btn btn-default btn-xs' ng-click='showEdit()'><i class='glyphicon glyphicon-edit'></i> Edit<span>"
			)(scope));
			$(element).find('textarea, select').on('blur', function() {
				scope.$apply(function() {
					element.removeClass('edit');
					scope.editing = false;
				});
			});
		}
	}
});

app.directive('loadingFeedback', function($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			scope.update = function(){
				$(element).trigger('blur');
				element.parent().append("<span class='label label-primary feedback' type='button'><i class='glyphicon glyphicon-refresh glyphicon glyphicon-spin'></i> Saving...</button>");
				var action = $parse(attrs.loadingFeedback);
				action(scope).then(function() {
					$(element).nextAll('.feedback').remove();
				});
			}
			element.on('change', scope.update);
		}
	}
})

app.directive('resize', function ($window) {
	return {
		link: function (scope) {
			function updateMobile() {
				scope.mobile = $window.innerWidth < 768;
			}
			angular.element($window).bind('resize', function () {
				scope.$broadcast('windowResize');
				scope.$apply(function () {
					updateMobile();
				});
			});
			updateMobile();
		}
	}
});

app.directive('modal', function($rootScope, Gigs) {
	return {
		restrict: 'A',
		templateUrl: 'modal.html',
		link: function(scope, element, attrs) {
			scope.setUser = function() {
				if(scope.user && scope.user.id) {
					scope.currentUser = scope.user.id;
					localStorage.currentUser = scope.user.id;
					scope.currentUserName = scope.members[scope.currentUser].name;
					$('#login_error').hide();
					$('#login_form').removeClass('has-error');
					scope.showModal = false;
					scope.fetchGigs();
				} else {
					$('#login_form').addClass('has-error');
					$('#login_error').show();
				}
			}

			$('#modal').on('hidden.bs.modal', function() {
				scope.$apply(function() { scope.showModal = false; });
			});

			scope.$watch('showModal', function(value) {
				if (value == false) {
					$('#modal').modal('hide');
					$rootScope.remoteAction = false;
				} else {
					$('#modal').modal('show');
					$('#modal').on('shown.bs.modal', function() {
						$('#current_user_input').focus();
					});
				}
			})
		}
	}
})

app.directive('datePicker', function() {
	return {
		restrict: 'E',
		template:
			'<div class="input-group date-picker">'+
			'<input class="form-control" ng-model="model" use-native="true" data-model-date-format="yyyy-MM-dd" data-date-format="MM/dd/yyyy" data-date-type="string" data-autoclose="1" bs-datepicker type="text">'+
			'<span ng-click="focus()" class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span></div>',
		scope: {
			model: '='
		},
		link: function(scope, element, attrs) {
			scope.focus = function() {
				$(element).find('input').focus();
			}
		}
	}
});

app.directive('timePicker', function() {
	return {
		restrict: 'E',
		template:
			'<div class="input-group time-picker col-xs-5">'+
			'<input class="form-control" size="8" ng-model="model" use-native="true" data-time-type="string" data-autoclose="1" bs-timepicker data-model-time-format="H:mm" data-time-format="h:mm a" data-length="1" data-arrow-behavior="picker" type="text">'+
			'<span ng-click="focus()" class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span></div>',
		scope: {
			model: '='
		},
		link: function(scope, element, attrs) {
			scope.focus = function() {
				$(element).find('input').focus();
			}
		}
	}
});

app.directive('setList', function($filter, $timeout) {
	return {
		restrict: 'A',
		templateUrl: 'setList.html',
		scope: {
			repertoire: '=songs',
			setlist: '=',
		},
		link:function(scope, element, attribs) {
			scope.newsong = '';

			scope.addSong = function(song) {
				var song = song || scope.newsong;
				if (! song) { return; }

				//If it's already in the list, append a number
				var count = $filter('count')(scope.setlist.map(function(i) { return i.replace(/ \(\d+\)$/, '')}), song);
				if (count) {
					song += " ("+(count+1)+")";
				}
				scope.newsong = '';
				scope.setlist.push(song);

				if (scope.songs.indexOf(song) >= 0) {
					scope.songs.splice(scope.songs.indexOf(song), 1);
				}
			}

			scope.removeSong = function(song) {
				scope.songs.push(song);
				scope.setlist.splice(scope.setlist.indexOf(song), 1);
			}

			var updateRep = function() {
				scope.songs = angular.copy($filter('filterArray')(scope.repertoire, scope.setlist));
			}

			scope.$on('gigSet', function() {
				$timeout(function() {
					updateRep()
				})
			});
			scope.$watch('repertoire', updateRep);
		}
	}
});

app.directive('emailInfo', function($filter, Members, Requests) {
	return {
		restrict: 'A',
		templateUrl: 'emailInfo.html',
		scope: {
			gig: '=',
		},
		link:function(scope, element, attribs) {
			scope.dateFormat = $filter('date');
			//scope.timeFormat = $filter('date');
			var time = '2000-01-01T'+scope.gig.band_start+':00-0800';
			scope.timeFormat = function(time) {
				var date = '2000-01-01T'+time+':00';
				return $filter('date')(date, 'h:mm a');
			}
			scope.subject = "Gig Details: "+scope.dateFormat(scope.gig.date, 'M/d')+"@"+scope.timeFormat(scope.gig.band_start)+' - '+scope.gig.title;
			scope.body =
				"When: "+scope.dateFormat(scope.gig.date, 'EEEE, M/d')+", Meet at "+scope.timeFormat(scope.gig.meet_time || '???') + ", play from "+scope.timeFormat(scope.gig.band_start)+" - "+scope.timeFormat(scope.gig.band_end)+
				"\nWhere: "+scope.gig.location+
				//"\nTactical: "+(scope.gig.tactical ? Members.members[scope.gig.tactical.id].name : '???')+
				//"\nMusical: "+(scope.gig.musical ? Members.members[scope.gig.musical.id].name : '???') +
				//"\nColors: "+(scope.gig.colors || '???') +
				"\nYeses: "+$filter('memberProperty')($filter('availableFilter')(Members.membersList, ['Yes', scope.gig]), ['name'])+
				"\nMaybes: "+$filter('memberProperty')($filter('availableFilter')(Members.membersList, ['Maybe', scope.gig]), ['name'])+
				"\n\nDetails:\n"+(scope.gig.description || 'Hey! You need to save the gig details into giggity!');

			if (scope.gig.setlist.length) {
				scope.body += '\n\nSet List: ';
				$.each(scope.gig.setlist, function(i, song){
					scope.body += '\n'+(i+1)+'. '+song;
				});
			}
			scope.send = function() {
				Requests.write('sendInfoEmail', {subject: scope.subject, body: scope.body}).then(function(response) {
					scope.$parent.setModalState(false);
				});
			};
		}
	};
});

//This was craziness for another timepicker directive, replaced by above.
// app.directive('timePicker', function($filter, $timeout) {
// 	return {
// 		restrict: 'E',
// 		template:
// 			'<div class="input-group time-picker col-xs-5">'+
// 			'<input ng-click="isOpen = false" ng-keyup="updateTime()" timepicker-options="options" class="form-control" type="text" datetime-picker="hh:mm a" now-text="Now" is-open="isOpen" enable-date="false" ng-model="time"/>'+
// 			'<span ng-click="open($event)" class="input-group-addon"><i class="glyphicon glyphicon-time"></i></span></div>',
// 		scope: {
// 			model: '='
// 		},
// 		link: function(scope, element, attrs) {
// 			scope.isOpen = false;
// 			scope.options = {
// 				'minuteStep': 10
// 			};
//
// 			var setTime = function(s) {
// 				if (! s) { return; }
// 				var d = new Date();
// 				var parts = s.match(/(\d+):(\d+) ?(\w+)/);
// 				var hours = /am/i.test(parts[3]) ? (parts[1] == 12 ? 0 : parseInt(parts[1], 10)) : parseInt(parts[1], 10) + 12;
// 				var minutes = parseInt(parts[2], 10);
//
// 				d.setHours(hours);
// 				d.setMinutes(minutes);
// 				d.setSeconds(0);
// 				d.setMilliseconds(0);
// 				return d;
// 			}
//
// 			var debounce = function(func, wait, immediate) {
// 				var timeout;
// 				return function() {
// 					var context = this, args = arguments;
// 					var later = function() {
// 						timeout = null;
// 						if (!immediate) func.apply(context, args);
// 					};
// 					var callNow = immediate && !timeout;
// 					clearTimeout(timeout);
// 					timeout = setTimeout(later, wait);
// 					if (callNow) func.apply(context, args);
// 				};
// 			};
//
// 			scope.updateTime = debounce(function() {
// 				var time = setTime(element.find('input').val());
// 				if (! scope.time || time.getTime() != scope.time.getTime()) {
// 					scope.$apply(function() {
// 						scope.time = time;
// 					});
// 				}
// 			}, 500);
//
// 			scope.open = function(e) {
// 				e.preventDefault();
// 				e.stopPropagation();
// 				scope.isOpen = true;
// 			}
//
// 			scope.time = setTime(scope.model);
//
// 			scope.$watch('model', function(v, o) {
// 				if (v != o) {
// 					var time = setTime(scope.model);
// 					if (scope.time != time) {
// 						scope.time = time;
// 					}
// 				}
// 			})
//
// 			scope.$watch('time', function(v, o) {
// 				if (v != o && v) {
// 					// console.log(scope.model, v, o)
// 					var time = $filter('time')(v.getHours() + ':'+(v.getMinutes() <10 ? '0'+ v.getMinutes() : v.getMinutes()));
// 					if (time != scope.model) {
// 						// console.log('ho!', scope.model, time);
// 						scope.model = time
// 					}
// 				}
// 			})
// 		}
// 	}
// })
