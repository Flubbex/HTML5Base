module.exports = {
  default:    ["browserify","merge","release","publish"],
  init:       ["scss","default"],
  minified:   ["browserify","merge","compress","release","publish"],
  regen:      ["handlebars","default"],
  regen_min:  ["handlebars","minified"]
}
