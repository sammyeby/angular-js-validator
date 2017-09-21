'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    pump = require('pump'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    ngAnnotate = require('gulp-ng-annotate'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect');


gulp.task('connect', function() {
    connect.server({
        root: 'www',
        livereload: true,
        port: 8000
    });
});

gulp.task('libs', function () {
    return gulp.src([
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/angular/angular.min.js'
    ])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./www/script'));
});

gulp.task('script', function () {
    var stream = pump([
        gulp.src([
            './src/es-ng-validator.js',
            './demo/app.js',
            './demo/customElement/*.js'
        ]),
        sourcemaps.init(),
        uglify(),
        concat('demo.js'),
        sourcemaps.write(),
        gulp.dest('./www/script')
    ], function (err) {
        console.log('pipe finished', err)
    });

    return stream
        .pipe(connect.reload());
});

gulp.task('sass', function () {
    return gulp.src('./demo/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./www/css'))
        .pipe(connect.reload());
});

gulp.task('html', function () {
    return gulp.src('./demo/**/*.html')
        .pipe(gulp.dest('./www'))
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./demo/**/*.html'], ['html']);
    gulp.watch(['./demo/**/*.js'], ['script']);
    gulp.watch(['./src/*.js'], ['script']);
    gulp.watch(['./demo/**/*.scss'], ['sass']);
});

gulp.task('default', ['connect', 'html', 'libs', 'script', 'sass', 'watch']);
