var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  useref = require('gulp-useref'),
  gulpIf = require('gulp-if'),
  uglify = require('gulp-uglify'),
  cssnano = require('gulp-cssnano'),
  runSequence = require('run-sequence'),
  del = require('del'),
  bump = require('gulp-bump'),
  htmlmin = require('gulp-htmlmin'),
  inlinesource = require('gulp-inline-source');

var sassDirectory = 'assets/scss/**/*.scss';

gulp.task('clean', function() {
  return del.sync('dist');
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    ghostMode: false,
    notify: false
  });
});

gulp.task('build-css', function () {
  return gulp.src(sassDirectory)
    .pipe(sass().on('error', sass.logError))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('build-js', function() {
  return gulp.src('index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});

gulp.task('bump-version', function() {
  gulp.src('manifest.json')
    .pipe(bump({ type: 'minor' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean-build', function() {
  del(['dist/assets/**']);
});

gulp.task('build-html', function() {
  return gulp.src('dist/index.html')
    .pipe(inlinesource({
      compress: false
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('move-images', function() {
  gulp.src('assets/images/*')
    .pipe(gulp.dest('dist'));
});

gulp.task('build', function(callback) {
  runSequence('clean', 'build-css', 'build-js', 
    ['move-images', 'build-html', 'bump-version'],
    'clean-build', 
    callback
  );
});

gulp.task('default', ['browser-sync', 'build-css'], function() {
  gulp.watch(sassDirectory, ['build-css']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('*.html', browserSync.reload); 
  gulp.watch('assets/js/**/*.js', browserSync.reload); 
});