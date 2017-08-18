module.exports = {
  default:    ["browserify","merge","release","publish"],
  init:       ["scss","default"],
  minified:   ["browserify","merge","compress","release","publish"],
  regen:      ["handlebars","default"],
  regen_min:  ["handlebars","minified"],
  build_run:  ["default","run"],
  build_test: ["default","test"]
}
