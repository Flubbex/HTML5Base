var gulp        = require("gulp"),
    util        = require("gulp-util"),
    shell       = require('gulp-shell');

//Run shell command
gulp.task("shell", function()
{
  var target = util.env.cmd || ".";
  return gulp.src('*.js', {read: false})
  .pipe(shell([
    target
  ]))
});
