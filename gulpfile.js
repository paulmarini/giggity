var gulp   = require('gulp');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var bower  = require('bower-files')();
var inject = require("gulp-inject");
var series = require('stream-series');

gulp.task('bower', function(){
  gulp.src(bower.ext('js').files)
    .pipe(concat('third-party.js'))
    .pipe(gulp.dest('./lib'))

  gulp.src(bower.ext('css').files)
    .pipe(concat('third-party.css'))
    .pipe(gulp.dest('./lib'))

console.log(bower.files);
  gulp.src(bower.ext(['eot', 'woff', 'woff2', 'ttf', 'svg']).files)
    .pipe(gulp.dest('./fonts'))
  return;
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

gulp.task('index', function () {
  var target = gulp.src('index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var libSources = gulp.src(['./lib/*.js', './lib/*.css'], {read: false});
  var sources = gulp.src(['./js/*.js', './css/*.css'], {read: false});

  return target.pipe(inject(series(libSources, sources), {relative: true}))
    .pipe(gulp.dest(''));
});

gulp.task('default', ['bower', 'index']);
