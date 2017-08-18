var gulp                = require("gulp"),
    handlebars          = require("handlebars"),
    gulp_handlebars     = require('gulp-handlebars'),
    wrap                = require("gulp-wrap"),
    declare             = require("gulp-declare"),
    concat              = require("gulp-concat"),
    size                = require("gulp-filesize");

//Build templates to source
gulp.task('handlebars', function()
{
  return gulp.src(config.path.source_template+"**/*")
    .pipe(gulp_handlebars(Object.assign(config.handlebars,{handlebars:handlebars})))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare(Object.assign(config.handlebars.declare,{
      processName: function(e){
        var name = e.slice(e.lastIndexOf(config.path.source_template)+
                                    config.path.source_template.length)
                            .split(".")
                            .reverse()
                            .pop()
                            .replace("/",".")
        console.log("\t\t","Compiling",name)
        return name;
        }
        })))
    .pipe(concat('templates.js'))
    .pipe(wrap("module.exports = function (Handlebars){var container = {}; <%= contents %>; return container;}"))
    .pipe(size())
    .pipe(gulp.dest(config.path.source))

});
