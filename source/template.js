module.exports = function (Handlebars){var container = {}; container["layout"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "";
},"3":function(container,depth0,helpers,partials,data) {
    return "    Content\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "<header class=\"container--wrap no-margin-vertical\">\n    <h1 class=\"m--1 g--12 no-margin-vertical\">\n      "
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n    </h1>\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"header",{"name":"block","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</header>\n  <div class=\"g--10 m--1\">\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"page",{"name":"block","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n</div>\n";
},"useData":true});
container["sidebar"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"logo-area no-margin-vertical fade-in-from-top\">\n  <img class=\"g--2 no-margin-vertical\" src=\"images/logo.png\">\n  <h4 class=\"g--6 m--1 no-margin-vertical\">"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data}) : helper)))
    + "</h4>\n</div>\n<nav class=\"g--12 no-margin-vertical fade-in-from-left\"\n     role=\"navigation\">\n\n  <a href=\"#home\">\n    Home\n    <i class=\"fa fa-home fa-2x right\" aria-hidden=\"true\"></i>\n  </a>\n\n  <div class=\"nav-collapsible no-margin-vertical\">\n    <input type=\"checkbox\" id=\"nav-documentation\">\n    <label for=\"nav-documentation\">\n        Documentation\n        <i class='fa fa-info fa-2x right'></i>\n      </label>\n    <div class=\"nav-collapsible-links\">\n      <a href=\"#structure\">Project Structure</a>\n      <a href=\"#workflow\">Workflow</a>\n      <a href=\"#gulp\">Gulp Tasks</a>\n      <a href=\"#documentation\">Generating Documentation</a>\n      <a href=\"#handlebars\">Handlebars Reference</a>\n      <a href=\"#surface\">Surface CSS Reference</a>\n      <a href=\"#external\">External Information</a>\n    </div>\n  </div>\n\n  <a href=\"#about\">\n    About\n    <i class='fa fa-user fa-2x right'></i>\n  </a>\n</nav>\n";
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["about"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "      <div class=\"g--10 m--1 no-margin\">\n            <h2 class=\"m--1 color--paper fade-in-from-top\">About</h2>\n      </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"card\">\n      <h2>Author</h2>\n      <p>\n        Fluxbuild is written by <a href=\"https://github.com/Flubbex\">Flubbex.</a>\n      </p>\n    </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["documentation"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Generating Documentation</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["external"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">External Information</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"container container--wrap\">\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Backbone</h2>\n        <ul>\n          <li><a href=\"http://backbonejs.org/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>doc.js</h2>\n        <ul>\n          <li><a href=\"http://documentation.js.org/\">official website</a></li>\n          <li><a href=\"https://github.com/documentationjs/documentation/blob/master/docs/GETTING_STARTED.md\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>scaleApp</h2>\n        <ul>\n          <li><a href=\"http://scaleapp.org/\">official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12 g--3 g-m--4 g-t--12\">\n        <h2>Zest</h2>\n        <ul>\n          <li><a href=\"https://github.com/chjj/zest\">Github</a></li>\n          <li><a href=\"https://www.npmjs.com/package/zest\">NPM Package</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Browserify</h2>\n        <ul>\n          <li><a href=\"http://browserify.org/\">Official Site</a></li>\n          <li><a href=\"https://github.com/substack/node-browserify#usage\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Atom.js</h2>\n        <ul>\n          <li><a href=\"https://www.npmjs.com/package/atom-js\">NPM Package</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Gulp</h2>\n        <ul>\n          <li><a href=\"http://gulpjs.com/\">Official website</a></li>\n          <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs\">Documentation (Github)</a></li>\n          <li><a href=\"http://gulpjs.org/recipes/\">Recipes (Gulp.js)</a></li>\n          <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs/recipes\">Recipes (Github)</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Handlebars</h2>\n        <ul>\n          <li><a href=\"http://handlebarsjs.com/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Mocha</h2>\n        <ul>\n          <li><a href=\"https://mochajs.org/\">Official website</a></li>\n          <li><a href=\"https://mochajl.readthedocs.io/en/latest/\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Surface CSS</h2>\n        <ul>\n          <li><a href=\"http://mildrenben.github.io/surface/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Gulp Plugins</h2>\n        <ul>\n          <a href=\"https://www.npmjs.com/package/gulp-concat\">\n          gulp-concat\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-declare\">\n          gulp-declare\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-documentation\">\n          gulp-documentation\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-handlebars\">\n          gulp-handlebars\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-hub\">\n          gulp-hub\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-jshint\">\n          gulp-jshint\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-open\">\n          gulp-open\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-tap\">\n          gulp-tap\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-uglify\">\n          gulp-uglify\n        </a></li>\n        </ul>\n      </div>\n    </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["gulp"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Gulp Tasks</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["handlebars"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Handlebars Reference</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["home"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n\n      <h2 class=\"m--2 color--paper fade-in-from-top anim-delay--5\">\n        Ember-inspired build tool written in Node.js\n        <span class=\"fade-in-from-top anim-delay--10\">\n          for creating fast,\n          <span class=\"fade-in-from-top anim-delay--15\">lightweight,</span>\n          <span class=\"fade-in-from-top anim-delay--20\">uncoupled,</span>\n          <span class=\"fade-in-from-top anim-delay--25\">full-scale applications - </span>\n          <span class=\"fade-in-from-top anim-delay--35\">that work anywhere </span>\n        </span>\n      </h2>\n      <div class=\"right no-margin color--white\">\n        <i class=\"fade-in-from-bottom anim-delay--30 fa fa-server fa-3x\" aria-hidden=\"true\"></i>\n        <i class=\"fade-in-from-bottom anim-delay--35 fa fa-laptop fa-3x\" aria-hidden=\"true\"></i>\n        <i class=\"fade-in-from-bottom anim-delay--40 fa fa-mobile fa-3x\" aria-hidden=\"true\"></i>\n      </div>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"container container--wrap no-margin\">\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>Gulp 4</h2>\n        <p>\n          gulp is a toolkit for automating painful or time-consuming tasks in your development workflow, so you can stop messing around and build something.\n          <p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>Browserify</h2>\n        <p>\n          Browsers don't have the require method defined, but Node.js does. With Browserify you can write code that uses require in the same way that you would use it in Node.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>scaleApp</h2>\n        <p>\n          scaleApp is a tiny JavaScript framework for scalable and maintainable One-Page-Applications / Single-Page-Applications. The framework allows you to easily create complex web applications.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>Backbone</h2>\n        <p>\n          Backbone.js gives structure to web applications by providing models with key-value binding and custom events, collections with a rich API of enumerable functions, views with declarative event handling, and connects it all to your existing API over a RESTful\n          JSON interface.\n        </p>\n      </div>\n\n\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>Zest</h2>\n\n        <p>\n          zest is a fast, lightweight, and extensible CSS selector engine. Zest was designed to be very concise while still supporting CSS3/CSS4 selectors and remaining fast.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>Handlebars</h2>\n        <p>\n          Handlebars provides the power necessary to let you build semantic templates effectively with no frustration.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>Atom.js</h2>\n        <p>\n          Atom.js is a small, easy to use JavaScript class that provides asynchronous control flow, event/property listeners, barriers, and more.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--6 g-t--12\">\n        <h2>Surface CSS</h2>\n        <p>\n          Design philosophy and aesthetics inspired by Google's Material Design.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--12\" style=\"text-align:center;\">\n        <h2>Fluxbuild</h2>\n        <p>\n          Build blazingly-fast applications using all of the above, with premade gulp tasks for automated testing, documentation,templating and more. Configurable to fit your favorite workflow without getting in your way. Preloaded with everything you need to start\n          building application of any scale.\n        </p>\n      </div>\n\n    </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["structure"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Project Structure</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["surface"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Surface CSS Reference</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["page"] = container["page"] || {};
container["page"]["workflow"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Workflow</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});; return container;}