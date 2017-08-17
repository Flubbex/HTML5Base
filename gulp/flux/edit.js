var gulp        = require("gulp"),
    util        = require("gulp-util"),
    shell       = require('gulp-shell');

//Open file in editor
gulp.task("edit", function()
{
  var target = util.env.file || ".";
  return gulp.src('*.js', {read: false})
  .pipe(shell([
    "atom "+target
  ]))
});
