var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  useref = require('gulp-useref'),
  gulpIf = require('gulp-if'),
  uglify = require('gulp-uglify'),
  cssnano = require('gulp-cssnano'),
  runSequence = require('run-sequence'),
  del = require('del'),
  bump = require('gulp-bump')
  htmlmin = require('gulp-htmlmin');

var sassDirectory = 'assets/scss/**/*.scss';

gulp.task('clean:dist', function() {
  return del.sync('dist');
})

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
});

gulp.task('sass', function () {
  return gulp.src(sassDirectory)
    .pipe(sass().on('error', sass.logError))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/styles'))
    .pipe(browserSync.stream());
});

gulp.task('useref', function() {
  return gulp.src('index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});

gulp.task('bump:minor', function() {
  gulp.src('manifest.json')
    .pipe(bump({ type: 'minor' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('htmlmin', function() {
  return gulp.src('dist/index.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('moveimages', function() {
  gulp.src('assets/images/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('build', function(callback) {
  runSequence('clean:dist', 'sass', 'useref', 'htmlmin', 
    ['moveimages', 'bump:minor'],
    callback
  );
});

gulp.task('default', ['browserSync', 'sass'], function() {
  gulp.watch(sassDirectory, ['sass']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('*.html', browserSync.reload); 
  gulp.watch('assets/js/**/*.js', browserSync.reload); 
});