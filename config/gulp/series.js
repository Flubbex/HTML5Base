module.exports = {
  default:    ["browserify","merge","release","publish"],
  minified:   ["browserify","merge","compress","release","publish"],
  regen:      ["handlebars","default"],
  regen_min:  ["handlebars","minified"],
  init:       ["clean","scss","regen"]
}
