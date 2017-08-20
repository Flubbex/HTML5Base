var gulp        = require("gulp"),
    util        = require("gulp-util"),
    shell       = require('gulp-shell');
    dom         = require('jsdom-global');

//Runs code as local node module but with a DOM
gulp.task("run", function()
{
  dom();
  var target = "../../source/"+(util.env.file|| "index.js");
  require(target);

  return gulp.src('*.js', {read: false})
});
