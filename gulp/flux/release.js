var gulp        = require("gulp4"),
    util        = require("gulp-util"),
    rename      = require("gulp-rename");
    insert      = require('gulp-insert');

//Copy /dist/bundle.js to release/APPNAME.js
gulp.task("release", function()
{
    return gulp.src(config.path.dist+config.select.bundle)
    .pipe(rename(config.select.app_version))
    .pipe(insert.append('window.cachebuster = '+Date.now()+';'))
    .pipe(gulp.dest(config.path.release))
});
