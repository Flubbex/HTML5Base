var gulp        = require("gulp4"),
    util        = require("gulp-util"),
    mocha      = require("gulp-mocha");

//Copy /dist/bundle.js to release/APPNAME.js
gulp.task("test", function()
{
    return gulp.src(config.path.test+config.select.index)
    .pipe(mocha())
});
