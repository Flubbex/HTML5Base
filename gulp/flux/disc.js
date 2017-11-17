var gulp        = require("gulp4"),
    tap         = require("gulp-tap"),
    disc        = require("disc");
    //buffer      = require("gulp-buffer");

//Generate disc chart to docs/content/disc
gulp.task("disc",function(){
      return gulp.src([config.path.dist_js+
                      config.select.app])
      
      .pipe(disc())
});
