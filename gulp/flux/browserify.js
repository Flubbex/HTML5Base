var gulp        = require("gulp"),
    browserify  = require("browserify"),
    fs          = require("fs"),
    rename      = require("gulp-rename"),
    tap         = require('gulp-tap'),
    util        = require("gulp-util"),
    disc        = require("disc"),
    size        = require("gulp-filesize");

//browserify source/index.js to dist/js/app.js
gulp.task("browserify",function(){
      return gulp.src(config.path.source+
                      config.select.index,{read:false})
      .pipe(tap(function(file){
        console.log("\t\t","browserifying",file.path.slice(
                                    file.path.lastIndexOf("/")+1))
        file.contents = browserify(file.path,config.browserify)
                                  .bundle();
      }))
      .pipe(tap(function(file){
        file
        .pipe(disc())
        .pipe(fs.createWriteStream(config.path.doc_disc+"index.html"))
      }))
      .pipe(rename(config.select.app))
      .pipe(gulp.dest(config.path.dist_js))
      .pipe(size())
});
