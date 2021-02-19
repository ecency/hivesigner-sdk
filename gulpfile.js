var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
const pkg = require('./package.json');

const libraryName = pkg.name;

gulp.task("default", function () {
    return browserify({
        basedir: '.',
        entries: ['src/index.ts'],
        cache: {},
        standalone: libraryName,
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('hivesigner.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});
