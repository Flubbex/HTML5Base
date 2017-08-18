var gulp        = require("gulp"),
    util        = require("gulp-util"),
    depcheck    = require('depcheck');

//Open file in editor
gulp.task("depcheck", function()
{
  var target = util.env.target || config.path.source;
  return gulp.src('*.js', {read: false})
  .pipe(depcheck(target));
});
