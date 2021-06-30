let preprocessor = "sass";

const { src, dest, parallel, series, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const rigger = require("gulp-rigger");
const htmlmin = require("gulp-htmlmin");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const importify = require("gulp-importify");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cleancss = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const del = require("del");

const buildPath = {
  html: "dist/",
  js: "dist/js/",
  css: "dist/css/",
  image: "dist/images",
};

function browsersync() {
  browserSync.init({
    server: { baseDir: "dist/" },
    notify: true,
    online: true,
  });
}

function html() {
  return src("app/*.html")
    .pipe(rigger())
    .pipe(htmlmin())
    .pipe(dest(buildPath.html))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
    "app/blocks/**/*.js",
  ])
    .pipe(concat("app.min.js"))
    .pipe(uglify())
    .pipe(dest(buildPath.js))
    .pipe(browserSync.stream());
}

function styles() {
  return src(
    [
      "node_modules/normalize-scss/sass/_normalize.scss",
      "app/blocks/global/variables.scss",
      "app/blocks/**/*.scss",
    ],
    { base: process.cwd() }
  )
    .pipe(
      importify("*.scss", {
        cssPreproc: "scss",
      })
    )
    .pipe(eval(preprocessor)())
    .pipe(concat("app.min.css"))
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 10 versions"], grid: true })
    )
    .pipe(
      cleancss({
        level: { 1: { specialComments: 0 } } /* , format: 'beautify' */,
      })
    )
    .pipe(dest(buildPath.css))
    .pipe(browserSync.stream());
}

function images() {
  return src("app/images/**/*")
    .pipe(newer(buildPath.images))
    .pipe(imagemin())
    .pipe(dest(buildPath.images));
}

function cleanimg() {
  return del(`${buildPath.images}/**/*`, { force: true });
}

function cleandist() {
  return del("dist/**/*", { force: true });
}

function startwatch() {
  watch(["app/blocks/**/*.js"], scripts);
  watch(["app/blocks/**/*.scss"], styles);
  watch("app/**/*.html").on("change", browserSync.reload);
  watch("app/images/**/*", images);
}

exports.browsersync = browsersync;
exports.html = html;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;

exports.build = series(cleandist, html, styles, scripts, images);

exports.default = parallel(html, styles, scripts, browsersync, startwatch);
