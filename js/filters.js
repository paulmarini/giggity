'use strict';

/* Filters */

var app = angular.module('myApp.filters', []);

app.filter('toArray', function() { return function(obj) {
		if (!(obj instanceof Object)) return obj;
		return $.map(obj, function(val, key) {
			return Object.defineProperty(val, '$key', {__proto__: null, value: key});
		});
	}});

app.filter('nlBr', function() { 
	return function(string) {
		if (! string) { return }
		return string.replace(/\n\n/g, '<br/>');
}});

app.filter('length', function() {
	return function(array) {
		return array.length;
}});

app.filter('memberProperty', function() {
	return function(array, args) {
		var property = args[0];
		var separator = args[1] ? args[1] : ', ';
		var items = [];
		$(array).each(function(i, m) { 
			items.push(m[property]);
		});
		return items.join(separator);
}});

app.filter('available', function() { 
	return function(string) {
		if (! string) { return }
		string = (string == 'Yes') ? 'Available' : (string == 'No' ? 'Unavailable' : string);
		return string;
}});

app.filter('userUnknownCount', function() {
	return function(items, user) {
		var count = 0;
		if(user) {
			$(items).each(function(i, g) {
				if(g.approved != -1 && g.availability[user].available == 'Unknown') {
					count++;
				}
			});
		}
		return count;

}});

app.filter('URIencode', function() {
  return window.encodeURIComponent;
});

app.filter('availableFilter', function() {
	return function(items, args) {
		var filtered = [];
		var value = args[0];
		if(args[1] && args[1]['availability']) { 
			var gig = args[1]['availability'];
			$(items).each(function(i, m) {
				if(gig[m['id']]) { 
					if (value == 'Coming' && (gig[m['id']]['available'] == 'Yes' || gig[m['id']]['available'] == 'Maybe')) {
						filtered.push(m);
					} else if(gig[m['id']]['available'] == value || value == '') {
						filtered.push(m);
					}
				}
			})
			return filtered;	
		} else { return items; }
}});

app.filter('commentFilter', function() {
	return function(items, gig) {
		var type = 'comments';
		var filtered = [];
		if(gig && gig['availability']) { 
			$(items).each(function(i, m) {
				if(gig['availability'][m['id']]) { 
					if(gig['availability'][m['id']][type]) {
						filtered.push(m);
					}
				}
			})
			return filtered;	
		} else { return items; }
}});

app.filter('concernFilter', function() {
	return function(items, gig) {
		var type = 'concerns';
		var filtered = [];
		if(gig && gig['availability']) { 
			$(items).each(function(i, m) {
				if(gig['availability'][m['id']]) { 
					if(gig['availability'][m['id']][type]) {
						filtered.push(m);
					}
				}
			})
			return filtered;	
		} else { return items; }
}});

app.filter('member', function() {
	return function(obj) {
		if (! obj) { return; }
		return obj.name;
}});

app.filter('time', function() { 
	return function(string) {
		if (! string) { return null; }
		if (string.indexOf('M') >= 0) { return string; }
		var time = string.split(':');
		var hours = time[0];
		var minutes = time[1];
		var ampm = 'AM';
		if (hours > 12) {
			hours -= 12;
			ampm = 'PM';
		} else if (hours == 12) { 
			ampm = 'PM';
		} else if (hours == 0 ) {
			hours = 12;
		}
		return hours+':'+minutes+' '+ampm;
	}
});


