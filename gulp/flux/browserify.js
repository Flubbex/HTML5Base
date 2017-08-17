var gulp        = require("gulp"),
    browserify  = require("browserify"),
    rename      = require("gulp-rename"),
    tap         = require('gulp-tap'),
    util        = require("gulp-util"),
    size        = require("gulp-filesize");

//browserify source/index.js to dist/js/app.js
gulp.task("browserify",function(){
      return gulp.src(config.path.source+
                      config.select.index,{read:false})
      .pipe(tap(function(file){
        console.log("\t\t","browserifying",file.path.slice(
                                    file.path.lastIndexOf("/")+1))
        file.contents = browserify(file.path,config.browserify).bundle()
      }))
      .pipe(rename(config.select.app))
      .pipe(size())
      .pipe(gulp.dest(config.path.dist_js))
});
