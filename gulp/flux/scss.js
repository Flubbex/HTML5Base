var gulp        = require("gulp4"),
    sass        = require("gulp-sass"),
    size        = require("gulp-filesize"),
    rename      = require("gulp-rename"),
    cleanCSS    = require("gulp-clean-css");

//Build SCSS to dist/css
gulp.task('build_scss', function(){
	return gulp.src(config.path.scss+config.select.bulma_scss)
	.pipe(sass({
		errLogToConsole: true
	}))
  .pipe(rename(config.select.bulma_css))
  .pipe(gulp.dest(config.path.dist_css))
});


//Minify dist/css and publish to docs/css
gulp.task('scss',gulp.series('build_scss',function(){
  return gulp.src(config.path.dist_css+config.select.bulma_css)
  .pipe(size())
  .pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(size())
	.pipe(gulp.dest(config.path.doc_css))
}))
