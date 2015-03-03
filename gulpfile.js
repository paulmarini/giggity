var gulp   = require('gulp');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var bower  = require('bower-files')();
var inject = require("gulp-inject");
var series = require('stream-series');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var rev = require('gulp-rev');
var del = require('del');


gulp.task('clean', function(cb){
	del.sync(['lib/*', 'fonts/*']);
	cb();
});

gulp.task('bower', ['clean'], function(cb){


  gulp.src(bower.ext('js').files)
    .pipe(concat('third-party.js'))
    .pipe(uglify())
	.pipe(rev())
    .pipe(gulp.dest('./lib'))


  gulp.src(bower.ext('css').files)
    .pipe(concat('third-party.css'))
    .pipe(minifyCSS())
	.pipe(rev())
    .pipe(gulp.dest('./lib'))

console.log(bower.files);
  return gulp.src(bower.ext(['eot', 'woff', 'woff2', 'ttf', 'svg']).files)
    .pipe(gulp.dest('./fonts'))
	.pipe(rev())
	cb();
    // var mainFiles = mainBowerFiles();
    //
    // return gulp.src(mainFiles)
    //   .pipe(gulp.dest('./lib'));
    //
    // if(!mainFiles.length){
    //     // No main files found. Skipping....
    //     return;
    // }
    //
    // var jsFilter = filterByExtension('js');
    // gulp.src(mainFiles)
    //
    // return gulp.src(mainFiles)
    //     .pipe(jsFilter)
    //     .pipe(concat('third-party.js'))
    //     .pipe(gulp.dest('./lib'))
    //     .pipe(jsFilter.restore())
    //     .pipe(filterByExtension('css'))
    //     .pipe(concat('third-party.css'))
    //     .pipe(gulp.dest('./lib'));
});

gulp.task('index', ['bower'], function (cb) {
  var target = gulp.src('index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var libSources = gulp.src(['./lib/*.js', './lib/*.css'], {read: false});
  var sources = gulp.src(['./js/*.js', './css/*.css'], {read: false});

  return target.pipe(inject(series(libSources, sources), {relative: true}))
    .pipe(gulp.dest(''));
	cb();
});

gulp.task('default', ['index']);
