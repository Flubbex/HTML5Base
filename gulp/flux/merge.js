var gulp        = require("gulp"),
    concat      = require("gulp-concat"),
    size        = require("gulp-filesize"),
    tap         = require("gulp-tap");

//merge all files in /dist/js to dist/bundle.js
gulp.task("merge", function()
{
    return gulp.src([config.path.dist_js+config.select.js])
    .pipe(tap(function(file){
      console.log("\t\t",
                  "Merging",
                  file.path.slice(file.path.lastIndexOf("/")+1))
    }))
    .pipe(concat(config.select.bundle))
    .pipe(size())
    .pipe(gulp.dest(config.path.dist))
});
