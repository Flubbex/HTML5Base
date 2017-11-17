var gulp = require("gulp4");

gulp.task("printconfig",function(){
  console.log("Configured information:")
  console.log(JSON.stringify(config,null,2));
  return gulp.src(config.path.dist)
});
