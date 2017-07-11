var gulp        = require("gulp"),
    document      = require("gulp-documentation");

//Generate documentation from /source to /docs/content
gulp.task("document", function()
{
    return gulp.src(config.path.source+config.select.js)
    .pipe(document('html'))
    .pipe(gulp.dest(config.path.doc_content))
});
