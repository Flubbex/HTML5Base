module.exports["layout"] = fluxbuild.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "";
},"3":function(container,depth0,helpers,partials,data) {
    return "    Content\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "<header class=\"container--wrap\">\n    <h1 class=\"m--1 g--4 g-s--11 docsHeader\">"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h1>\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"header",{"name":"block","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</header>\n  <div class=\"g--10 m--1\">\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"page",{"name":"block","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n</div>\n";
},"useData":true});
module.exports["sidebar"] = fluxbuild.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "      <a href=\"#"
    + alias2(alias1((depth0 != null ? depth0.address : depth0), depth0))
    + "\">"
    + alias2(alias1((depth0 != null ? depth0.title : depth0), depth0))
    + "</a>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "<div class=\"g--12 logo-area no-margin-vertical\">\n    <h4 class=\"color--pink no-margin-vertical\">"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h5>\n  </div>\n  <nav class=\"g--12 no-margin-vertical\" role=\"navigation\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.page : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </nav>\n";
},"useData":true});
module.exports["page"] = module.exports["page"] || {};
module.exports["page"]["about"] = fluxbuild.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "      <div class=\"g--10 m--1\">\n            <h2 class=\"fade-in-from-top color--pink\">About</h2>\n      </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "      <h2>Author</h2>\n      Fluxbuild is written by <a href=\"https://github.com/Flubbex\">Flubbex.</a>\n\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
module.exports["page"] = module.exports["page"] || {};
module.exports["page"]["documentation"] = fluxbuild.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1\">\n          <h2 class=\"fade-in-from-top color--pink\">Documentation</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "\n      <h2>Backbone</h2>\n      <ul>\n        <li><a href=\"http://backbonejs.org/\">Official website (With documentation)</a></li>\n      </ul>\n\n      <h2>documentation.js</h2>\n      <ul>\n        <li><a href=\"http://documentation.js.org/\">official website</a></li>\n        <li><a href=\"https://github.com/documentationjs/documentation/blob/master/docs/GETTING_STARTED.md\">Documentation / Starters Guide</a></li>\n      </ul>\n\n      <h2>Gulp</h2>\n      <ul>\n        <li><a href=\"http://gulpjs.com/\">Official website</a></li>\n        <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs\">Documentation (Github)</a></li>\n        <li><a href=\"http://gulpjs.org/recipes/\">Recipes (Gulp.js)</a></li>\n        <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs/recipes\">Recipes (Github)</a></li>\n      </ul>\n\n      <h2>Handlebars</h2>\n      <ul>\n        <li><a href=\"http://handlebarsjs.com/\">Official website (With documentation)</a></li>\n      </ul>\n\n      <h2>Mocha</h2>\n      <ul>\n        <li><a href=\"https://mochajs.org/\">Official website</a></li>\n        <li><a href=\"https://mochajl.readthedocs.io/en/latest/\">Documentation</a></li>\n      </ul>\n\n      <h2>Surface CSS</h2>\n      <ul>\n        <li><a href=\"http://mildrenben.github.io/surface/\">Official website (With documentation)</a></li>\n      </ul>\n\n      <h2>Most important gulp plugins</h2>\n      <ul>\n        <ul><a href=\"https://www.npmjs.com/package/gulp-concat\">\n          gulp-concat\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-declare\">\n          gulp-declare\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-documentation\">\n          gulp-documentation\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-handlebars\">\n          gulp-handlebars\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-hub\">\n          gulp-hub\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-jshint\">\n          gulp-jshint\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-open\">\n          gulp-open\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-tap\">\n          gulp-tap\n        </a></li>\n        <li><a href=\"https://www.npmjs.com/package/gulp-uglify\">\n          gulp-uglify\n        </a></li>\n      </ul>\n\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
module.exports["page"] = module.exports["page"] || {};
module.exports["page"]["home"] = fluxbuild.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1\" style=\"margin:0;margin-left: 25px;text-align:center;\">\n          <h3 class=\"fade-in-from-top color--pink\">Make it go faster</h3>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Gulp 4</h2>\n      <p class=\"card\">\n        gulp is a toolkit for automating painful or time-consuming tasks in your development workflow, so you can stop messing around and build something.\n      </p>\n\n    <h2>Browserify</h2>\n    <p class=\"card\">\n      Browsers don't have the require method defined, but Node.js does. With Browserify you can write code that uses require in the same way that you would use it in Node.\n    </p>\n\n    <h2>Backbone</h2>\n    <p class=\"card\">\n      Backbone.js gives structure to web applications by providing models with key-value binding and custom events, collections with a rich API of enumerable functions, views with declarative event handling, and connects it all to your existing API over a RESTful JSON interface.\n    </p>\n\n    <h2>Handlebars</h2>\n    <p class=\"card\">\n      Handlebars provides the power necessary to let you build semantic templates effectively with no frustration.\n    </p>\n\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});