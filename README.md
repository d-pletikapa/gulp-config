## installation
### gulp cli:
```shell
npm install --global gulp-cli
```
### gulp global:
```shell
npm i gulp -g
```
### gulp local:
```shell
npm i gulp -D
```

## Tweaks
### add file .gitignore:
```
/node_modules/
```
#### optional (if you do not use githubpages)
```
/dist/
```
### add file gulpfile.js:

<details>
<summary>длинный код</summary>

```js
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


```

</details>

### run gulp (export default):
```shell
gulp
```
## Plugins
### gulp server of choice (browser-sync):
```shell
npm install -g browser-sync
```
or locally
```shell
npm install -D browser-sync
```
### gulp-cssimport (add support for imports):
[gulp-cssimport - npm (npmjs.com)](https://www.npmjs.com/package/gulp-cssimport)

```shell
npm install -D gulp-cssimport
```
### del
```shell
npm i del -D
```
### integration SCSS in GULP:
```shell
npm i gulp-sass sass -D
```
## Minification of loading resourses
### download all remote js / css
#### move them into subfolders 
+ folder *componetns* - for parts of the project in corresponding directory (scss folder) src/scss/components.
+ folder *libs* - for external min js code in src/libs (such as swiper-min.js located in root project to avoid double minification) or src/scss/libs for min css (for example bootstrap library).
### minify html
```shell
npm i gulp-htmlmin -D
```
### minify css and scss
```shell
npm i gulp-clean-css -D
```

### minify js for files out of libs folder
```shell
npm i gulp-terser -D
```
#### gulpfile.js :
`add libs to concat:
```js
const allJsLibs = [
  'src/libs/jquery-3.7.0.min.js',
  'src/libs/2.js',
  'src/libs/3.js',
];
```

```shell
npm i gulp-concat -D
```

### add source maps after minification
```shell
npm i gulp-sourcemaps -D
```

### Сервисы для оптимизация изображений

**Оптимизация изображений вручную**

+ [SVG OMG](https://jakearchibald.github.io/svgomg/)
+ [Tinypng](https://tinypng.com/)
+ [Squoosh](https://squoosh.app/)

**Оптимизация изображений gulp**

+ [Tinypng - оптимизация 500 изображений в месяц](https://www.npmjs.com/package/gulp-tinypng-compress)
+ [gulp-image](https://www.npmjs.com/package/gulp-image)   `npm i -D gulp-image`
+ [gulp-webp](https://www.npmjs.com/package/gulp-webp)   `npm i -D gulp-webp
+ [gulp-avif](https://www.npmjs.com/package/gulp-avif) `npm i -D gulp-avif

```html
<picture>
<source srcset="./img/__img-main/product-1.avif" type="image/avif">
<source srcset="./img/__img-main/product-1.webp" type="image/webp">
<img loading="lazy" src="./img/__img-main/product-1.jpg" alt="" width="190" height="54">
</picture>
```

```scss
    background-image: -webkit-image-set(
	  url("../img/__img-main/main-banner@2x.avif") 2x,
      url("../img/__img-main/main-banner.avif") 1x,
      url("../img/__img-main/main-banner@2x.webp") 2x,
      url("../img/__img-main/main-banner.webp") 1x,
      url("../img/__img-main/main-banner.jpg") 1x
    );
    background-image: image-set(
	  url("../img/__img-main/main-banner@2x.avif") 2x,
      url("../img/__img-main/main-banner.avif") 1x,
      url("../img/__img-main/main-banner@2x.webp") 2x,
      url("../img/__img-main/main-banner.webp") 1x,
      url("../img/__img-main/main-banner.jpg") 1x
    );
```
**mobile**
```html
<picture>
<source media="(max-width: 460px)" srcset="./img/__img-main/product-1.avif" type="image/avif">
<source media="(max-width: 460px)" srcset="./img/__img-main/product-1.webp" type="image/webp">
<source media="(max-width: 460px)" srcset="./img/__img-main/product-1.jpg">

<source srcset="./img/__img-main/product-1.avif" type="image/avif">
<source srcset="./img/__img-main/product-1.webp" type="image/webp">
<img loading="lazy" src="./img/__img-main/product-1.jpg" alt="" width="190" height="54">
</picture>
```
### Critical styles
#### plugin "critical"

```shell
npm i critical -D
```

**in index. html remove styles and add them through script :**

```html
  <!-- <link rel="stylesheet" href="./css/index.css"> -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const createLink = (url) => {
        document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.append(link);
      }
      createLink('css/index.css');
    });
  </script>
```

#### plugin "gulp-if"

```shell
npm i gulp-if -D
```
