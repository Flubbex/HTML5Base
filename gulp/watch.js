var gulp        = require("gulp"),
    util        = require("gulp-util"),
    watchify      = require("watchify");

//Copy /dist/bundle.js to release/APPNAME.js
gulp.task("watch", function()
{
    return gulp.src(config.path.dist+config.select.bundle)
    .pipe(watchify())
});
