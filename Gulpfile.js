var gulp = require("gulp");
var coffee = require("gulp-coffee");
var sass = require("gulp-sass");
var gutil = require ("gutil");

gulp.task('coffee', function() {
  gulp.src('./cfe/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./js/'))
});

gulp.task('sass', function () {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function() {
  gulp.watch([
    './cfe/*.coffee',
    './cfe/**/*.coffee'
    ], ['coffee']);
  gulp.watch([
    './scss/application.scss'
    ], ['sass'])
});
