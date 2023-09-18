import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpCssimport from 'gulp-cssimport';
import { deleteAsync } from 'del';
import * as sassPkg from 'sass';
import gulpSass from 'gulp-sass';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import terser from 'gulp-terser';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import gulpImg from 'gulp-image';
import gulpWebp from 'gulp-webp';
import gulpAvif from 'gulp-avif';
import { stream as critical } from 'critical';
import gulpif from 'gulp-if';

const preProcessUse = true;
let dev = false;
const sass = gulpSass(sassPkg);
const allJsLibs = [
  'src/libs/jquery-3.7.0.min.js',
];
//tasks
export const html = () => gulp
  .src('src/*.html')
  .pipe(htmlmin({
    removeComments: true,
    collapseWhitespace: true,
  }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream());

export const style = () => {
  if (preProcessUse) {
    return gulp
      .src('src/scss/**/*.scss')
      .pipe(gulpif(dev, sourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCSS({
        2: {
          specialComments: 0,
        },
      }))
      .pipe(gulpif(dev, sourcemaps.write('../maps')))
      .pipe(gulp.dest('dist/css'))
      .pipe(browserSync.stream());
  } else {
    return gulp
      .src('src/css/**/*.css')
      .pipe(gulpif(dev, sourcemaps.init()))
      .pipe(gulpCssimport({
        extensions: ['css'],
      }))
      .pipe(cleanCSS({
        2: {
          specialComments: 0,
        },
      }))
      .pipe(gulpif(dev, sourcemaps.write('../maps')))
      .pipe(gulp.dest('dist/css'))
      .pipe(browserSync.stream());
  }
}

export const js = () => gulp
  .src([...allJsLibs, 'src/js/**/*.js'])
  .pipe(gulpif(dev, sourcemaps.init()))
  .pipe(terser())
  .pipe(concat('index.min.js'))
  .pipe(gulpif(dev, sourcemaps.write('../maps')))
  .pipe(gulp.dest('dist/js'))
  .pipe(browserSync.stream());

export const img = () => gulp
  .src('src/img/**/*.{jpg,jpeg,png,gif,svg}')
  .pipe(gulpif(!dev, gulpImg({
    optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
    pngquant: ['--speed=1', '--force', 256],
    zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
    jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
    mozjpeg: ['-optimize', '-progressive'],
    gifsicle: ['--optimize'],
    svgo: true,
  })))
  .pipe(gulp.dest('dist/img'))
  .pipe(browserSync.stream({
    once: true,
  }));


export const webp = () => gulp
  .src('src/img/**/*.{jpg,jpeg,png}')
  .pipe(gulpWebp({
    quality: 70,
  }))
  .pipe(gulp.dest('dist/img'))
  .pipe(browserSync.stream({
    once: true,
  }));

export const avif = () => gulp
  .src('src/img/**/*.{jpg,jpeg,png}')
  .pipe(gulpAvif({
    quality: 60,
  }))
  .pipe(gulp.dest('dist/img'))
  .pipe(browserSync.stream({
    once: true,
  }));

export const critCSS = () => gulp
  .src('dist/*.html')
  .pipe(critical({
    base: 'dist/',
    inline: true,
    css: ['dist/css/index.css',] // 'dist/css/bootstrap.css' can be added later
  }))
  .on('error', err => {
    console.error(err.message)
  })
  .pipe(gulp.dest('dist'))

export const copy = () => gulp
  .src('src/fonts/**/*', {
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
    },
    browser: ['vivaldi',],
  })
  gulp.watch('src/**/*.html', html);
  gulp.watch(preProcessUse ? 'src/scss/**/*.scss' : 'src/css/**/*.ccss', style);
  gulp.watch('src/img/**/*.{jpg,jpeg,png,gif,svg}', img);
  gulp.watch('src/js/**/*.js', js);
  gulp.watch('src/fonts/**/*', copy);
  gulp.watch('src/img/**/*.{jpg,jpeg,png}', webp);
  gulp.watch('src/img/**/*.{jpg,jpeg,png}', avif);
};

export const clear = () => deleteAsync('dist/**/*', { force: true, });

// launcher
export const develop = async() => {
 dev = true;
};
export const base = gulp.parallel(html, style, js, img, avif, webp, copy);
export const build = gulp.series(clear, base, critCSS);
export default gulp.series(develop, base, server);
