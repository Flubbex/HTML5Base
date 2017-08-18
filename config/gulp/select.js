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
    surface_scss:  "surface_styles.scss",
    surface_css:  "surface_styles.css"
}
