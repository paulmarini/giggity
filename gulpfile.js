'use strict'

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')({pattern: ['del', 'bower*', 'stream*', 'gulp-*']});

gulp.task('clean', function(cb){
	return $.del(['lib/*', 'fonts/*'], cb);
});

gulp.task('bower', ['clean'], function(cb){
  var libjs = gulp.src($.bowerFiles().ext('js').files)
    .pipe($.concat('third-party.js'))
    .pipe($.uglify())
		.pipe($.rev())
    .pipe(gulp.dest('./lib'))

  var libcss = gulp.src($.bowerFiles().ext('css').files)
    .pipe($.concat('third-party.css'))
    .pipe($.minifyCss())
		.pipe($.rev())
    .pipe(gulp.dest('./lib'))

  var fonts = gulp.src($.bowerFiles().ext(['eot', 'woff', 'woff2', 'ttf', 'svg']).files)
    .pipe(gulp.dest('./fonts'))

	// console.log(bower.files);
	var partials = gulp.src('partials/*.html')
		.pipe($.angularTemplates({module:'Giggity', basePath: 'partials/'}))

	var appjs = $.merge(
			gulp.src(['./js/*.js']),
			partials
		)
		.pipe($.concat('app.js'))
		.pipe($.ngAnnotate())
		.pipe($.uglify())
		.pipe($.rev())
		.pipe(gulp.dest('./lib'))

	var appcss = gulp.src(['./css/*.css'])
		.pipe($.concat('app.css'))
		.pipe($.minifyCss())
		.pipe($.rev())
		.pipe(gulp.dest('./lib'))

	return $.streamSeries(libjs, libcss, fonts, appjs, appcss);

});

gulp.task('index', ['bower'], function (cb) {
  var target = gulp.src('index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
	var libSources = gulp.src(['./lib/third-party*'], {read: false});
  var sources = gulp.src(['./lib/app*'], {read: false});
  return target.pipe($.inject($.streamSeries(libSources, sources), {relative: true}))
    .pipe(gulp.dest(''));
});

gulp.task('dev', function() {
	var target = gulp.src('index.html');
	var libSources = gulp.src(['./lib/third-party*'], {read: false});
	var sources = gulp.src(['./js/*', './css/*'], {read: false});
	return target.pipe($.inject($.streamSeries(libSources, sources), {relative: true}))
		.pipe(gulp.dest(''));
});

gulp.task('default', ['index'], function() {
	return gulp.src('./lib/')
		.pipe($.git.add());
});
