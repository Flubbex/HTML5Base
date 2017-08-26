var gulp        = require("gulp"),
    jshint       = require("gulp-jshint"),
    util        = require("gulp-util");
//Lint /source
//TODO; write a JSON report to /docs
gulp.task('lint', function()
{
    var target = util.env.file ? config.path.source+util.env.file
                                  : [config.path.source+"**/**.js"]
                                    .concat(config.lint.blacklist);
    return gulp.src(target)
    .pipe(jshint(config.lint.jshint))
    .pipe(jshint.reporter("jshint-stylish",config.lint.stylish))
});
