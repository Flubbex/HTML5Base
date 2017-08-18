var gulp        = require("gulp"),
    jshint       = require("gulp-jshint"),
    util        = require("gulp-util");
//Lint /source
//TODO; write a JSON report to /docs
gulp.task('lint', function()
{
    var target = util.env.file ? config.path.source+util.env.file
                                  : [config.path.source+"**/**.js","!source/templates.js"];
    return gulp.src(target)
    .pipe(jshint({asi:true}))
    .pipe(jshint.reporter("jshint-stylish",{verbose:false}))
    .pipe(jshint.reporter("fail"))
});
