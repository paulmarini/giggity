'use strict';

/* Directives */
var app = angular.module('myApp.directives', []);

app.directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);

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
			scope.$watch('gig.availability[currentUser].concerns', function(value) {
				updateConcerns(scope.gig.availability);
			});
			updateConcerns(scope.gig.availability);
		}
	}
}]);

app.directive('gigDetails', [function() { 
	return {
		restrict: 'A',
		link:function(scope, elm, attrs) {
			function updateDetails(string) { 
				if (! string) { return; }
				var output = '';
				$(string.split('\n\n')).each( function(i, item) {
					var values = item.split(':');
					values[0] = values[0].replace(/_/g, ' ').toLowerCase();
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

app.directive('gigStatus', [function() { 
	return {
		restrict: 'A',
		link:function(scope, elm, attrs) {

			function updateStatus(string) { 
				//var string = attrs.gigStatus;
				var icon = 'icon-thumbs-up';
				var color = 'text-success';
				var text = 'Approved';
				if(string == -1) { 
					icon = 'icon-thumbs-down';
					color = 'text-error';
					text = 'Declined';
				} else if(string == 0 ) {
					icon = 'icon-question-sign';
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

app.directive('addclassonhover',
   function() {
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

app.directive('timepicker',
   function() {
      return {
		 restrict: 'A',
         require: '?ngModel',
		 link : function(scope, element, attrs, ngModel) {
			if (! ngModel) { return; }
			element.bind('blur keyup change', function() {
				if(! scope.$$phase) {
					scope.$apply(read);
				}
			});
			scope.$watch('gig.'+element.id, function(value, oldval) {
				if (element.has_time) { return; }
				element.timepicker({defaultTime:ngModel.value });
				element.has_time = 1;
			});

			function read() {
				ngModel.$setViewValue(element.val());
			}

       }
   };
});
