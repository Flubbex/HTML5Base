var gulp        = require("gulp"),
    util        = require("gulp-util");

//Copy /rel/APPNAME.js to docs/js/APPNAME.js
gulp.task("publish", function()
{
    return gulp.src(config.path.release+config.select.app)
    .pipe(gulp.dest(config.path.doc_js))
});
