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

var sassDirectory = 'dev/scss/**/*.scss';

gulp.task('clean', function() {
  return del.sync('dist');
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './dev'
    },
    ghostMode: false,
    notify: false
  });
});

gulp.task('build-css', function () {
  return gulp.src(sassDirectory)
    .pipe(sass().on('error', sass.logError))
    .pipe(cssnano({
      zindex: false
    }))
    .pipe(gulp.dest('dev'))
    .pipe(browserSync.stream());
});

gulp.task('build-js', function() {
  return gulp.src('dev/index.html')
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

gulp.task('build-images', function() {
  return gulp.src('dev/images/*')
    .pipe(gulp.dest('dist/images'));  
});

gulp.task('build', function(callback) {
  runSequence('clean', 'build-css', 'build-js', 'build-html', 
    ['build-images', 'bump-version'],
    'clean-build',
    callback
  );
});

gulp.task('default', ['browser-sync', 'build-css'], function() {
  gulp.watch(sassDirectory, ['build-css']);
  gulp.watch('dev/*.html', browserSync.reload); 
  gulp.watch('dev/images/*', function() {
    runSequence('build-images', browserSync.reload);
  });
  gulp.watch('dev/js/**/*.js', browserSync.reload); 
});