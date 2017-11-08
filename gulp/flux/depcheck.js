var gulp = require("gulp4"),
  util = require("gulp-util"),
  tap = require("gulp-tap"),
  depcheck = require('depcheck');
  options = {
  withoutDev: false, // [DEPRECATED] check against devDependencies
  ignoreBinPackage: false, // ignore the packages with bin entry
  ignoreDirs: [ // folder with these names will be ignored
    'sandbox',
    'dist',
    'bower_components'
  ],
  ignoreMatches: [ // ignore dependencies that matches these globs
    'grunt-*'
  ],
  parsers: { // the target parsers
    '*.js': depcheck.parser.es6,
    '*.jsx': depcheck.parser.jsx
  },
  detectors: [ // the target detectors
    depcheck.detector.requireCallExpression,
    depcheck.detector.importDeclaration
  ],
  specials: [ // the target special parsers
    depcheck.special.eslint,
    depcheck.special.webpack
  ],
};

//Check for unused dependencies
gulp.task("depcheck", function() {
  var target = __dirname + "/../..";
  console.log(target)
  depcheck(target, options, function(unused) {
    {
      console.log("--UNUSED DEPENDENCIES--")
      console.log(unused.dependencies || "none"); // an array containing the unused dependencies

      console.log("--UNUSED DEV DEPENDENCIES--")
      console.log(unused.devDependencies.join("\n") || "none"); // an array containing the unused devDependencies

      console.log("--MISSING DEPENDENCIES--")
      console.log(unused.missing || "none"); // a lookup containing the dependencies missing in `package.json` and where they are used

      console.log("--USED DEPENDENCIES--")
      console.log(unused.using || "none"); // a lookup indicating each dependency is used by which files

      console.log("--INVALID FILES--")
      console.log(unused.invalidFiles || "none"); // files that cannot access or parse

      console.log("--INVALID DIRECTORIES--")
      console.log(unused.invalidDirs); // directories that cannot access

    }
  })
  return gulp.src("*.js", {
      read: false
    })
    .pipe(gulp.dest('.'));
});
