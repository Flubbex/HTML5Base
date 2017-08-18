var gulp        = require("gulp"),
    uglify      = require("gulp-uglify"),
    tap         = require("gulp-tap"),
    size    = require("gulp-filesize");

//Uglify bundled code
gulp.task("compress",function(){
    return gulp.src(config.path.dist+config.select.bundle)
    .pipe(size())
    .pipe(tap(function(file){
      console.log("\t\t","Compressing",file.path.slice(
                                  file.path.lastIndexOf("/")+1))
    }))
    .pipe(uglify())
    .pipe(gulp.dest(config.path.dist))
    .pipe(size())
});
