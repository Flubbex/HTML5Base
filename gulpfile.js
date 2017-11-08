//Config for gulp
config            = require("./config/gulp");

//Dependencies
var gulp          = require("gulp4"),
    util          = require("gulp-util");

//Include every file in /gulp
require("require-all")({
  dirname: __dirname+"/gulp"
});

/* Load tasks series from config */
for (var name in config.series)
{
  gulp.task(name,gulp.series(config.series[name]))
}
