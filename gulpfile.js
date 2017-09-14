const gulp = require('gulp'),
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
  inlinesource = require('gulp-inline-source'),
  imagemin = require('gulp-imagemin');

const sassDirectory = 'dev/scss/**/*.scss';

gulp.task('clean', () => {
  return del.sync('dist');
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './dev'
    },
    ghostMode: false
  });
});

gulp.task('build-css', () => {
  return gulp.src(sassDirectory)
    .pipe(sass().on('error', sass.logError))
    .pipe(cssnano({
      zindex: false
    }))
    .pipe(gulp.dest('dev'))
    .pipe(browserSync.stream());
});

gulp.task('build-js', () => {
  return gulp.src('dev/index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});

gulp.task('bump-version', () => {
  gulp.src('manifest.json')
    .pipe(bump({ type: 'minor' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean-build', () => {
  del(['dist/assets/**']);
});

gulp.task('build-html', () => {
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

gulp.task('build-images', () => {
  return gulp.src('dev/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

gulp.task('build', (callback) => {
  runSequence('clean', 'build-css', 'build-js', 'build-html', 
    ['build-images', 'bump-version'],
    'clean-build',
    callback
  );
});

gulp.task('default', ['browser-sync', 'build-css'], () => {
  gulp.watch(sassDirectory, ['build-css']);
  gulp.watch('dev/*.html', browserSync.reload); 
  gulp.watch('dev/images/*', () => {
    runSequence('build-images', browserSync.reload);
  });
  gulp.watch('dev/js/**/*.js', browserSync.reload); 
});