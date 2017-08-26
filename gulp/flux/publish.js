var gulp        = require("gulp"),
    rename      = require("gulp-rename"),
    util        = require("gulp-util");

//Copy /rel/APPNAME_VER.js to docs/js/APPNAME.js
gulp.task("publish", function()
{
    return gulp.src(config.path.release+config.select.app_version)
    .pipe(rename(config.select.app))
    .pipe(gulp.dest(config.path.doc_js))
});
