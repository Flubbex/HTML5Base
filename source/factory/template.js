var handlebars = require("handlebars/runtime"),
    layouts    = require("handlebars-layouts"),
    _templates = require("../template");

module.exports = function(container){
    //Instantiate templates by injecting handlebars
    var templates = _templates(handlebars);

    //Register layouts helper
    handlebars.registerHelper(layouts(handlebars));

    //Register layout partial
    handlebars.registerPartial('layout', templates['layout']);

    //return templates;
    return templates;
}
