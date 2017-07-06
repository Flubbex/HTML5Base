var gulp      = require("gulp"),
    util      = require("gulp-util"),
    open      = require("gulp-open");

//opens file in system default editor or viewer
gulp.task("open", function()
{
    util.env.target = util.env.target ||
                      config.path.doc+"index.html";

    return gulp.src(util.env.target)
      .pipe(open())
});
