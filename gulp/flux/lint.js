var gulp        = require("gulp"),
    jshint       = require("gulp-jshint"),
    util        = require("gulp-util");
//Lint /source
//TODO; write a JSON report to /docs
gulp.task('lint', function()
{
    return gulp.src(config.path.source+(util.env.file||config.select.all))
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish",{verbose:true}))
    .pipe(jshint.reporter("fail"))
});
