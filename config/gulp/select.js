var app = require("../app");

module.exports = {
    all:    "**/*",
    js:     "*.js",
    css:    "*.css",
    scss:   "*.scss",
    hbs:    "*.hbs",
    index:  "index.js",
    bundle: "bundle.js",
    app:    app.about.filename+".js",
    app_version:  app.about.filename+"_"+app.about.version+".js",
    bulma_scss: "bulma.sass",
    bulma_css:  "bulma.css"
}
