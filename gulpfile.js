import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpCssimport from 'gulp-cssimport';
import {deleteAsync} from 'del';

//tasks

export const html = () => gulp
  .src('src/*.html')
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream());

export const css = () => gulp
  // .src('src/css/index.css')
  .src('src/css/**/*.css')
  .pipe(gulpCssimport({
    extensions: ['css'],
  }))
  .pipe(gulp.dest('dist/css'))
  .pipe(browserSync.stream());

export const js = () => gulp
  // .src('src/**/*.js')
  .src('src/js/**/*.js')
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.stream());

export const copy = () => gulp
  .src([
    './src/fonts/**/*',
    './src/img/**/*.{svg,jpg,jpeg,png,gif}',
  ], {
    base: 'src',
  })
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream({
    once: true,
  }));

export const server = () => {
  browserSync.init({
    ui: false,
    notify: false,
    // tunnel: true,
    server: {
      baseDir: 'dist'
    }
  })
  gulp.watch('./src/**/*.html', html);
  gulp.watch('./src/css/**/*.css', css);
  gulp.watch('./src/js/**/*.js', js);
  gulp.watch([
    './src/fonts/**/*',
    './src/img/**/*.{svg,jpg,jpeg,png,gif}',
  ], copy);
};

export const clear = () => deleteAsync('dist/**/*', {force: true,});

// launcher
export const base = gulp.parallel(html, css, js, copy);
export const build = gulp.series(clear, base);
export default gulp.series(base, server);