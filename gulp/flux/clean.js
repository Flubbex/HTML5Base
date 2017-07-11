var gulp        = require("gulp"),
    del         = require("del");

//Clean things
gulp.task("clean", function()
{
  if (config.verbal && !config.silent)
      gutil.log('Cleaning',
            JSON.stringify(config.clean,null,2),
            gutil.colors.magenta('123'));

    return del(config.clean);
});
