/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const {
  lint,
  test,
  add,
  docs,
} = require('@bananabread/local');

gulp.task('lint', lint);
gulp.task('test', test);
gulp.task('add', add);
gulp.task('docs', docs);
