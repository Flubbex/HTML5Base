(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/flubber/projects/js/fluxbuild/config/app/about.js":[function(require,module,exports){
module.exports = {
  name:       "Fluxbuild",
  filename:   "fluxbuild",
  version:    "1.0.0"
}

},{}],"/home/flubber/projects/js/fluxbuild/config/app/core.js":[function(require,module,exports){
module.exports = {
  
}

},{}],"/home/flubber/projects/js/fluxbuild/config/app/index.js":[function(require,module,exports){
module.exports = {
  about:      require("./about"),
  module:     require("./module"),
  core:       require("./core")
}

},{"./about":"/home/flubber/projects/js/fluxbuild/config/app/about.js","./core":"/home/flubber/projects/js/fluxbuild/config/app/core.js","./module":"/home/flubber/projects/js/fluxbuild/config/app/module.js"}],"/home/flubber/projects/js/fluxbuild/config/app/module.js":[function(require,module,exports){
arguments[4]["/home/flubber/projects/js/fluxbuild/config/app/core.js"][0].apply(exports,arguments)
},{}],"/home/flubber/projects/js/fluxbuild/lib/fluxbottle/index.js":[function(require,module,exports){
var perfnow   = require("util/perfnow");
console.log("Fluxbottle @ ",new Date().toString().slice(16, 24),"[~"+perfnow()+"ms]");

var Bottle = require("bottlejs");

/**
  Used internally to instantiate an application using provided arguments and returns it.
 *
   @param {object} application The object on which to call the function.
   @param {object} config Configuration file
   @param {object} include Hashmap of includables ( libraries e.g. ).
   @param {object} modules Hashmap of modules.
   @returns {object} An instantiated application
*/
function initialize(app,config,content) {
  var bottle = Bottle(config.about.filename);
  var dependencies = [];

  Object.keys(content).map(function(type){
    var subset = content[type];
    Object.keys(subset).map(function(name){
      var realname = name;
      var name     = subset[name].name||name;

      console.log("\t","Bottling",type,name,"[~" + perfnow() + "ms]");

      bottle[type](name,subset[realname]);
      dependencies.push(name);
    })
  })

  var appdata = [config.about.filename,app]//.concat(dependencies);

  bottle.factory.apply(bottle,appdata);

  return bottle;
};

/**
  Initializes an application using supplied arguments.
  Usually called automatically.
 *
   @param {object} application The object on which to call the function.
   @param {object} config Configuration file
   @param {object} include Hashmap of includables ( libraries e.g. ).
   @param {object} modules Hashmap of modules.
   @returns {object} An instantiated application
*/
function setup(application, config, content) {
  if (this.started)
    console.warn("Warning: App setup called while already started")

  console.log("Initializing Application","[~" + perfnow() + "ms]");

  this.app = this.initialize(application, config, content);
  
  window.addEventListener("DOMContentLoaded",function(){
    this.app.container.fluxbuild.start();
  });

  console.log("Finished Application Initialization [~" + perfnow() + "ms]");

  return this.app;
};

module.exports = {
  app:        null,
  started:    false,
  initialize: initialize,
  setup:      setup
};

},{"bottlejs":"/home/flubber/projects/js/fluxbuild/node_modules/bottlejs/dist/bottle.js","util/perfnow":"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js"}],"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js":[function(require,module,exports){
var now        = require("performance-now"),
    _time      = now();

function elapsed(passed){
  return now()-passed;
}

module.exports = function(override){
  _time = override ? _time = now() : _time;
  var out = elapsed(_time).toString();
  return out.slice(0,out.indexOf(".")+2);
}

},{"performance-now":"/home/flubber/projects/js/fluxbuild/node_modules/performance-now/lib/performance-now.js"}],"/home/flubber/projects/js/fluxbuild/lib/util/swapcss.js":[function(require,module,exports){
function swapCSS(el,path)
{
	el = el || function(){
              let out = document.createElement("link");
              window.document.head.appendChild(out);
             return out}();
             
  let out = {
  	el:el,
    swap:function(path){
      el.setAttribute('rel','stylesheet');
      el.setAttribute('href',path);
    }
  };
  
  if (path)
  	out.swap(path)
    
  return out
}

module.exports = swapCSS;
},{}],"/home/flubber/projects/js/fluxbuild/node_modules/bottlejs/dist/bottle.js":[function(require,module,exports){
(function (global){
;(function(undefined) {
    'use strict';
    /**
     * BottleJS v1.6.1 - 2017-05-17
     * A powerful dependency injection micro container
     *
     * Copyright (c) 2017 Stephen Young
     * Licensed MIT
     */
    
    /**
     * Unique id counter;
     *
     * @type Number
     */
    var id = 0;
    
    /**
     * Local slice alias
     *
     * @type Functions
     */
    var slice = Array.prototype.slice;
    
    /**
     * Iterator used to walk down a nested object.
     *
     * If Bottle.config.strict is true, this method will throw an exception if it encounters an
     * undefined path
     *
     * @param Object obj
     * @param String prop
     * @return mixed
     * @throws Error if Bottle is unable to resolve the requested service.
     */
    var getNested = function getNested(obj, prop) {
        var service = obj[prop];
        if (service === undefined && globalConfig.strict) {
            throw new Error('Bottle was unable to resolve a service.  `' + prop + '` is undefined.');
        }
        return service;
    };
    
    /**
     * Get a nested bottle. Will set and return if not set.
     *
     * @param String name
     * @return Bottle
     */
    var getNestedBottle = function getNestedBottle(name) {
        return this.nested[name] || (this.nested[name] = Bottle.pop());
    };
    
    /**
     * Get a service stored under a nested key
     *
     * @param String fullname
     * @return Service
     */
    var getNestedService = function getNestedService(fullname) {
        return fullname.split('.').reduce(getNested, this);
    };
    
    /**
     * Register a constant
     *
     * @param String name
     * @param mixed value
     * @return Bottle
     */
    var constant = function constant(name, value) {
        var parts = name.split('.');
        name = parts.pop();
        defineConstant.call(parts.reduce(setValueObject, this.container), name, value);
        return this;
    };
    
    var defineConstant = function defineConstant(name, value) {
        Object.defineProperty(this, name, {
            configurable : false,
            enumerable : true,
            value : value,
            writable : false
        });
    };
    
    /**
     * Register decorator.
     *
     * @param String fullname
     * @param Function func
     * @return Bottle
     */
    var decorator = function decorator(fullname, func) {
        var parts, name;
        if (typeof fullname === 'function') {
            func = fullname;
            fullname = '__global__';
        }
    
        parts = fullname.split('.');
        name = parts.shift();
        if (parts.length) {
            getNestedBottle.call(this, name).decorator(parts.join('.'), func);
        } else {
            if (!this.decorators[name]) {
                this.decorators[name] = [];
            }
            this.decorators[name].push(func);
        }
        return this;
    };
    
    /**
     * Register a function that will be executed when Bottle#resolve is called.
     *
     * @param Function func
     * @return Bottle
     */
    var defer = function defer(func) {
        this.deferred.push(func);
        return this;
    };
    
    
    /**
     * Immediately instantiates the provided list of services and returns them.
     *
     * @param Array services
     * @return Array Array of instances (in the order they were provided)
     */
    var digest = function digest(services) {
        return (services || []).map(getNestedService, this.container);
    };
    
    /**
     * Register a factory inside a generic provider.
     *
     * @param String name
     * @param Function Factory
     * @return Bottle
     */
    var factory = function factory(name, Factory) {
        return provider.call(this, name, function GenericProvider() {
            this.$get = Factory;
        });
    };
    
    /**
     * Register an instance factory inside a generic factory.
     *
     * @param {String} name - The name of the service
     * @param {Function} Factory - The factory function, matches the signature required for the
     * `factory` method
     * @return Bottle
     */
    var instanceFactory = function instanceFactory(name, Factory) {
        return factory.call(this, name, function GenericInstanceFactory(container) {
            return {
                instance : Factory.bind(Factory, container)
            };
        });
    };
    
    /**
     * A filter function for removing bottle container methods and providers from a list of keys
     */
    var byMethod = function byMethod(name) {
        return !/^\$(?:decorator|register|list)$|Provider$/.test(name);
    };
    
    /**
     * List the services registered on the container.
     *
     * @param Object container
     * @return Array
     */
    var list = function list(container) {
        return Object.keys(container || this.container || {}).filter(byMethod);
    };
    
    /**
     * Function used by provider to set up middleware for each request.
     *
     * @param Number id
     * @param String name
     * @param Object instance
     * @param Object container
     * @return void
     */
    var applyMiddleware = function applyMiddleware(middleware, name, instance, container) {
        var descriptor = {
            configurable : true,
            enumerable : true
        };
        if (middleware.length) {
            descriptor.get = function getWithMiddlewear() {
                var index = 0;
                var next = function nextMiddleware(err) {
                    if (err) {
                        throw err;
                    }
                    if (middleware[index]) {
                        middleware[index++](instance, next);
                    }
                };
                next();
                return instance;
            };
        } else {
            descriptor.value = instance;
            descriptor.writable = true;
        }
    
        Object.defineProperty(container, name, descriptor);
    
        return container[name];
    };
    
    /**
     * Register middleware.
     *
     * @param String name
     * @param Function func
     * @return Bottle
     */
    var middleware = function middleware(fullname, func) {
        var parts, name;
        if (typeof fullname === 'function') {
            func = fullname;
            fullname = '__global__';
        }
    
        parts = fullname.split('.');
        name = parts.shift();
        if (parts.length) {
            getNestedBottle.call(this, name).middleware(parts.join('.'), func);
        } else {
            if (!this.middlewares[name]) {
                this.middlewares[name] = [];
            }
            this.middlewares[name].push(func);
        }
        return this;
    };
    
    /**
     * Named bottle instances
     *
     * @type Object
     */
    var bottles = {};
    
    /**
     * Get an instance of bottle.
     *
     * If a name is provided the instance will be stored in a local hash.  Calling Bottle.pop multiple
     * times with the same name will return the same instance.
     *
     * @param String name
     * @return Bottle
     */
    var pop = function pop(name) {
        var instance;
        if (typeof name === 'string') {
            instance = bottles[name];
            if (!instance) {
                bottles[name] = instance = new Bottle();
                instance.constant('BOTTLE_NAME', name);
            }
            return instance;
        }
        return new Bottle();
    };
    
    /**
     * Clear all named bottles.
     */
    var clear = function clear(name) {
        if (typeof name === 'string') {
            delete bottles[name];
        } else {
            bottles = {};
        }
    };
    
    /**
     * Used to process decorators in the provider
     *
     * @param Object instance
     * @param Function func
     * @return Mixed
     */
    var reducer = function reducer(instance, func) {
        return func(instance);
    };
    
    /**
     * Register a provider.
     *
     * @param String fullname
     * @param Function Provider
     * @return Bottle
     */
    var provider = function provider(fullname, Provider) {
        var parts, name;
        parts = fullname.split('.');
        if (this.providerMap[fullname] && parts.length === 1 && !this.container[fullname + 'Provider']) {
            return console.error(fullname + ' provider already instantiated.');
        }
        this.originalProviders[fullname] = Provider;
        this.providerMap[fullname] = true;
    
        name = parts.shift();
    
        if (parts.length) {
            createSubProvider.call(this, name, Provider, parts);
            return this;
        }
        return createProvider.call(this, name, Provider);
    };
    
    /**
     * Get decorators and middleware including globals
     *
     * @return array
     */
    var getWithGlobal = function getWithGlobal(collection, name) {
        return (collection[name] || []).concat(collection.__global__ || []);
    };
    
    /**
     * Create the provider properties on the container
     *
     * @param String name
     * @param Function Provider
     * @return Bottle
     */
    var createProvider = function createProvider(name, Provider) {
        var providerName, properties, container, id, decorators, middlewares;
    
        id = this.id;
        container = this.container;
        decorators = this.decorators;
        middlewares = this.middlewares;
        providerName = name + 'Provider';
    
        properties = Object.create(null);
        properties[providerName] = {
            configurable : true,
            enumerable : true,
            get : function getProvider() {
                var instance = new Provider();
                delete container[providerName];
                container[providerName] = instance;
                return instance;
            }
        };
    
        properties[name] = {
            configurable : true,
            enumerable : true,
            get : function getService() {
                var provider = container[providerName];
                var instance;
                if (provider) {
                    // filter through decorators
                    instance = getWithGlobal(decorators, name).reduce(reducer, provider.$get(container));
    
                    delete container[providerName];
                    delete container[name];
                }
                return instance === undefined ? instance : applyMiddleware(getWithGlobal(middlewares, name),
                    name, instance, container);
            }
        };
    
        Object.defineProperties(container, properties);
        return this;
    };
    
    /**
     * Creates a bottle container on the current bottle container, and registers
     * the provider under the sub container.
     *
     * @param String name
     * @param Function Provider
     * @param Array parts
     * @return Bottle
     */
    var createSubProvider = function createSubProvider(name, Provider, parts) {
        var bottle;
        bottle = getNestedBottle.call(this, name);
        this.factory(name, function SubProviderFactory() {
            return bottle.container;
        });
        return bottle.provider(parts.join('.'), Provider);
    };
    
    /**
     * Register a service, factory, provider, or value based on properties on the object.
     *
     * properties:
     *  * Obj.$name   String required ex: `'Thing'`
     *  * Obj.$type   String optional 'service', 'factory', 'provider', 'value'.  Default: 'service'
     *  * Obj.$inject Mixed  optional only useful with $type 'service' name or array of names
     *  * Obj.$value  Mixed  optional Normally Obj is registered on the container.  However, if this
     *                       property is included, it's value will be registered on the container
     *                       instead of the object itsself.  Useful for registering objects on the
     *                       bottle container without modifying those objects with bottle specific keys.
     *
     * @param Function Obj
     * @return Bottle
     */
    var register = function register(Obj) {
        var value = Obj.$value === undefined ? Obj : Obj.$value;
        return this[Obj.$type || 'service'].apply(this, [Obj.$name, value].concat(Obj.$inject || []));
    };
    
    /**
     * Deletes providers from the map and container.
     *
     * @param String name
     * @return void
     */
    var removeProviderMap = function resetProvider(name) {
        delete this.providerMap[name];
        delete this.container[name];
        delete this.container[name + 'Provider'];
    };
    
    /**
     * Resets all providers on a bottle instance.
     *
     * @return void
     */
    var resetProviders = function resetProviders() {
        var providers = this.originalProviders;
        Object.keys(this.originalProviders).forEach(function resetPrvider(provider) {
            var parts = provider.split('.');
            if (parts.length > 1) {
                removeProviderMap.call(this, parts[0]);
                parts.forEach(removeProviderMap, getNestedBottle.call(this, parts[0]));
            }
            removeProviderMap.call(this, provider);
            this.provider(provider, providers[provider]);
        }, this);
    };
    
    
    /**
     * Execute any deferred functions
     *
     * @param Mixed data
     * @return Bottle
     */
    var resolve = function resolve(data) {
        this.deferred.forEach(function deferredIterator(func) {
            func(data);
        });
    
        return this;
    };
    
    /**
     * Register a service inside a generic factory.
     *
     * @param String name
     * @param Function Service
     * @return Bottle
     */
    var service = function service(name, Service) {
        var deps = arguments.length > 2 ? slice.call(arguments, 2) : null;
        var bottle = this;
        return factory.call(this, name, function GenericFactory() {
            var ServiceCopy = Service;
            if (deps) {
                var args = deps.map(getNestedService, bottle.container);
                args.unshift(Service);
                ServiceCopy = Service.bind.apply(Service, args);
            }
            return new ServiceCopy();
        });
    };
    
    /**
     * Register a value
     *
     * @param String name
     * @param mixed val
     * @return Bottle
     */
    var value = function value(name, val) {
        var parts;
        parts = name.split('.');
        name = parts.pop();
        defineValue.call(parts.reduce(setValueObject, this.container), name, val);
        return this;
    };
    
    /**
     * Iterator for setting a plain object literal via defineValue
     *
     * @param Object container
     * @param string name
     */
    var setValueObject = function setValueObject(container, name) {
        var nestedContainer = container[name];
        if (!nestedContainer) {
            nestedContainer = {};
            defineValue.call(container, name, nestedContainer);
        }
        return nestedContainer;
    };
    
    /**
     * Define a mutable property on the container.
     *
     * @param String name
     * @param mixed val
     * @return void
     * @scope container
     */
    var defineValue = function defineValue(name, val) {
        Object.defineProperty(this, name, {
            configurable : true,
            enumerable : true,
            value : val,
            writable : true
        });
    };
    
    
    /**
     * Bottle constructor
     *
     * @param String name Optional name for functional construction
     */
    var Bottle = function Bottle(name) {
        if (!(this instanceof Bottle)) {
            return Bottle.pop(name);
        }
    
        this.id = id++;
    
        this.decorators = {};
        this.middlewares = {};
        this.nested = {};
        this.providerMap = {};
        this.originalProviders = {};
        this.deferred = [];
        this.container = {
            $decorator : decorator.bind(this),
            $register : register.bind(this),
            $list : list.bind(this)
        };
    };
    
    /**
     * Bottle prototype
     */
    Bottle.prototype = {
        constant : constant,
        decorator : decorator,
        defer : defer,
        digest : digest,
        factory : factory,
        instanceFactory: instanceFactory,
        list : list,
        middleware : middleware,
        provider : provider,
        resetProviders : resetProviders,
        register : register,
        resolve : resolve,
        service : service,
        value : value
    };
    
    /**
     * Bottle static
     */
    Bottle.pop = pop;
    Bottle.clear = clear;
    Bottle.list = list;
    
    /**
     * Global config
     */
    var globalConfig = Bottle.config = {
        strict : false
    };
    
    /**
     * Exports script adapted from lodash v2.4.1 Modern Build
     *
     * @see http://lodash.com/
     */
    
    /**
     * Valid object type map
     *
     * @type Object
     */
    var objectTypes = {
        'function' : true,
        'object' : true
    };
    
    (function exportBottle(root) {
    
        /**
         * Free variable exports
         *
         * @type Function
         */
        var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    
        /**
         * Free variable module
         *
         * @type Object
         */
        var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    
        /**
         * CommonJS module.exports
         *
         * @type Function
         */
        var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
    
        /**
         * Free variable `global`
         *
         * @type Object
         */
        var freeGlobal = objectTypes[typeof global] && global;
        if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
            root = freeGlobal;
        }
    
        /**
         * Export
         */
        if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
            root.Bottle = Bottle;
            define(function() { return Bottle; });
        } else if (freeExports && freeModule) {
            if (moduleExports) {
                (freeModule.exports = Bottle).Bottle = Bottle;
            } else {
                freeExports.Bottle = Bottle;
            }
        } else {
            root.Bottle = Bottle;
        }
    }((objectTypes[typeof window] && window) || this));
    
}.call(this));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars-layouts/index.js":[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;

function noop() {
	return '';
}

function getStack(context) {
	return context.$$layoutStack || (
		context.$$layoutStack = []
	);
}

function applyStack(context) {
	var stack = getStack(context);

	while (stack.length) {
		stack.shift()(context);
	}
}

function getActions(context) {
	return context.$$layoutActions || (
		context.$$layoutActions = {}
	);
}

function getActionsByName(context, name) {
	var actions = getActions(context);

	return actions[name] || (
		actions[name] = []
	);
}

function applyAction(val, action) {
	var context = this;

	function fn() {
		return action.fn(context, action.options);
	}

	switch (action.mode) {
		case 'append': {
			return val + fn();
		}

		case 'prepend': {
			return fn() + val;
		}

		case 'replace': {
			return fn();
		}

		default: {
			return val;
		}
	}
}

function mixin(target) {
	var arg, key,
		len = arguments.length,
		i = 1;

	for (; i < len; i++) {
		arg = arguments[i];

		if (!arg) {
			continue;
		}

		for (key in arg) {
			// istanbul ignore else
			if (hasOwn.call(arg, key)) {
				target[key] = arg[key];
			}
		}
	}

	return target;
}

/**
 * Generates an object of layout helpers.
 *
 * @type {Function}
 * @param {Object} handlebars Handlebars instance.
 * @return {Object} Object of helpers.
 */
function layouts(handlebars) {
	var helpers = {
		/**
		 * @method extend
		 * @param {String} name
		 * @param {?Object} customContext
		 * @param {Object} options
		 * @param {Function(Object)} options.fn
		 * @param {Object} options.hash
		 * @return {String} Rendered partial.
		 */
		extend: function (name, customContext, options) {
			// Make `customContext` optional
			if (arguments.length < 3) {
				options = customContext;
				customContext = null;
			}

			options = options || {};

			var fn = options.fn || noop,
				context = mixin({}, this, customContext, options.hash),
				data = handlebars.createFrame(options.data),
				template = handlebars.partials[name];

			// Partial template required
			if (template == null) {
				throw new Error('Missing partial: \'' + name + '\'');
			}

			// Compile partial, if needed
			if (typeof template !== 'function') {
				template = handlebars.compile(template);
			}

			// Add overrides to stack
			getStack(context).push(fn);

			// Render partial
			return template(context, { data: data });
		},

		/**
		 * @method embed
		 * @param {String} name
		 * @param {?Object} customContext
		 * @param {Object} options
		 * @param {Function(Object)} options.fn
		 * @param {Object} options.hash
		 * @return {String} Rendered partial.
		 */
		embed: function () {
			var context = mixin({}, this || {});

			// Reset context
			context.$$layoutStack = null;
			context.$$layoutActions = null;

			// Extend
			return helpers.extend.apply(context, arguments);
		},

		/**
		 * @method block
		 * @param {String} name
		 * @param {Object} options
		 * @param {Function(Object)} options.fn
		 * @return {String} Modified block content.
		 */
		block: function (name, options) {
			options = options || {};

			var fn = options.fn || noop,
				data = handlebars.createFrame(options.data),
				context = this || {};

			applyStack(context);

			return getActionsByName(context, name).reduce(
				applyAction.bind(context),
				fn(context, { data: data })
			);
		},

		/**
		 * @method content
		 * @param {String} name
		 * @param {Object} options
		 * @param {Function(Object)} options.fn
		 * @param {Object} options.hash
		 * @param {String} options.hash.mode
		 * @return {String} Always empty.
		 */
		content: function (name, options) {
			options = options || {};

			var fn = options.fn,
				data = handlebars.createFrame(options.data),
				hash = options.hash || {},
				mode = hash.mode || 'replace',
				context = this || {};

			applyStack(context);

			// Getter
			if (!fn) {
				return name in getActions(context);
			}

			// Setter
			getActionsByName(context, name).push({
				options: { data: data },
				mode: mode.toLowerCase(),
				fn: fn
			});
		}
	};

	return helpers;
}

/**
 * Registers layout helpers on a Handlebars instance.
 *
 * @method register
 * @param {Object} handlebars Handlebars instance.
 * @return {Object} Object of helpers.
 * @static
 */
layouts.register = function (handlebars) {
	var helpers = layouts(handlebars);

	handlebars.registerHelper(helpers);

	return helpers;
};

module.exports = layouts;

},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars.runtime.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _handlebarsBase = require('./handlebars/base');

var base = _interopRequireWildcard(_handlebarsBase);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _handlebarsSafeString = require('./handlebars/safe-string');

var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

var _handlebarsException = require('./handlebars/exception');

var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

var _handlebarsUtils = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_handlebarsUtils);

var _handlebarsRuntime = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_handlebarsRuntime);

var _handlebarsNoConflict = require('./handlebars/no-conflict');

var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _handlebarsSafeString2['default'];
  hb.Exception = _handlebarsException2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_handlebarsNoConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];


},{"./handlebars/base":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/base.js","./handlebars/exception":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/exception.js","./handlebars/no-conflict":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/no-conflict.js","./handlebars/runtime":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/runtime.js","./handlebars/safe-string":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/safe-string.js","./handlebars/utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/base.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('./utils');

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _helpers = require('./helpers');

var _decorators = require('./decorators');

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var VERSION = '4.0.11';
exports.VERSION = VERSION;
var COMPILER_REVISION = 7;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1',
  7: '>= 4.0.0'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials, decorators) {
  this.helpers = helpers || {};
  this.partials = partials || {};
  this.decorators = decorators || {};

  _helpers.registerDefaultHelpers(this);
  _decorators.registerDefaultDecorators(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: _logger2['default'],
  log: _logger2['default'].log,

  registerHelper: function registerHelper(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple helpers');
      }
      _utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (_utils.toString.call(name) === objectType) {
      _utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  },

  registerDecorator: function registerDecorator(name, fn) {
    if (_utils.toString.call(name) === objectType) {
      if (fn) {
        throw new _exception2['default']('Arg not supported with multiple decorators');
      }
      _utils.extend(this.decorators, name);
    } else {
      this.decorators[name] = fn;
    }
  },
  unregisterDecorator: function unregisterDecorator(name) {
    delete this.decorators[name];
  }
};

var log = _logger2['default'].log;

exports.log = log;
exports.createFrame = _utils.createFrame;
exports.logger = _logger2['default'];


},{"./decorators":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/decorators.js","./exception":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/exception.js","./helpers":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers.js","./logger":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/logger.js","./utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/decorators.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultDecorators = registerDefaultDecorators;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _decoratorsInline = require('./decorators/inline');

var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

function registerDefaultDecorators(instance) {
  _decoratorsInline2['default'](instance);
}


},{"./decorators/inline":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/decorators/inline.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerDecorator('inline', function (fn, props, container, options) {
    var ret = fn;
    if (!props.partials) {
      props.partials = {};
      ret = function (context, options) {
        // Create a new partials stack frame prior to exec.
        var original = container.partials;
        container.partials = _utils.extend({}, original, props.partials);
        var ret = fn(context, options);
        container.partials = original;
        return ret;
      };
    }

    props.partials[options.args[0]] = options.fn;

    return ret;
  });
};

module.exports = exports['default'];


},{"../utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/exception.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  try {
    if (loc) {
      this.lineNumber = line;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', {
          value: column,
          enumerable: true
        });
      } else {
        this.column = column;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];


},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.registerDefaultHelpers = registerDefaultHelpers;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersBlockHelperMissing = require('./helpers/block-helper-missing');

var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

var _helpersEach = require('./helpers/each');

var _helpersEach2 = _interopRequireDefault(_helpersEach);

var _helpersHelperMissing = require('./helpers/helper-missing');

var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

var _helpersIf = require('./helpers/if');

var _helpersIf2 = _interopRequireDefault(_helpersIf);

var _helpersLog = require('./helpers/log');

var _helpersLog2 = _interopRequireDefault(_helpersLog);

var _helpersLookup = require('./helpers/lookup');

var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

var _helpersWith = require('./helpers/with');

var _helpersWith2 = _interopRequireDefault(_helpersWith);

function registerDefaultHelpers(instance) {
  _helpersBlockHelperMissing2['default'](instance);
  _helpersEach2['default'](instance);
  _helpersHelperMissing2['default'](instance);
  _helpersIf2['default'](instance);
  _helpersLog2['default'](instance);
  _helpersLookup2['default'](instance);
  _helpersWith2['default'](instance);
}


},{"./helpers/block-helper-missing":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js","./helpers/each":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/each.js","./helpers/helper-missing":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js","./helpers/if":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/if.js","./helpers/log":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/log.js","./helpers/lookup":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js","./helpers/with":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/with.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/block-helper-missing.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (_utils.isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });
};

module.exports = exports['default'];


},{"../utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/each.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utils = require('../utils');

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = _utils.createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (_utils.isArray(context)) {
        for (var j = context.length; i < j; i++) {
          if (i in context) {
            execIteration(i, i, i === context.length - 1);
          }
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey !== undefined) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey !== undefined) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });
};

module.exports = exports['default'];


},{"../exception":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/exception.js","../utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/helper-missing.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _exception = require('../exception');

var _exception2 = _interopRequireDefault(_exception);

exports['default'] = function (instance) {
  instance.registerHelper('helperMissing', function () /* [args, ]options */{
    if (arguments.length === 1) {
      // A missing field in a {{foo}} construct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });
};

module.exports = exports['default'];


},{"../exception":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/exception.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/if.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('if', function (conditional, options) {
    if (_utils.isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });
};

module.exports = exports['default'];


},{"../utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/log.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('log', function () /* message, options */{
    var args = [undefined],
        options = arguments[arguments.length - 1];
    for (var i = 0; i < arguments.length - 1; i++) {
      args.push(arguments[i]);
    }

    var level = 1;
    if (options.hash.level != null) {
      level = options.hash.level;
    } else if (options.data && options.data.level != null) {
      level = options.data.level;
    }
    args[0] = level;

    instance.log.apply(instance, args);
  });
};

module.exports = exports['default'];


},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/lookup.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

exports['default'] = function (instance) {
  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
};

module.exports = exports['default'];


},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/helpers/with.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('../utils');

exports['default'] = function (instance) {
  instance.registerHelper('with', function (context, options) {
    if (_utils.isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!_utils.isEmpty(context)) {
      var data = options.data;
      if (options.data && options.ids) {
        data = _utils.createFrame(options.data);
        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
      }

      return fn(context, {
        data: data,
        blockParams: _utils.blockParams([context], [data && data.contextPath])
      });
    } else {
      return options.inverse(this);
    }
  });
};

module.exports = exports['default'];


},{"../utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/logger.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _utils = require('./utils');

var logger = {
  methodMap: ['debug', 'info', 'warn', 'error'],
  level: 'info',

  // Maps a given level value to the `methodMap` indexes above.
  lookupLevel: function lookupLevel(level) {
    if (typeof level === 'string') {
      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
      if (levelMap >= 0) {
        level = levelMap;
      } else {
        level = parseInt(level, 10);
      }
    }

    return level;
  },

  // Can be overridden in the host environment
  log: function log(level) {
    level = logger.lookupLevel(level);

    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
      var method = logger.methodMap[level];
      if (!console[method]) {
        // eslint-disable-line no-console
        method = 'log';
      }

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      console[method].apply(console, message); // eslint-disable-line no-console
    }
  }
};

exports['default'] = logger;
module.exports = exports['default'];


},{"./utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/no-conflict.js":[function(require,module,exports){
(function (global){
/* global window */
'use strict';

exports.__esModule = true;

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
    return Handlebars;
  };
};

module.exports = exports['default'];


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/runtime.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.checkRevision = checkRevision;
exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;
// istanbul ignore next

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// istanbul ignore next

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

var _exception = require('./exception');

var _exception2 = _interopRequireDefault(_exception);

var _base = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _base.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  templateSpec.main.decorator = templateSpec.main_d;

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
      if (options.ids) {
        options.ids[0] = true;
      }
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      var ret = templateSpec[i];
      ret.decorator = templateSpec[i + '_d'];
      return ret;
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },
    // An empty object to use as replacement for null-contexts
    nullContext: Object.seal({}),

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      if (options.depths) {
        depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
      } else {
        depths = [context];
      }
    }

    function main(context /*, options*/) {
      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
    }
    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
    return main(context, options);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
      if (templateSpec.usePartial || templateSpec.useDecorators) {
        container.decorators = container.merge(options.decorators, env.decorators);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
      container.decorators = options.decorators;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var currentDepths = depths;
    if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
      currentDepths = [context].concat(depths);
    }

    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
  }

  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    if (options.name === '@partial-block') {
      partial = options.data['partial-block'];
    } else {
      partial = options.partials[options.name];
    }
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  // Use the current closure context to save the partial-block if this partial
  var currentPartialBlock = options.data && options.data['partial-block'];
  options.partial = true;
  if (options.ids) {
    options.data.contextPath = options.ids[0] || options.data.contextPath;
  }

  var partialBlock = undefined;
  if (options.fn && options.fn !== noop) {
    (function () {
      options.data = _base.createFrame(options.data);
      // Wrapper function to get access to currentPartialBlock from the closure
      var fn = options.fn;
      partialBlock = options.data['partial-block'] = function partialBlockWrapper(context) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // Restore the partial-block from the closure for the execution of the block
        // i.e. the part inside the block of the partial call.
        options.data = _base.createFrame(options.data);
        options.data['partial-block'] = currentPartialBlock;
        return fn(context, options);
      };
      if (fn.partials) {
        options.partials = Utils.extend({}, options.partials, fn.partials);
      }
    })();
  }

  if (partial === undefined && partialBlock) {
    partial = partialBlock;
  }

  if (partial === undefined) {
    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _base.createFrame(data) : {};
    data.root = context;
  }
  return data;
}

function executeDecorators(fn, prog, container, depths, data, blockParams) {
  if (fn.decorator) {
    var props = {};
    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
    Utils.extend(prog, props);
  }
  return prog;
}


},{"./base":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/base.js","./exception":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/safe-string.js":[function(require,module,exports){
// Build out our basic SafeString type
'use strict';

exports.__esModule = true;
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];


},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars/utils.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.createFrame = createFrame;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

var badChars = /[&<>"'`=]/g,
    possible = /[&<>"'`=]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/* eslint-disable func-style */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
exports.isFunction = isFunction;

/* eslint-enable func-style */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};

exports.isArray = isArray;
// Older IE versions do not directly support indexOf so we must implement our own, sadly.

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function createFrame(object) {
  var frame = extend({}, object);
  frame._parent = object;
  return frame;
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}


},{}],"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/runtime.js":[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/dist/cjs/handlebars.runtime.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/lightrouter/src/lightrouter.js":[function(require,module,exports){
/*
 *  Copyright 2014 Gary Green.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function(window, factory) {

	if (typeof exports === 'object')
	{
		module.exports = factory(window);
	}
	else
	{
		window.LightRouter = factory(window);
	}

}(typeof window === 'undefined' ? undefined : window, function(window) {

	function LightRouter(options)
	{
		/**
		 * Path root (will be stripped out when testing path-based routes)
		 * @type string
		 */
		this.pathRoot = '';

		/**
		 * Routes
		 * @type array
		 */
		this.routes = [];

		/**
		 * Default routing type [hash or path]
		 * @type string
		 */
		this.type = 'path';

		/**
		 * Custom path (mainly used for testing)
		 * @type string
		 */
		this.path = null;

		/**
		 * Custom hash (mainly used for testing)
		 * @type string
		 */
		this.hash = null;

		/**
		 * Context to call matched routes under
		 * @type {mixed}
		 */
		this.context = this;

		/**
		 * Handler for string based callbacks
		 * @type {object|function}
		 */
		this.handler = window;

		/**
		 * Named param replace and matching regex
		 * @type {Object}
		 */
		var namedParam = '([\\w-]+)';
		this.namedParam = {
			match: new RegExp('{(' + namedParam + ')}', 'g'),
			replace: namedParam
		};

		options = options || {};

		if (options.type)      this.setType(options.type);
		if (options.path)      this.setPath(options.path);
		if (options.pathRoot)  this.setPathRoot(options.pathRoot);
		if (options.hash)      this.setHash(options.hash);
		if (options.context)   this.setContext(options.context);
		if (options.handler)   this.setHandler(options.handler);

		if (options.routes)
		{
			var route;
			for (route in options.routes)
			{
				this.add(route, options.routes[route]);
			}
		}
	}

	LightRouter.prototype = {

		/**
		 * Route constructor
		 * @type {Route}
		 */
		Route: Route,

		/**
		 * Add a route
		 * @param string|RegExp   route
		 * @param string|function callback
		 * @return self
		 */
		add: function(route, callback) {
			this.routes.push(new this.Route(route, callback, this));
			return this;
		},


		/**
		 * Empty/clear all the routes
		 * @return self
		 */
		empty: function() {
			this.routes = [];
			return this;
		},

		/**
		 * Set's the routing type
		 * @param self
		 */
		setType: function(type) {
			this.type = type;
			return this;
		},

		/**
		 * Set the path root url
		 * @param string url
		 * @return self
		 */
		setPathRoot: function(url) {
			this.pathRoot = url;
			return this;
		},

		/**
		 * Sets the custom path to test routes against
		 * @param  string path
		 * @return self
		 */
		setPath: function(path) {
			this.path = path;
			return this;
		},

		/**
		 * Sets the custom hash to test routes against
		 * @param  string hash
		 * @return self
		 */
		setHash: function(hash) {
			this.hash = hash;
			return this;
		},

		/**
		 * Sets context to call matched routes under
		 * @param  mixed context
		 * @return self
		 */
		setContext: function(context) {
			this.context = context;
			return this;
		},

		/**
		 * Set handler
		 * @param  mixed context
		 * @return self
		 */
		setHandler: function(handler) {
			this.handler = handler;
			return this;
		},

		/**
		 * Gets the url to test the routes against
		 * @return self
		 */
		getUrl: function(routeType) {

			var url;
			routeType = routeType || this.type;

			if (routeType == 'path')
			{
				var rootRegex = new RegExp('^' + this.pathRoot + '/?');
				url = this.path || window.location.pathname.substring(1);
				url = url.replace(rootRegex, '');
			}
			else if (routeType == 'hash')
			{
				url = this.hash || window.location.hash.substring(1);
			}
				
			return decodeURI(url);
		},

		/**
		 * Attempt to match a one-time route and callback
		 *
		 * @param  {string} path
		 * @param  {closure|string} callback
		 * @return {mixed}
		 */
		match: function(path, callback) {
			var route = new this.Route(path, callback, this);
			if (route.test(this.getUrl()))
			{
				return route.run();
			}
		},

		/**
		 * Run the router
		 * @return Route|undefined
		 */
		run: function() {
			var url = this.getUrl(), route;

			for (var i in this.routes)
			{
				// Get the route
				route = this.routes[i];

				// Test and run the route if it matches
				if (route.test(url))
				{
					route.run();
					return route;
				}
			}
		}
	};


	/**
	 * Route object
	 * @param {string} path
	 * @param {string} closure
	 * @param {LightRouter} router  Instance of the light router the route belongs to.
	 */
	function Route(path, callback, router)
	{
		this.path = path;
		this.callback = callback;
		this.router = router;
		this.values = [];
	}

	Route.prototype = {

		/**
		 * Converts route to a regex (if required) so that it's suitable for matching against.
		 * @param  string route
		 * @return RegExp
		 */
		regex: function() {

			var path = this.path;

			if (typeof path === 'string')
			{
				return new RegExp('^' + path.replace(/\//g, '\\/').replace(this.router.namedParam.match, this.router.namedParam.replace) + '$');
			}
			return path;
		},

		/**
		 * Get the matching param keys
		 * @return object  Object keyed with param name (or index) with the value.
		 */
		params: function() {

			var obj = {}, name, values = this.values, params = values, i, t = 0, path = this.path;

			if (typeof path === 'string')
			{
				t = 1;
				params = path.match(this.router.namedParam.match);
			}
			
			for (i in params)
			{
				name = t ? params[i].replace(this.router.namedParam.match, '$1') : i;
				obj[name] = values[i];
			}

			return obj;
		},

		/**
		 * Test the route to see if it matches
		 * @param  {string} url Url to match against
		 * @return {boolean}
		 */
		test: function(url) {
			var matches;
			if (matches = url.match(this.regex()))
			{
				this.values = matches.slice(1);
				return true;
			}
			return false;
		},

		/**
		 * Run the route callback with the matched params
		 * @return {mixed}
		 */
		run: function() {
			if (typeof this.callback === 'string')
			{
				return this.router.handler[this.callback](this.params());
			}
			return this.callback.apply(this.router.context, [this.params()]);
		}
	};

	return LightRouter;

}));
},{}],"/home/flubber/projects/js/fluxbuild/node_modules/performance-now/lib/performance-now.js":[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);



}).call(this,require('_process'))

},{"_process":"/home/flubber/projects/js/fluxbuild/node_modules/process/browser.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/home/flubber/projects/js/fluxbuild/node_modules/zest/lib/zest.js":[function(require,module,exports){
(function (global){
/**
 * Zest (https://github.com/chjj/zest)
 * A css selector engine.
 * Copyright (c) 2011-2012, Christopher Jeffrey. (MIT Licensed)
 */

// TODO
// - Recognize the TR subject selector when parsing.
// - Pass context to scope.
// - Add :column pseudo-classes.

;(function() {

/**
 * Shared
 */

var window = this
  , document = this.document
  , old = this.zest;

/**
 * Helpers
 */

var compareDocumentPosition = (function() {
  if (document.compareDocumentPosition) {
    return function(a, b) {
      return a.compareDocumentPosition(b);
    };
  }
  return function(a, b) {
    var el = a.ownerDocument.getElementsByTagName('*')
      , i = el.length;

    while (i--) {
      if (el[i] === a) return 2;
      if (el[i] === b) return 4;
    }

    return 1;
  };
})();

var order = function(a, b) {
  return compareDocumentPosition(a, b) & 2 ? 1 : -1;
};

var next = function(el) {
  while ((el = el.nextSibling)
         && el.nodeType !== 1);
  return el;
};

var prev = function(el) {
  while ((el = el.previousSibling)
         && el.nodeType !== 1);
  return el;
};

var child = function(el) {
  if (el = el.firstChild) {
    while (el.nodeType !== 1
           && (el = el.nextSibling));
  }
  return el;
};

var lastChild = function(el) {
  if (el = el.lastChild) {
    while (el.nodeType !== 1
           && (el = el.previousSibling));
  }
  return el;
};

var unquote = function(str) {
  if (!str) return str;
  var ch = str[0];
  return ch === '"' || ch === '\''
    ? str.slice(1, -1)
    : str;
};

var indexOf = (function() {
  if (Array.prototype.indexOf) {
    return Array.prototype.indexOf;
  }
  return function(obj, item) {
    var i = this.length;
    while (i--) {
      if (this[i] === item) return i;
    }
    return -1;
  };
})();

var makeInside = function(start, end) {
  var regex = rules.inside.source
    .replace(/</g, start)
    .replace(/>/g, end);

  return new RegExp(regex);
};

var replace = function(regex, name, val) {
  regex = regex.source;
  regex = regex.replace(name, val.source || val);
  return new RegExp(regex);
};

var truncateUrl = function(url, num) {
  return url
    .replace(/^(?:\w+:\/\/|\/+)/, '')
    .replace(/(?:\/+|\/*#.*?)$/, '')
    .split('/', num)
    .join('/');
};

/**
 * Handle `nth` Selectors
 */

var parseNth = function(param, test) {
  var param = param.replace(/\s+/g, '')
    , cap;

  if (param === 'even') {
    param = '2n+0';
  } else if (param === 'odd') {
    param = '2n+1';
  } else if (!~param.indexOf('n')) {
    param = '0n' + param;
  }

  cap = /^([+-])?(\d+)?n([+-])?(\d+)?$/.exec(param);

  return {
    group: cap[1] === '-'
      ? -(cap[2] || 1)
      : +(cap[2] || 1),
    offset: cap[4]
      ? (cap[3] === '-' ? -cap[4] : +cap[4])
      : 0
  };
};

var nth = function(param, test, last) {
  var param = parseNth(param)
    , group = param.group
    , offset = param.offset
    , find = !last ? child : lastChild
    , advance = !last ? next : prev;

  return function(el) {
    if (el.parentNode.nodeType !== 1) return;

    var rel = find(el.parentNode)
      , pos = 0;

    while (rel) {
      if (test(rel, el)) pos++;
      if (rel === el) {
        pos -= offset;
        return group && pos
          ? !(pos % group) && (pos < 0 === group < 0)
          : !pos;
      }
      rel = advance(rel);
    }
  };
};

/**
 * Simple Selectors
 */

var selectors = {
  '*': (function() {
    if (function() {
      var el = document.createElement('div');
      el.appendChild(document.createComment(''));
      return !!el.getElementsByTagName('*')[0];
    }()) {
      return function(el) {
        if (el.nodeType === 1) return true;
      };
    }
    return function() {
      return true;
    };
  })(),
  'type': function(type) {
    type = type.toLowerCase();
    return function(el) {
      return el.nodeName.toLowerCase() === type;
    };
  },
  'attr': function(key, op, val, i) {
    op = operators[op];
    return function(el) {
      var attr;
      switch (key) {
        case 'for':
          attr = el.htmlFor;
          break;
        case 'class':
          // className is '' when non-existent
          // getAttribute('class') is null
          attr = el.className;
          if (attr === '' && el.getAttribute('class') == null) {
            attr = null;
          }
          break;
        case 'href':
          attr = el.getAttribute('href', 2);
          break;
        case 'title':
          // getAttribute('title') can be '' when non-existent sometimes?
          attr = el.getAttribute('title') || null;
          break;
        case 'id':
          if (el.getAttribute) {
            attr = el.getAttribute('id');
            break;
          }
        default:
          attr = el[key] != null
            ? el[key]
            : el.getAttribute && el.getAttribute(key);
          break;
      }
      if (attr == null) return;
      attr = attr + '';
      if (i) {
        attr = attr.toLowerCase();
        val = val.toLowerCase();
      }
      return op(attr, val);
    };
  },
  ':first-child': function(el) {
    return !prev(el) && el.parentNode.nodeType === 1;
  },
  ':last-child': function(el) {
    return !next(el) && el.parentNode.nodeType === 1;
  },
  ':only-child': function(el) {
    return !prev(el) && !next(el)
      && el.parentNode.nodeType === 1;
  },
  ':nth-child': function(param, last) {
    return nth(param, function() {
      return true;
    }, last);
  },
  ':nth-last-child': function(param) {
    return selectors[':nth-child'](param, true);
  },
  ':root': function(el) {
    return el.ownerDocument.documentElement === el;
  },
  ':empty': function(el) {
    return !el.firstChild;
  },
  ':not': function(sel) {
    var test = compileGroup(sel);
    return function(el) {
      return !test(el);
    };
  },
  ':first-of-type': function(el) {
    if (el.parentNode.nodeType !== 1) return;
    var type = el.nodeName;
    while (el = prev(el)) {
      if (el.nodeName === type) return;
    }
    return true;
  },
  ':last-of-type': function(el) {
    if (el.parentNode.nodeType !== 1) return;
    var type = el.nodeName;
    while (el = next(el)) {
      if (el.nodeName === type) return;
    }
    return true;
  },
  ':only-of-type': function(el) {
    return selectors[':first-of-type'](el)
        && selectors[':last-of-type'](el);
  },
  ':nth-of-type': function(param, last) {
    return nth(param, function(rel, el) {
      return rel.nodeName === el.nodeName;
    }, last);
  },
  ':nth-last-of-type': function(param) {
    return selectors[':nth-of-type'](param, true);
  },
  ':checked': function(el) {
    return !!(el.checked || el.selected);
  },
  ':indeterminate': function(el) {
    return !selectors[':checked'](el);
  },
  ':enabled': function(el) {
    return !el.disabled && el.type !== 'hidden';
  },
  ':disabled': function(el) {
    return !!el.disabled;
  },
  ':target': function(el) {
    return el.id === window.location.hash.substring(1);
  },
  ':focus': function(el) {
    return el === el.ownerDocument.activeElement;
  },
  ':matches': function(sel) {
    return compileGroup(sel);
  },
  ':nth-match': function(param, last) {
    var args = param.split(/\s*,\s*/)
      , arg = args.shift()
      , test = compileGroup(args.join(','));

    return nth(arg, test, last);
  },
  ':nth-last-match': function(param) {
    return selectors[':nth-match'](param, true);
  },
  ':links-here': function(el) {
    return el + '' === window.location + '';
  },
  ':lang': function(param) {
    return function(el) {
      while (el) {
        if (el.lang) return el.lang.indexOf(param) === 0;
        el = el.parentNode;
      }
    };
  },
  ':dir': function(param) {
    return function(el) {
      while (el) {
        if (el.dir) return el.dir === param;
        el = el.parentNode;
      }
    };
  },
  ':scope': function(el, con) {
    var context = con || el.ownerDocument;
    if (context.nodeType === 9) {
      return el === context.documentElement;
    }
    return el === context;
  },
  ':any-link': function(el) {
    return typeof el.href === 'string';
  },
  ':local-link': function(el) {
    if (el.nodeName) {
      return el.href && el.host === window.location.host;
    }
    var param = +el + 1;
    return function(el) {
      if (!el.href) return;

      var url = window.location + ''
        , href = el + '';

      return truncateUrl(url, param) === truncateUrl(href, param);
    };
  },
  ':default': function(el) {
    return !!el.defaultSelected;
  },
  ':valid': function(el) {
    return el.willValidate || (el.validity && el.validity.valid);
  },
  ':invalid': function(el) {
    return !selectors[':valid'](el);
  },
  ':in-range': function(el) {
    return el.value > el.min && el.value <= el.max;
  },
  ':out-of-range': function(el) {
    return !selectors[':in-range'](el);
  },
  ':required': function(el) {
    return !!el.required;
  },
  ':optional': function(el) {
    return !el.required;
  },
  ':read-only': function(el) {
    if (el.readOnly) return true;

    var attr = el.getAttribute('contenteditable')
      , prop = el.contentEditable
      , name = el.nodeName.toLowerCase();

    name = name !== 'input' && name !== 'textarea';

    return (name || el.disabled) && attr == null && prop !== 'true';
  },
  ':read-write': function(el) {
    return !selectors[':read-only'](el);
  },
  ':hover': function() {
    throw new Error(':hover is not supported.');
  },
  ':active': function() {
    throw new Error(':active is not supported.');
  },
  ':link': function() {
    throw new Error(':link is not supported.');
  },
  ':visited': function() {
    throw new Error(':visited is not supported.');
  },
  ':column': function() {
    throw new Error(':column is not supported.');
  },
  ':nth-column': function() {
    throw new Error(':nth-column is not supported.');
  },
  ':nth-last-column': function() {
    throw new Error(':nth-last-column is not supported.');
  },
  ':current': function() {
    throw new Error(':current is not supported.');
  },
  ':past': function() {
    throw new Error(':past is not supported.');
  },
  ':future': function() {
    throw new Error(':future is not supported.');
  },
  // Non-standard, for compatibility purposes.
  ':contains': function(param) {
    return function(el) {
      var text = el.innerText || el.textContent || el.value || '';
      return !!~text.indexOf(param);
    };
  },
  ':has': function(param) {
    return function(el) {
      return zest(param, el).length > 0;
    };
  }
  // Potentially add more pseudo selectors for
  // compatibility with sizzle and most other
  // selector engines (?).
};

/**
 * Attribute Operators
 */

var operators = {
  '-': function() {
    return true;
  },
  '=': function(attr, val) {
    return attr === val;
  },
  '*=': function(attr, val) {
    return attr.indexOf(val) !== -1;
  },
  '~=': function(attr, val) {
    var i = attr.indexOf(val)
      , f
      , l;

    if (i === -1) return;
    f = attr[i - 1];
    l = attr[i + val.length];

    return (!f || f === ' ') && (!l || l === ' ');
  },
  '|=': function(attr, val) {
    var i = attr.indexOf(val)
      , l;

    if (i !== 0) return;
    l = attr[i + val.length];

    return l === '-' || !l;
  },
  '^=': function(attr, val) {
    return attr.indexOf(val) === 0;
  },
  '$=': function(attr, val) {
    return attr.indexOf(val) + val.length === attr.length;
  },
  // non-standard
  '!=': function(attr, val) {
    return attr !== val;
  }
};

/**
 * Combinator Logic
 */

var combinators = {
  ' ': function(test) {
    return function(el) {
      while (el = el.parentNode) {
        if (test(el)) return el;
      }
    };
  },
  '>': function(test) {
    return function(el) {
      return test(el = el.parentNode) && el;
    };
  },
  '+': function(test) {
    return function(el) {
      return test(el = prev(el)) && el;
    };
  },
  '~': function(test) {
    return function(el) {
      while (el = prev(el)) {
        if (test(el)) return el;
      }
    };
  },
  'noop': function(test) {
    return function(el) {
      return test(el) && el;
    };
  },
  'ref': function(test, name) {
    var node;

    function ref(el) {
      var doc = el.ownerDocument
        , nodes = doc.getElementsByTagName('*')
        , i = nodes.length;

      while (i--) {
        node = nodes[i];
        if (ref.test(el)) {
          node = null;
          return true;
        }
      }

      node = null;
    }

    ref.combinator = function(el) {
      if (!node || !node.getAttribute) return;

      var attr = node.getAttribute(name) || '';
      if (attr[0] === '#') attr = attr.substring(1);

      if (attr === el.id && test(node)) {
        return node;
      }
    };

    return ref;
  }
};

/**
 * Grammar
 */

var rules = {
  qname: /^ *([\w\-]+|\*)/,
  simple: /^(?:([.#][\w\-]+)|pseudo|attr)/,
  ref: /^ *\/([\w\-]+)\/ */,
  combinator: /^(?: +([^ \w*]) +|( )+|([^ \w*]))(?! *$)/,
  attr: /^\[([\w\-]+)(?:([^\w]?=)(inside))?\]/,
  pseudo: /^(:[\w\-]+)(?:\((inside)\))?/,
  inside: /(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|<[^"'>]*>|\\["'>]|[^"'>])*/
};

rules.inside = replace(rules.inside, '[^"\'>]*', rules.inside);
rules.attr = replace(rules.attr, 'inside', makeInside('\\[', '\\]'));
rules.pseudo = replace(rules.pseudo, 'inside', makeInside('\\(', '\\)'));
rules.simple = replace(rules.simple, 'pseudo', rules.pseudo);
rules.simple = replace(rules.simple, 'attr', rules.attr);

/**
 * Compiling
 */

var compile = function(sel) {
  var sel = sel.replace(/^\s+|\s+$/g, '')
    , test
    , filter = []
    , buff = []
    , subject
    , qname
    , cap
    , op
    , ref;

  while (sel) {
    if (cap = rules.qname.exec(sel)) {
      sel = sel.substring(cap[0].length);
      qname = cap[1];
      buff.push(tok(qname, true));
    } else if (cap = rules.simple.exec(sel)) {
      sel = sel.substring(cap[0].length);
      qname = '*';
      buff.push(tok(qname, true));
      buff.push(tok(cap));
    } else {
      throw new Error('Invalid selector.');
    }

    while (cap = rules.simple.exec(sel)) {
      sel = sel.substring(cap[0].length);
      buff.push(tok(cap));
    }

    if (sel[0] === '!') {
      sel = sel.substring(1);
      subject = makeSubject();
      subject.qname = qname;
      buff.push(subject.simple);
    }

    if (cap = rules.ref.exec(sel)) {
      sel = sel.substring(cap[0].length);
      ref = combinators.ref(makeSimple(buff), cap[1]);
      filter.push(ref.combinator);
      buff = [];
      continue;
    }

    if (cap = rules.combinator.exec(sel)) {
      sel = sel.substring(cap[0].length);
      op = cap[1] || cap[2] || cap[3];
      if (op === ',') {
        filter.push(combinators.noop(makeSimple(buff)));
        break;
      }
    } else {
      op = 'noop';
    }

    filter.push(combinators[op](makeSimple(buff)));
    buff = [];
  }

  test = makeTest(filter);
  test.qname = qname;
  test.sel = sel;

  if (subject) {
    subject.lname = test.qname;

    subject.test = test;
    subject.qname = subject.qname;
    subject.sel = test.sel;
    test = subject;
  }

  if (ref) {
    ref.test = test;
    ref.qname = test.qname;
    ref.sel = test.sel;
    test = ref;
  }

  return test;
};

var tok = function(cap, qname) {
  // qname
  if (qname) {
    return cap === '*'
      ? selectors['*']
      : selectors.type(cap);
  }

  // class/id
  if (cap[1]) {
    return cap[1][0] === '.'
      ? selectors.attr('class', '~=', cap[1].substring(1))
      : selectors.attr('id', '=', cap[1].substring(1));
  }

  // pseudo-name
  // inside-pseudo
  if (cap[2]) {
    return cap[3]
      ? selectors[cap[2]](unquote(cap[3]))
      : selectors[cap[2]];
  }

  // attr name
  // attr op
  // attr value
  if (cap[4]) {
    var i;
    if (cap[6]) {
      i = cap[6].length;
      cap[6] = cap[6].replace(/ +i$/, '');
      i = i > cap[6].length;
    }
    return selectors.attr(cap[4], cap[5] || '-', unquote(cap[6]), i);
  }

  throw new Error('Unknown Selector.');
};

var makeSimple = function(func) {
  var l = func.length
    , i;

  // Potentially make sure
  // `el` is truthy.
  if (l < 2) return func[0];

  return function(el) {
    if (!el) return;
    for (i = 0; i < l; i++) {
      if (!func[i](el)) return;
    }
    return true;
  };
};

var makeTest = function(func) {
  if (func.length < 2) {
    return function(el) {
      return !!func[0](el);
    };
  }
  return function(el) {
    var i = func.length;
    while (i--) {
      if (!(el = func[i](el))) return;
    }
    return true;
  };
};

var makeSubject = function() {
  var target;

  function subject(el) {
    var node = el.ownerDocument
      , scope = node.getElementsByTagName(subject.lname)
      , i = scope.length;

    while (i--) {
      if (subject.test(scope[i]) && target === el) {
        target = null;
        return true;
      }
    }

    target = null;
  }

  subject.simple = function(el) {
    target = el;
    return true;
  };

  return subject;
};

var compileGroup = function(sel) {
  var test = compile(sel)
    , tests = [ test ];

  while (test.sel) {
    test = compile(test.sel);
    tests.push(test);
  }

  if (tests.length < 2) return test;

  return function(el) {
    var l = tests.length
      , i = 0;

    for (; i < l; i++) {
      if (tests[i](el)) return true;
    }
  };
};

/**
 * Selection
 */

var find = function(sel, node) {
  var results = []
    , test = compile(sel)
    , scope = node.getElementsByTagName(test.qname)
    , i = 0
    , el;

  while (el = scope[i++]) {
    if (test(el)) results.push(el);
  }

  if (test.sel) {
    while (test.sel) {
      test = compile(test.sel);
      scope = node.getElementsByTagName(test.qname);
      i = 0;
      while (el = scope[i++]) {
        if (test(el) && !~indexOf.call(results, el)) {
          results.push(el);
        }
      }
    }
    results.sort(order);
  }

  return results;
};

/**
 * Native
 */

var select = (function() {
  var slice = (function() {
    try {
      Array.prototype.slice.call(document.getElementsByTagName('zest'));
      return Array.prototype.slice;
    } catch(e) {
      e = null;
      return function() {
        var a = [], i = 0, l = this.length;
        for (; i < l; i++) a.push(this[i]);
        return a;
      };
    }
  })();

  if (document.querySelectorAll) {
    return function(sel, node) {
      try {
        return slice.call(node.querySelectorAll(sel));
      } catch(e) {
        return find(sel, node);
      }
    };
  }

  return function(sel, node) {
    try {
      if (sel[0] === '#' && /^#[\w\-]+$/.test(sel)) {
        return [node.getElementById(sel.substring(1))];
      }
      if (sel[0] === '.' && /^\.[\w\-]+$/.test(sel)) {
        sel = node.getElementsByClassName(sel.substring(1));
        return slice.call(sel);
      }
      if (/^[\w\-]+$/.test(sel)) {
        return slice.call(node.getElementsByTagName(sel));
      }
    } catch(e) {
      ;
    }
    return find(sel, node);
  };
})();

/**
 * Zest
 */

var zest = function(sel, node) {
  try {
    sel = select(sel, node || document);
  } catch(e) {
    if (window.ZEST_DEBUG) {
      console.log(e.stack || e + '');
    }
    sel = [];
  }
  return sel;
};

/**
 * Expose
 */

zest.selectors = selectors;
zest.operators = operators;
zest.combinators = combinators;
zest.compile = compileGroup;

zest.matches = function(el, sel) {
  return !!compileGroup(sel)(el);
};

zest.cache = function() {
  if (compile.raw) return;

  var raw = compile
    , cache = {};

  compile = function(sel) {
    return cache[sel]
      || (cache[sel] = raw(sel));
  };

  compile.raw = raw;
  zest._cache = cache;
};

zest.noCache = function() {
  if (!compile.raw) return;
  compile = compile.raw;
  delete zest._cache;
};

zest.noConflict = function() {
  window.zest = old;
  return zest;
};

zest.noNative = function() {
  select = find;
};

if (typeof module !== 'undefined') {
  module.exports = zest;
} else {
  this.zest = zest;
}

if (window.ZEST_DEBUG) {
  zest.noNative();
} else {
  zest.cache();
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/home/flubber/projects/js/fluxbuild/source/factory/page.js":[function(require,module,exports){
var perfnow     = require("util/perfnow"),
    PageView    = require("../view/page");

module.exports = function page(container) {
  console.log("Initializing pageFactory","[~" + perfnow() + "ms]")
  
  return {
    view:null,
    start:function(){
      this.view = new PageView({
        el: "#page",
        template: container.template,
        model: container.config.about
      });
    },
    loadPage: function(page,subpage) {
      this.view.render(page,subpage);
    },
    destroy: function() {
      console.log("\t", "pageFactory Destroyed");
    }
  }
};

},{"../view/page":"/home/flubber/projects/js/fluxbuild/source/view/page.js","util/perfnow":"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js"}],"/home/flubber/projects/js/fluxbuild/source/factory/template.js":[function(require,module,exports){
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

},{"../template":"/home/flubber/projects/js/fluxbuild/source/template.js","handlebars-layouts":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars-layouts/index.js","handlebars/runtime":"/home/flubber/projects/js/fluxbuild/node_modules/handlebars/runtime.js"}],"/home/flubber/projects/js/fluxbuild/source/index.js":[function(require,module,exports){
window.$          = require("zest");

var perfnow = require('util/perfnow'),
    swapCSS = require('util/swapcss'),
    fluxbottle = require('fluxbottle'),
    config = require('../config/app'),
    content = ({"service":({"config":require("./service/config.js"),"router":require("./service/router.js")}),"factory":({"page":require("./factory/page.js"),"template":require("./factory/template.js")})});                                                            
/**
 * Core for your application that gets bottled into a factory.
 * All your services, factories and such will be bottled beforehand and
 * are accesible from `container`.
 * @param {object} container A BottleJS container
 * @returns {object} service A service to expose
 */
var Application = function(container) {
  
  let routeHandler = (options) =>
                      container.page.loadPage(options.page,options.subpage);
    
  container.router.add("{page}/{subpage}", routeHandler );
  container.router.add("{page}",           routeHandler );
  
  
  return {
    fadeIn: function(duration,steps){
      
    let html = $("html")[0],
        opacity = 0,
        lift = function(){
          opacity += 1/steps;
          
          html.style.opacity = opacity.toString();
      
          if (opacity < 1)
            window.setTimeout(lift,10)
        };
        
    html.style.opacity = opacity;
    html.style.display = "block";
    
    
    window.setTimeout(lift,duration/steps)
    },
    start:    function() {
    console.log("\t","Application Started", "[~" + perfnow() + "ms]");
    
    container.style = swapCSS($("#theme")[0]);
    
    $("#themeselect")[0].addEventListener("change",(e) => {
      let uri = "https://jenil.github.io/bulmaswatch/"+e
                                            .srcElement
                                            .value+"/bulmaswatch.min.css";
      container.style.swap(uri);
    })
  
    container.page.start();
    
    window.addEventListener("hashchange",
                                (e) => container.router.run()
                              );
    
    if (window.location.hash === "")
      window.location.hash = "home"
    
    container.router.run();
    
    this.fadeIn(750,10);
    
    }
  }
};

window.app = fluxbottle.setup(Application,config,content);

module.exports = Application;

},{"../config/app":"/home/flubber/projects/js/fluxbuild/config/app/index.js","./factory/page.js":"/home/flubber/projects/js/fluxbuild/source/factory/page.js","./factory/template.js":"/home/flubber/projects/js/fluxbuild/source/factory/template.js","./service/config.js":"/home/flubber/projects/js/fluxbuild/source/service/config.js","./service/router.js":"/home/flubber/projects/js/fluxbuild/source/service/router.js","fluxbottle":"/home/flubber/projects/js/fluxbuild/lib/fluxbottle/index.js","util/perfnow":"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js","util/swapcss":"/home/flubber/projects/js/fluxbuild/lib/util/swapcss.js","zest":"/home/flubber/projects/js/fluxbuild/node_modules/zest/lib/zest.js"}],"/home/flubber/projects/js/fluxbuild/source/service/config.js":[function(require,module,exports){
var appconfig = require("../../config/app");

module.exports = function config(){
  return appconfig;
};

},{"../../config/app":"/home/flubber/projects/js/fluxbuild/config/app/index.js"}],"/home/flubber/projects/js/fluxbuild/source/service/router.js":[function(require,module,exports){
var perfnow  = require("util/perfnow"),
    Lightrouter = require("lightrouter");
    
module.exports = function router() {

  console.log("Initializing RouterModule", "[~" + perfnow() + "ms]")
  
  var router = new Lightrouter({
	  type: 'hash',             // Default routing type
	  pathRoot: 'fluxbuild',  // Base path for your app
  });
 
  return router;
};

},{"lightrouter":"/home/flubber/projects/js/fluxbuild/node_modules/lightrouter/src/lightrouter.js","util/perfnow":"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js"}],"/home/flubber/projects/js/fluxbuild/source/template.js":[function(require,module,exports){
module.exports = function (Handlebars){var container = {}; container["about"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <h2 class=\"title\">About</h2>\n \n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <section class=\"section\">\n      <h2 class=\"title\">Author</h2>\n      <p class=\"box\">\n        Fluxbuild is written by <a href=\"https://github.com/Flubbex\">Flubbex.</a>\n      </p>\n    </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["disc"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  \n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "  <h1 class=\"title\">Disc</h1>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <embed src=\"content/disc/index.html\" \n           class=\"no-margin\" \n           style=\"height:90%;width:100%\"></embed>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["home"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "<h1 class=\"title\">Fluxbuild</h1>\n<h1 class=\"subtitle\">\n        Ember-inspired build tool written in Node.js\n  <span class=\"fade-in-from-top anim-delay--10\">\n          for creating fast,\n  </span>\n  <span class=\"fade-in-from-top anim-delay--15\">lightweight,</span>\n  <span class=\"fade-in-from-top anim-delay--20\">uncoupled,</span>\n  <span class=\"fade-in-from-top anim-delay--25\">full-scale applications - </span>\n  <span class=\"fade-in-from-top anim-delay--35\">that work anywhere </span>\n</h1>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "<section class=\"section\">\n  <div class=\"tile is-ancestor\">\n    <div class=\"tile is-parent is-vertical\">\n      <div class=\"tile is-child box\">\n    <h2 class=\"title\">Gulp 4</h2 class=\"title\">\n    <p>\n          gulp is a toolkit for automating painful or time-consuming tasks in your development workflow, so you can stop messing around and build something.\n      </p>\n      </div>\n\n      <div class=\"tile is-child box\">\n        <h2 class=\"title\">Browserify</h2 class=\"title\">\n        <p>\n          Browsers don't have the require method defined, but Node.js does. With Browserify you can write code that uses require in the same way that you would use it in Node.\n        </p>\n      </div>\n\n      <div class=\"tile is-child box\">\n        <h2 class=\"title\">Bottle.js</h2 class=\"title\">\n        <p>\n         BottleJS is a tiny, powerful dependency injection container. It features lazy loading, middleware hooks, decorators and a clean api inspired by the AngularJS Module API and the simple PHP library Pimple. \n        </p>\n      </div>\n    </div>\n    <div class=\"tile is-parent is-vertical\">\n      <div class=\"tile is-child box\">\n        <h2 class=\"title\">Handlebars</h2 class=\"title\">\n        <p>\n          Handlebars provides the power necessary to let you build semantic templates effectively with no frustration.\n        </p>\n      </div>\n\n      <div class=\"tile is-child box\">\n        <h2 class=\"title\">Bulma CSS</h2 class=\"title\">\n        <p>\n          Bulma is a free and open source CSS framework based on Flexbox.\n        </p>\n      </div>\n\n      <div class=\"tile is-child box\">\n        <h2 class=\"title\">Fluxbuild</h2 class=\"title\">\n        <p>\n          Build blazingly-fast applications using all of the above, with premade gulp tasks for automated testing, documentation,templating and more. Configurable to fit your favorite workflow without getting in your way.\n        </p>\n      </div>\n    </div>\n  </div>\n</section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    ";
},"useData":true});
container["layout"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "  <section class=\"hero is-primary\">\n    <div class=\"hero-body\">\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"header",{"name":"block","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n  </section>\n\n  <div class=\"container\" id=\"page\">\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"page",{"name":"block","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "";
},"4":function(container,depth0,helpers,partials,data) {
    return "      Content\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.block || (depth0 && depth0.block) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"fullpage",{"name":"block","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  ";
},"useData":true});
container["sidebar"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<aside class=\"menu\">\n  <section class=\"hero is-info\">\n    <div class=\"hero-body\">\n      <img src=\"images/logo.png\" style=\"width:75px;height:auto;\"/>\n    </div>\n  </section>\n  \n  <p class=\"menu-label\">\n    General\n  </p>\n  <ul class=\"menu-list\">\n    <li><a>Home</a></li>\n    <li><a>About</a></li>\n    <li><a>Disc</a></li>\n  </ul>\n  <p class=\"menu-label\">\n    Documentation\n  </p>\n  <ul class=\"menu-list\">\n    <li><a>Project Structure</a></li>\n    <li><a>Gulp Tasks</a></li>\n    <li><a>Handlebars</a></li>\n    <li><a>Workflow</a></li>\n    <li><a>Bulma CSS</a></li>\n    <li><a>External Documentation</a></li>\n  </ul>\n</aside>";
},"useData":true});
container["documentation"] = container["documentation"] || {};
container["documentation"]["bulma"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "   <h2 class=\"title\">Bulma CSS</h2>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "  <section class=\"section\">\n    <p class=\"box\">Coming Soon</p>\n  </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["documentation"] = container["documentation"] || {};
container["documentation"]["documentation"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <h2 class=\"title\">Generating Documentation</h2>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "  <section class=\"section\">\n    <p class=\"box\">Coming Soon</p>\n  </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["documentation"] = container["documentation"] || {};
container["documentation"]["external"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "    <h2 class=\"title\">External Information</h2>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "  <section class=\"section\">\n  <div class=\"columns\">\n    <div class=\"column\">\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Backbone</h2>\n        <ul>\n          <li><a href=\"http://backbonejs.org/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">doc.js</h2>\n        <ul>\n          <li><a href=\"http://documentation.js.org/\">official website</a></li>\n          <li><a href=\"https://github.com/documentationjs/documentation/blob/master/docs/GETTING_STARTED.md\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">scaleApp</h2>\n        <ul>\n          <li><a href=\"http://scaleapp.org/\">official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Zest</h2>\n        <ul>\n          <li><a href=\"https://github.com/chjj/zest\">Github</a></li>\n          <li><a href=\"https://www.npmjs.com/package/zest\">NPM Package</a></li>\n        </ul>\n      </div>\n    </div>\n    <div class=\"column\">\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Browserify</h2>\n        <ul>\n          <li><a href=\"http://browserify.org/\">Official Site</a></li>\n          <li><a href=\"https://github.com/substack/node-browserify#usage\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Atom.js</h2>\n        <ul>\n          <li><a href=\"https://www.npmjs.com/package/atom-js\">NPM Package</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Gulp</h2>\n        <ul>\n          <li><a href=\"http://gulpjs.com/\">Official website</a></li>\n          <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs\">Documentation (Github)</a></li>\n          <li><a href=\"http://gulpjs.org/recipes/\">Recipes (Gulp.js)</a></li>\n          <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs/recipes\">Recipes (Github)</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Handlebars</h2>\n        <ul>\n          <li><a href=\"http://handlebarsjs.com/\">Official website</a></li>\n        </ul>\n      </div>\n    </div>\n    <div class=\"column\">\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Mocha</h2>\n        <ul>\n          <li><a href=\"https://mochajs.org/\">Official website</a></li>\n          <li><a href=\"https://mochajl.readthedocs.io/en/latest/\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Surface CSS</h2>\n        <ul>\n          <li><a href=\"http://mildrenben.github.io/surface/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"box\">\n        <h2 class=\"subtitle\">Gulp Plugins</h2>\n        <ul>\n          <a href=\"https://www.npmjs.com/package/gulp-concat\">\n          gulp-concat\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-declare\">\n          gulp-declare\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-documentation\">\n          gulp-documentation\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-handlebars\">\n          gulp-handlebars\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-hub\">\n          gulp-hub\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-jshint\">\n          gulp-jshint\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-open\">\n          gulp-open\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-tap\">\n          gulp-tap\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-uglify\">\n          gulp-uglify\n        </a></li>\n        </ul>\n      </div>\n    </div>\n  </div>\n  </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["documentation"] = container["documentation"] || {};
container["documentation"]["gulp"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "   <h2 class=\"title\">Gulp</h2>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "  <section class=\"section\">\n    <p class=\"box\">Coming Soon</p>\n  </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["documentation"] = container["documentation"] || {};
container["documentation"]["handlebars"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "   <h2 class=\"title\">Handlebars</h2>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "  <section class=\"section\">\n    <p class=\"box\">Coming Soon</p>\n  </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["documentation"] = container["documentation"] || {};
container["documentation"]["structure"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "   <h2 class=\"title\">Project Structure</h2>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "  <section class=\"section\">\n    <p class=\"box\">Coming Soon</p>\n  </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["documentation"] = container["documentation"] || {};
container["documentation"]["workflow"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"header",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || alias2).call(alias1,"page",{"name":"content","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "   <h2 class=\"title\">Workflow</h2>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "  <section class=\"section\">\n    <p class=\"box\">Coming Soon</p>\n  </section>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.extend || (depth0 && depth0.extend) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"layout",{"name":"extend","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});; return container;}
},{}],"/home/flubber/projects/js/fluxbuild/source/view/page.js":[function(require,module,exports){
var SidebarView = require("./sidebar");

var PageView = function(data){
    this.el       = $(data.el)[0];
    this.template = data.template;
    this.model    = data.model;
};  

PageView.prototype.render = function(page,subpage) {
  let templatepage = subpage ? this.template[page][subpage] : this.template[page];
  this.el.innerHTML = templatepage(this.model);
}


module.exports = PageView;

},{"./sidebar":"/home/flubber/projects/js/fluxbuild/source/view/sidebar.js"}],"/home/flubber/projects/js/fluxbuild/source/view/sidebar.js":[function(require,module,exports){

var SidebarView = function(data){

    this.el = $(data.el)[0];
    this.template = data.template;
    this.model = data.model;
    this.nav = data.nav;
    this.render();

  this.el.addEventListener("click a",this.hide,this)
  
  this.render();
};

SidebarView.prototype.hide = function() {
    this.nav.checked = false;
}

SidebarView.prototype.render =  function() {
    this.el.innerHTML = this.template(this.model);
}
  
module.exports = SidebarView;

},{}]},{},["/home/flubber/projects/js/fluxbuild/source/index.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcvYXBwL2Fib3V0LmpzIiwiY29uZmlnL2FwcC9jb3JlLmpzIiwiY29uZmlnL2FwcC9pbmRleC5qcyIsImxpYi9mbHV4Ym90dGxlL2luZGV4LmpzIiwibGliL3V0aWwvcGVyZm5vdy5qcyIsImxpYi91dGlsL3N3YXBjc3MuanMiLCJub2RlX21vZHVsZXMvYm90dGxlanMvZGlzdC9ib3R0bGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy1sYXlvdXRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMucnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9kZWNvcmF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvZGVjb3JhdG9ycy9pbmxpbmUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9leGNlcHRpb24uanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9ibG9jay1oZWxwZXItbWlzc2luZy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvZWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaGVscGVyLW1pc3NpbmcuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2lmLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9sb2cuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2xvb2t1cC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvd2l0aC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2xvZ2dlci5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvbGlnaHRyb3V0ZXIvc3JjL2xpZ2h0cm91dGVyLmpzIiwibm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy96ZXN0L2xpYi96ZXN0LmpzIiwic291cmNlL2ZhY3RvcnkvcGFnZS5qcyIsInNvdXJjZS9mYWN0b3J5L3RlbXBsYXRlLmpzIiwic291cmNlL2luZGV4LmpzIiwic291cmNlL3NlcnZpY2UvY29uZmlnLmpzIiwic291cmNlL3NlcnZpY2Uvcm91dGVyLmpzIiwic291cmNlL3RlbXBsYXRlLmpzIiwic291cmNlL3ZpZXcvcGFnZS5qcyIsInNvdXJjZS92aWV3L3NpZGViYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNscEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbmFtZTogICAgICAgXCJGbHV4YnVpbGRcIixcbiAgZmlsZW5hbWU6ICAgXCJmbHV4YnVpbGRcIixcbiAgdmVyc2lvbjogICAgXCIxLjAuMFwiXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWJvdXQ6ICAgICAgcmVxdWlyZShcIi4vYWJvdXRcIiksXG4gIG1vZHVsZTogICAgIHJlcXVpcmUoXCIuL21vZHVsZVwiKSxcbiAgY29yZTogICAgICAgcmVxdWlyZShcIi4vY29yZVwiKVxufVxuIiwidmFyIHBlcmZub3cgICA9IHJlcXVpcmUoXCJ1dGlsL3BlcmZub3dcIik7XG5jb25zb2xlLmxvZyhcIkZsdXhib3R0bGUgQCBcIixuZXcgRGF0ZSgpLnRvU3RyaW5nKCkuc2xpY2UoMTYsIDI0KSxcIlt+XCIrcGVyZm5vdygpK1wibXNdXCIpO1xuXG52YXIgQm90dGxlID0gcmVxdWlyZShcImJvdHRsZWpzXCIpO1xuXG4vKipcbiAgVXNlZCBpbnRlcm5hbGx5IHRvIGluc3RhbnRpYXRlIGFuIGFwcGxpY2F0aW9uIHVzaW5nIHByb3ZpZGVkIGFyZ3VtZW50cyBhbmQgcmV0dXJucyBpdC5cbiAqXG4gICBAcGFyYW0ge29iamVjdH0gYXBwbGljYXRpb24gVGhlIG9iamVjdCBvbiB3aGljaCB0byBjYWxsIHRoZSBmdW5jdGlvbi5cbiAgIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgQ29uZmlndXJhdGlvbiBmaWxlXG4gICBAcGFyYW0ge29iamVjdH0gaW5jbHVkZSBIYXNobWFwIG9mIGluY2x1ZGFibGVzICggbGlicmFyaWVzIGUuZy4gKS5cbiAgIEBwYXJhbSB7b2JqZWN0fSBtb2R1bGVzIEhhc2htYXAgb2YgbW9kdWxlcy5cbiAgIEByZXR1cm5zIHtvYmplY3R9IEFuIGluc3RhbnRpYXRlZCBhcHBsaWNhdGlvblxuKi9cbmZ1bmN0aW9uIGluaXRpYWxpemUoYXBwLGNvbmZpZyxjb250ZW50KSB7XG4gIHZhciBib3R0bGUgPSBCb3R0bGUoY29uZmlnLmFib3V0LmZpbGVuYW1lKTtcbiAgdmFyIGRlcGVuZGVuY2llcyA9IFtdO1xuXG4gIE9iamVjdC5rZXlzKGNvbnRlbnQpLm1hcChmdW5jdGlvbih0eXBlKXtcbiAgICB2YXIgc3Vic2V0ID0gY29udGVudFt0eXBlXTtcbiAgICBPYmplY3Qua2V5cyhzdWJzZXQpLm1hcChmdW5jdGlvbihuYW1lKXtcbiAgICAgIHZhciByZWFsbmFtZSA9IG5hbWU7XG4gICAgICB2YXIgbmFtZSAgICAgPSBzdWJzZXRbbmFtZV0ubmFtZXx8bmFtZTtcblxuICAgICAgY29uc29sZS5sb2coXCJcXHRcIixcIkJvdHRsaW5nXCIsdHlwZSxuYW1lLFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpO1xuXG4gICAgICBib3R0bGVbdHlwZV0obmFtZSxzdWJzZXRbcmVhbG5hbWVdKTtcbiAgICAgIGRlcGVuZGVuY2llcy5wdXNoKG5hbWUpO1xuICAgIH0pXG4gIH0pXG5cbiAgdmFyIGFwcGRhdGEgPSBbY29uZmlnLmFib3V0LmZpbGVuYW1lLGFwcF0vLy5jb25jYXQoZGVwZW5kZW5jaWVzKTtcblxuICBib3R0bGUuZmFjdG9yeS5hcHBseShib3R0bGUsYXBwZGF0YSk7XG5cbiAgcmV0dXJuIGJvdHRsZTtcbn07XG5cbi8qKlxuICBJbml0aWFsaXplcyBhbiBhcHBsaWNhdGlvbiB1c2luZyBzdXBwbGllZCBhcmd1bWVudHMuXG4gIFVzdWFsbHkgY2FsbGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICAgQHBhcmFtIHtvYmplY3R9IGFwcGxpY2F0aW9uIFRoZSBvYmplY3Qgb24gd2hpY2ggdG8gY2FsbCB0aGUgZnVuY3Rpb24uXG4gICBAcGFyYW0ge29iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gZmlsZVxuICAgQHBhcmFtIHtvYmplY3R9IGluY2x1ZGUgSGFzaG1hcCBvZiBpbmNsdWRhYmxlcyAoIGxpYnJhcmllcyBlLmcuICkuXG4gICBAcGFyYW0ge29iamVjdH0gbW9kdWxlcyBIYXNobWFwIG9mIG1vZHVsZXMuXG4gICBAcmV0dXJucyB7b2JqZWN0fSBBbiBpbnN0YW50aWF0ZWQgYXBwbGljYXRpb25cbiovXG5mdW5jdGlvbiBzZXR1cChhcHBsaWNhdGlvbiwgY29uZmlnLCBjb250ZW50KSB7XG4gIGlmICh0aGlzLnN0YXJ0ZWQpXG4gICAgY29uc29sZS53YXJuKFwiV2FybmluZzogQXBwIHNldHVwIGNhbGxlZCB3aGlsZSBhbHJlYWR5IHN0YXJ0ZWRcIilcblxuICBjb25zb2xlLmxvZyhcIkluaXRpYWxpemluZyBBcHBsaWNhdGlvblwiLFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpO1xuXG4gIHRoaXMuYXBwID0gdGhpcy5pbml0aWFsaXplKGFwcGxpY2F0aW9uLCBjb25maWcsIGNvbnRlbnQpO1xuICBcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKXtcbiAgICB0aGlzLmFwcC5jb250YWluZXIuZmx1eGJ1aWxkLnN0YXJ0KCk7XG4gIH0pO1xuXG4gIGNvbnNvbGUubG9nKFwiRmluaXNoZWQgQXBwbGljYXRpb24gSW5pdGlhbGl6YXRpb24gW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpO1xuXG4gIHJldHVybiB0aGlzLmFwcDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhcHA6ICAgICAgICBudWxsLFxuICBzdGFydGVkOiAgICBmYWxzZSxcbiAgaW5pdGlhbGl6ZTogaW5pdGlhbGl6ZSxcbiAgc2V0dXA6ICAgICAgc2V0dXBcbn07XG4iLCJ2YXIgbm93ICAgICAgICA9IHJlcXVpcmUoXCJwZXJmb3JtYW5jZS1ub3dcIiksXG4gICAgX3RpbWUgICAgICA9IG5vdygpO1xuXG5mdW5jdGlvbiBlbGFwc2VkKHBhc3NlZCl7XG4gIHJldHVybiBub3coKS1wYXNzZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3ZlcnJpZGUpe1xuICBfdGltZSA9IG92ZXJyaWRlID8gX3RpbWUgPSBub3coKSA6IF90aW1lO1xuICB2YXIgb3V0ID0gZWxhcHNlZChfdGltZSkudG9TdHJpbmcoKTtcbiAgcmV0dXJuIG91dC5zbGljZSgwLG91dC5pbmRleE9mKFwiLlwiKSsyKTtcbn1cbiIsImZ1bmN0aW9uIHN3YXBDU1MoZWwscGF0aClcclxue1xyXG5cdGVsID0gZWwgfHwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICBsZXQgb3V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XHJcbiAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQob3V0KTtcclxuICAgICAgICAgICAgIHJldHVybiBvdXR9KCk7XHJcbiAgICAgICAgICAgICBcclxuICBsZXQgb3V0ID0ge1xyXG4gIFx0ZWw6ZWwsXHJcbiAgICBzd2FwOmZ1bmN0aW9uKHBhdGgpe1xyXG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3JlbCcsJ3N0eWxlc2hlZXQnKTtcclxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdocmVmJyxwYXRoKTtcclxuICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIGlmIChwYXRoKVxyXG4gIFx0b3V0LnN3YXAocGF0aClcclxuICAgIFxyXG4gIHJldHVybiBvdXRcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzd2FwQ1NTOyIsIjsoZnVuY3Rpb24odW5kZWZpbmVkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8qKlxuICAgICAqIEJvdHRsZUpTIHYxLjYuMSAtIDIwMTctMDUtMTdcbiAgICAgKiBBIHBvd2VyZnVsIGRlcGVuZGVuY3kgaW5qZWN0aW9uIG1pY3JvIGNvbnRhaW5lclxuICAgICAqXG4gICAgICogQ29weXJpZ2h0IChjKSAyMDE3IFN0ZXBoZW4gWW91bmdcbiAgICAgKiBMaWNlbnNlZCBNSVRcbiAgICAgKi9cbiAgICBcbiAgICAvKipcbiAgICAgKiBVbmlxdWUgaWQgY291bnRlcjtcbiAgICAgKlxuICAgICAqIEB0eXBlIE51bWJlclxuICAgICAqL1xuICAgIHZhciBpZCA9IDA7XG4gICAgXG4gICAgLyoqXG4gICAgICogTG9jYWwgc2xpY2UgYWxpYXNcbiAgICAgKlxuICAgICAqIEB0eXBlIEZ1bmN0aW9uc1xuICAgICAqL1xuICAgIHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBJdGVyYXRvciB1c2VkIHRvIHdhbGsgZG93biBhIG5lc3RlZCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBJZiBCb3R0bGUuY29uZmlnLnN0cmljdCBpcyB0cnVlLCB0aGlzIG1ldGhvZCB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBpdCBlbmNvdW50ZXJzIGFuXG4gICAgICogdW5kZWZpbmVkIHBhdGhcbiAgICAgKlxuICAgICAqIEBwYXJhbSBPYmplY3Qgb2JqXG4gICAgICogQHBhcmFtIFN0cmluZyBwcm9wXG4gICAgICogQHJldHVybiBtaXhlZFxuICAgICAqIEB0aHJvd3MgRXJyb3IgaWYgQm90dGxlIGlzIHVuYWJsZSB0byByZXNvbHZlIHRoZSByZXF1ZXN0ZWQgc2VydmljZS5cbiAgICAgKi9cbiAgICB2YXIgZ2V0TmVzdGVkID0gZnVuY3Rpb24gZ2V0TmVzdGVkKG9iaiwgcHJvcCkge1xuICAgICAgICB2YXIgc2VydmljZSA9IG9ialtwcm9wXTtcbiAgICAgICAgaWYgKHNlcnZpY2UgPT09IHVuZGVmaW5lZCAmJiBnbG9iYWxDb25maWcuc3RyaWN0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JvdHRsZSB3YXMgdW5hYmxlIHRvIHJlc29sdmUgYSBzZXJ2aWNlLiAgYCcgKyBwcm9wICsgJ2AgaXMgdW5kZWZpbmVkLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXJ2aWNlO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogR2V0IGEgbmVzdGVkIGJvdHRsZS4gV2lsbCBzZXQgYW5kIHJldHVybiBpZiBub3Qgc2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgZ2V0TmVzdGVkQm90dGxlID0gZnVuY3Rpb24gZ2V0TmVzdGVkQm90dGxlKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVzdGVkW25hbWVdIHx8ICh0aGlzLm5lc3RlZFtuYW1lXSA9IEJvdHRsZS5wb3AoKSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBHZXQgYSBzZXJ2aWNlIHN0b3JlZCB1bmRlciBhIG5lc3RlZCBrZXlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgZnVsbG5hbWVcbiAgICAgKiBAcmV0dXJuIFNlcnZpY2VcbiAgICAgKi9cbiAgICB2YXIgZ2V0TmVzdGVkU2VydmljZSA9IGZ1bmN0aW9uIGdldE5lc3RlZFNlcnZpY2UoZnVsbG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGxuYW1lLnNwbGl0KCcuJykucmVkdWNlKGdldE5lc3RlZCwgdGhpcyk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhIGNvbnN0YW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gbWl4ZWQgdmFsdWVcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBjb25zdGFudCA9IGZ1bmN0aW9uIGNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgbmFtZSA9IHBhcnRzLnBvcCgpO1xuICAgICAgICBkZWZpbmVDb25zdGFudC5jYWxsKHBhcnRzLnJlZHVjZShzZXRWYWx1ZU9iamVjdCwgdGhpcy5jb250YWluZXIpLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgdmFyIGRlZmluZUNvbnN0YW50ID0gZnVuY3Rpb24gZGVmaW5lQ29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZSA6IGZhbHNlLFxuICAgICAgICAgICAgZW51bWVyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZSA6IHZhbHVlLFxuICAgICAgICAgICAgd3JpdGFibGUgOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGRlY29yYXRvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgZnVsbG5hbWVcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gZnVuY1xuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGRlY29yYXRvciA9IGZ1bmN0aW9uIGRlY29yYXRvcihmdWxsbmFtZSwgZnVuYykge1xuICAgICAgICB2YXIgcGFydHMsIG5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgZnVsbG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGZ1bmMgPSBmdWxsbmFtZTtcbiAgICAgICAgICAgIGZ1bGxuYW1lID0gJ19fZ2xvYmFsX18nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHBhcnRzID0gZnVsbG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGdldE5lc3RlZEJvdHRsZS5jYWxsKHRoaXMsIG5hbWUpLmRlY29yYXRvcihwYXJ0cy5qb2luKCcuJyksIGZ1bmMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRlY29yYXRvcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRvcnNbbmFtZV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yc1tuYW1lXS5wdXNoKGZ1bmMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiBCb3R0bGUjcmVzb2x2ZSBpcyBjYWxsZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gZnVuY1xuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGRlZmVyID0gZnVuY3Rpb24gZGVmZXIoZnVuYykge1xuICAgICAgICB0aGlzLmRlZmVycmVkLnB1c2goZnVuYyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogSW1tZWRpYXRlbHkgaW5zdGFudGlhdGVzIHRoZSBwcm92aWRlZCBsaXN0IG9mIHNlcnZpY2VzIGFuZCByZXR1cm5zIHRoZW0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gQXJyYXkgc2VydmljZXNcbiAgICAgKiBAcmV0dXJuIEFycmF5IEFycmF5IG9mIGluc3RhbmNlcyAoaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSBwcm92aWRlZClcbiAgICAgKi9cbiAgICB2YXIgZGlnZXN0ID0gZnVuY3Rpb24gZGlnZXN0KHNlcnZpY2VzKSB7XG4gICAgICAgIHJldHVybiAoc2VydmljZXMgfHwgW10pLm1hcChnZXROZXN0ZWRTZXJ2aWNlLCB0aGlzLmNvbnRhaW5lcik7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhIGZhY3RvcnkgaW5zaWRlIGEgZ2VuZXJpYyBwcm92aWRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBGYWN0b3J5XG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgZmFjdG9yeSA9IGZ1bmN0aW9uIGZhY3RvcnkobmFtZSwgRmFjdG9yeSkge1xuICAgICAgICByZXR1cm4gcHJvdmlkZXIuY2FsbCh0aGlzLCBuYW1lLCBmdW5jdGlvbiBHZW5lcmljUHJvdmlkZXIoKSB7XG4gICAgICAgICAgICB0aGlzLiRnZXQgPSBGYWN0b3J5O1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGFuIGluc3RhbmNlIGZhY3RvcnkgaW5zaWRlIGEgZ2VuZXJpYyBmYWN0b3J5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgc2VydmljZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IEZhY3RvcnkgLSBUaGUgZmFjdG9yeSBmdW5jdGlvbiwgbWF0Y2hlcyB0aGUgc2lnbmF0dXJlIHJlcXVpcmVkIGZvciB0aGVcbiAgICAgKiBgZmFjdG9yeWAgbWV0aG9kXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgaW5zdGFuY2VGYWN0b3J5ID0gZnVuY3Rpb24gaW5zdGFuY2VGYWN0b3J5KG5hbWUsIEZhY3RvcnkpIHtcbiAgICAgICAgcmV0dXJuIGZhY3RvcnkuY2FsbCh0aGlzLCBuYW1lLCBmdW5jdGlvbiBHZW5lcmljSW5zdGFuY2VGYWN0b3J5KGNvbnRhaW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA6IEZhY3RvcnkuYmluZChGYWN0b3J5LCBjb250YWluZXIpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciByZW1vdmluZyBib3R0bGUgY29udGFpbmVyIG1ldGhvZHMgYW5kIHByb3ZpZGVycyBmcm9tIGEgbGlzdCBvZiBrZXlzXG4gICAgICovXG4gICAgdmFyIGJ5TWV0aG9kID0gZnVuY3Rpb24gYnlNZXRob2QobmFtZSkge1xuICAgICAgICByZXR1cm4gIS9eXFwkKD86ZGVjb3JhdG9yfHJlZ2lzdGVyfGxpc3QpJHxQcm92aWRlciQvLnRlc3QobmFtZSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBMaXN0IHRoZSBzZXJ2aWNlcyByZWdpc3RlcmVkIG9uIHRoZSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGNvbnRhaW5lclxuICAgICAqIEByZXR1cm4gQXJyYXlcbiAgICAgKi9cbiAgICB2YXIgbGlzdCA9IGZ1bmN0aW9uIGxpc3QoY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhjb250YWluZXIgfHwgdGhpcy5jb250YWluZXIgfHwge30pLmZpbHRlcihieU1ldGhvZCk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB1c2VkIGJ5IHByb3ZpZGVyIHRvIHNldCB1cCBtaWRkbGV3YXJlIGZvciBlYWNoIHJlcXVlc3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gTnVtYmVyIGlkXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIE9iamVjdCBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBPYmplY3QgY29udGFpbmVyXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgdmFyIGFwcGx5TWlkZGxld2FyZSA9IGZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZShtaWRkbGV3YXJlLCBuYW1lLCBpbnN0YW5jZSwgY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGUgOiB0cnVlXG4gICAgICAgIH07XG4gICAgICAgIGlmIChtaWRkbGV3YXJlLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVzY3JpcHRvci5nZXQgPSBmdW5jdGlvbiBnZXRXaXRoTWlkZGxld2VhcigpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gZnVuY3Rpb24gbmV4dE1pZGRsZXdhcmUoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWlkZGxld2FyZVtpbmRleF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZGRsZXdhcmVbaW5kZXgrK10oaW5zdGFuY2UsIG5leHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlc2NyaXB0b3IudmFsdWUgPSBpbnN0YW5jZTtcbiAgICAgICAgICAgIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb250YWluZXIsIG5hbWUsIGRlc2NyaXB0b3IpO1xuICAgIFxuICAgICAgICByZXR1cm4gY29udGFpbmVyW25hbWVdO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgbWlkZGxld2FyZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBmdW5jXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgbWlkZGxld2FyZSA9IGZ1bmN0aW9uIG1pZGRsZXdhcmUoZnVsbG5hbWUsIGZ1bmMpIHtcbiAgICAgICAgdmFyIHBhcnRzLCBuYW1lO1xuICAgICAgICBpZiAodHlwZW9mIGZ1bGxuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBmdW5jID0gZnVsbG5hbWU7XG4gICAgICAgICAgICBmdWxsbmFtZSA9ICdfX2dsb2JhbF9fJztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBwYXJ0cyA9IGZ1bGxuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgIG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBnZXROZXN0ZWRCb3R0bGUuY2FsbCh0aGlzLCBuYW1lKS5taWRkbGV3YXJlKHBhcnRzLmpvaW4oJy4nKSwgZnVuYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWlkZGxld2FyZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pZGRsZXdhcmVzW25hbWVdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1pZGRsZXdhcmVzW25hbWVdLnB1c2goZnVuYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBOYW1lZCBib3R0bGUgaW5zdGFuY2VzXG4gICAgICpcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICB2YXIgYm90dGxlcyA9IHt9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEdldCBhbiBpbnN0YW5jZSBvZiBib3R0bGUuXG4gICAgICpcbiAgICAgKiBJZiBhIG5hbWUgaXMgcHJvdmlkZWQgdGhlIGluc3RhbmNlIHdpbGwgYmUgc3RvcmVkIGluIGEgbG9jYWwgaGFzaC4gIENhbGxpbmcgQm90dGxlLnBvcCBtdWx0aXBsZVxuICAgICAqIHRpbWVzIHdpdGggdGhlIHNhbWUgbmFtZSB3aWxsIHJldHVybiB0aGUgc2FtZSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIHBvcCA9IGZ1bmN0aW9uIHBvcChuYW1lKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBib3R0bGVzW25hbWVdO1xuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGJvdHRsZXNbbmFtZV0gPSBpbnN0YW5jZSA9IG5ldyBCb3R0bGUoKTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5jb25zdGFudCgnQk9UVExFX05BTUUnLCBuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEJvdHRsZSgpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG5hbWVkIGJvdHRsZXMuXG4gICAgICovXG4gICAgdmFyIGNsZWFyID0gZnVuY3Rpb24gY2xlYXIobmFtZSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBkZWxldGUgYm90dGxlc1tuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvdHRsZXMgPSB7fTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogVXNlZCB0byBwcm9jZXNzIGRlY29yYXRvcnMgaW4gdGhlIHByb3ZpZGVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGluc3RhbmNlXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIGZ1bmNcbiAgICAgKiBAcmV0dXJuIE1peGVkXG4gICAgICovXG4gICAgdmFyIHJlZHVjZXIgPSBmdW5jdGlvbiByZWR1Y2VyKGluc3RhbmNlLCBmdW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jKGluc3RhbmNlKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgcHJvdmlkZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIGZ1bGxuYW1lXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIFByb3ZpZGVyXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgcHJvdmlkZXIgPSBmdW5jdGlvbiBwcm92aWRlcihmdWxsbmFtZSwgUHJvdmlkZXIpIHtcbiAgICAgICAgdmFyIHBhcnRzLCBuYW1lO1xuICAgICAgICBwYXJ0cyA9IGZ1bGxuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgIGlmICh0aGlzLnByb3ZpZGVyTWFwW2Z1bGxuYW1lXSAmJiBwYXJ0cy5sZW5ndGggPT09IDEgJiYgIXRoaXMuY29udGFpbmVyW2Z1bGxuYW1lICsgJ1Byb3ZpZGVyJ10pIHtcbiAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGZ1bGxuYW1lICsgJyBwcm92aWRlciBhbHJlYWR5IGluc3RhbnRpYXRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9yaWdpbmFsUHJvdmlkZXJzW2Z1bGxuYW1lXSA9IFByb3ZpZGVyO1xuICAgICAgICB0aGlzLnByb3ZpZGVyTWFwW2Z1bGxuYW1lXSA9IHRydWU7XG4gICAgXG4gICAgICAgIG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIFxuICAgICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjcmVhdGVTdWJQcm92aWRlci5jYWxsKHRoaXMsIG5hbWUsIFByb3ZpZGVyLCBwYXJ0cyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlUHJvdmlkZXIuY2FsbCh0aGlzLCBuYW1lLCBQcm92aWRlcik7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBHZXQgZGVjb3JhdG9ycyBhbmQgbWlkZGxld2FyZSBpbmNsdWRpbmcgZ2xvYmFsc1xuICAgICAqXG4gICAgICogQHJldHVybiBhcnJheVxuICAgICAqL1xuICAgIHZhciBnZXRXaXRoR2xvYmFsID0gZnVuY3Rpb24gZ2V0V2l0aEdsb2JhbChjb2xsZWN0aW9uLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiAoY29sbGVjdGlvbltuYW1lXSB8fCBbXSkuY29uY2F0KGNvbGxlY3Rpb24uX19nbG9iYWxfXyB8fCBbXSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGhlIHByb3ZpZGVyIHByb3BlcnRpZXMgb24gdGhlIGNvbnRhaW5lclxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIFByb3ZpZGVyXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgY3JlYXRlUHJvdmlkZXIgPSBmdW5jdGlvbiBjcmVhdGVQcm92aWRlcihuYW1lLCBQcm92aWRlcikge1xuICAgICAgICB2YXIgcHJvdmlkZXJOYW1lLCBwcm9wZXJ0aWVzLCBjb250YWluZXIsIGlkLCBkZWNvcmF0b3JzLCBtaWRkbGV3YXJlcztcbiAgICBcbiAgICAgICAgaWQgPSB0aGlzLmlkO1xuICAgICAgICBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcjtcbiAgICAgICAgZGVjb3JhdG9ycyA9IHRoaXMuZGVjb3JhdG9ycztcbiAgICAgICAgbWlkZGxld2FyZXMgPSB0aGlzLm1pZGRsZXdhcmVzO1xuICAgICAgICBwcm92aWRlck5hbWUgPSBuYW1lICsgJ1Byb3ZpZGVyJztcbiAgICBcbiAgICAgICAgcHJvcGVydGllcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHByb3BlcnRpZXNbcHJvdmlkZXJOYW1lXSA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIGdldCA6IGZ1bmN0aW9uIGdldFByb3ZpZGVyKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBQcm92aWRlcigpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb250YWluZXJbcHJvdmlkZXJOYW1lXTtcbiAgICAgICAgICAgICAgICBjb250YWluZXJbcHJvdmlkZXJOYW1lXSA9IGluc3RhbmNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAgcHJvcGVydGllc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIGdldCA6IGZ1bmN0aW9uIGdldFNlcnZpY2UoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gY29udGFpbmVyW3Byb3ZpZGVyTmFtZV07XG4gICAgICAgICAgICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgICAgICAgICAgIGlmIChwcm92aWRlcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgdGhyb3VnaCBkZWNvcmF0b3JzXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlID0gZ2V0V2l0aEdsb2JhbChkZWNvcmF0b3JzLCBuYW1lKS5yZWR1Y2UocmVkdWNlciwgcHJvdmlkZXIuJGdldChjb250YWluZXIpKTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbnRhaW5lcltwcm92aWRlck5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29udGFpbmVyW25hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2UgPT09IHVuZGVmaW5lZCA/IGluc3RhbmNlIDogYXBwbHlNaWRkbGV3YXJlKGdldFdpdGhHbG9iYWwobWlkZGxld2FyZXMsIG5hbWUpLFxuICAgICAgICAgICAgICAgICAgICBuYW1lLCBpbnN0YW5jZSwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICBcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoY29udGFpbmVyLCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgYm90dGxlIGNvbnRhaW5lciBvbiB0aGUgY3VycmVudCBib3R0bGUgY29udGFpbmVyLCBhbmQgcmVnaXN0ZXJzXG4gICAgICogdGhlIHByb3ZpZGVyIHVuZGVyIHRoZSBzdWIgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIFByb3ZpZGVyXG4gICAgICogQHBhcmFtIEFycmF5IHBhcnRzXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgY3JlYXRlU3ViUHJvdmlkZXIgPSBmdW5jdGlvbiBjcmVhdGVTdWJQcm92aWRlcihuYW1lLCBQcm92aWRlciwgcGFydHMpIHtcbiAgICAgICAgdmFyIGJvdHRsZTtcbiAgICAgICAgYm90dGxlID0gZ2V0TmVzdGVkQm90dGxlLmNhbGwodGhpcywgbmFtZSk7XG4gICAgICAgIHRoaXMuZmFjdG9yeShuYW1lLCBmdW5jdGlvbiBTdWJQcm92aWRlckZhY3RvcnkoKSB7XG4gICAgICAgICAgICByZXR1cm4gYm90dGxlLmNvbnRhaW5lcjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3R0bGUucHJvdmlkZXIocGFydHMuam9pbignLicpLCBQcm92aWRlcik7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhIHNlcnZpY2UsIGZhY3RvcnksIHByb3ZpZGVyLCBvciB2YWx1ZSBiYXNlZCBvbiBwcm9wZXJ0aWVzIG9uIHRoZSBvYmplY3QuXG4gICAgICpcbiAgICAgKiBwcm9wZXJ0aWVzOlxuICAgICAqICAqIE9iai4kbmFtZSAgIFN0cmluZyByZXF1aXJlZCBleDogYCdUaGluZydgXG4gICAgICogICogT2JqLiR0eXBlICAgU3RyaW5nIG9wdGlvbmFsICdzZXJ2aWNlJywgJ2ZhY3RvcnknLCAncHJvdmlkZXInLCAndmFsdWUnLiAgRGVmYXVsdDogJ3NlcnZpY2UnXG4gICAgICogICogT2JqLiRpbmplY3QgTWl4ZWQgIG9wdGlvbmFsIG9ubHkgdXNlZnVsIHdpdGggJHR5cGUgJ3NlcnZpY2UnIG5hbWUgb3IgYXJyYXkgb2YgbmFtZXNcbiAgICAgKiAgKiBPYmouJHZhbHVlICBNaXhlZCAgb3B0aW9uYWwgTm9ybWFsbHkgT2JqIGlzIHJlZ2lzdGVyZWQgb24gdGhlIGNvbnRhaW5lci4gIEhvd2V2ZXIsIGlmIHRoaXNcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkgaXMgaW5jbHVkZWQsIGl0J3MgdmFsdWUgd2lsbCBiZSByZWdpc3RlcmVkIG9uIHRoZSBjb250YWluZXJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgaW5zdGVhZCBvZiB0aGUgb2JqZWN0IGl0c3NlbGYuICBVc2VmdWwgZm9yIHJlZ2lzdGVyaW5nIG9iamVjdHMgb24gdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgIGJvdHRsZSBjb250YWluZXIgd2l0aG91dCBtb2RpZnlpbmcgdGhvc2Ugb2JqZWN0cyB3aXRoIGJvdHRsZSBzcGVjaWZpYyBrZXlzLlxuICAgICAqXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIE9ialxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIHJlZ2lzdGVyID0gZnVuY3Rpb24gcmVnaXN0ZXIoT2JqKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IE9iai4kdmFsdWUgPT09IHVuZGVmaW5lZCA/IE9iaiA6IE9iai4kdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzW09iai4kdHlwZSB8fCAnc2VydmljZSddLmFwcGx5KHRoaXMsIFtPYmouJG5hbWUsIHZhbHVlXS5jb25jYXQoT2JqLiRpbmplY3QgfHwgW10pKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgcHJvdmlkZXJzIGZyb20gdGhlIG1hcCBhbmQgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgdmFyIHJlbW92ZVByb3ZpZGVyTWFwID0gZnVuY3Rpb24gcmVzZXRQcm92aWRlcihuYW1lKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnByb3ZpZGVyTWFwW25hbWVdO1xuICAgICAgICBkZWxldGUgdGhpcy5jb250YWluZXJbbmFtZV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbnRhaW5lcltuYW1lICsgJ1Byb3ZpZGVyJ107XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXNldHMgYWxsIHByb3ZpZGVycyBvbiBhIGJvdHRsZSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqL1xuICAgIHZhciByZXNldFByb3ZpZGVycyA9IGZ1bmN0aW9uIHJlc2V0UHJvdmlkZXJzKCkge1xuICAgICAgICB2YXIgcHJvdmlkZXJzID0gdGhpcy5vcmlnaW5hbFByb3ZpZGVycztcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5vcmlnaW5hbFByb3ZpZGVycykuZm9yRWFjaChmdW5jdGlvbiByZXNldFBydmlkZXIocHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHByb3ZpZGVyLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVByb3ZpZGVyTWFwLmNhbGwodGhpcywgcGFydHNbMF0pO1xuICAgICAgICAgICAgICAgIHBhcnRzLmZvckVhY2gocmVtb3ZlUHJvdmlkZXJNYXAsIGdldE5lc3RlZEJvdHRsZS5jYWxsKHRoaXMsIHBhcnRzWzBdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZW1vdmVQcm92aWRlck1hcC5jYWxsKHRoaXMsIHByb3ZpZGVyKTtcbiAgICAgICAgICAgIHRoaXMucHJvdmlkZXIocHJvdmlkZXIsIHByb3ZpZGVyc1twcm92aWRlcl0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYW55IGRlZmVycmVkIGZ1bmN0aW9uc1xuICAgICAqXG4gICAgICogQHBhcmFtIE1peGVkIGRhdGFcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciByZXNvbHZlID0gZnVuY3Rpb24gcmVzb2x2ZShkYXRhKSB7XG4gICAgICAgIHRoaXMuZGVmZXJyZWQuZm9yRWFjaChmdW5jdGlvbiBkZWZlcnJlZEl0ZXJhdG9yKGZ1bmMpIHtcbiAgICAgICAgICAgIGZ1bmMoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgc2VydmljZSBpbnNpZGUgYSBnZW5lcmljIGZhY3RvcnkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gU2VydmljZVxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIHNlcnZpY2UgPSBmdW5jdGlvbiBzZXJ2aWNlKG5hbWUsIFNlcnZpY2UpIHtcbiAgICAgICAgdmFyIGRlcHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSA6IG51bGw7XG4gICAgICAgIHZhciBib3R0bGUgPSB0aGlzO1xuICAgICAgICByZXR1cm4gZmFjdG9yeS5jYWxsKHRoaXMsIG5hbWUsIGZ1bmN0aW9uIEdlbmVyaWNGYWN0b3J5KCkge1xuICAgICAgICAgICAgdmFyIFNlcnZpY2VDb3B5ID0gU2VydmljZTtcbiAgICAgICAgICAgIGlmIChkZXBzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBkZXBzLm1hcChnZXROZXN0ZWRTZXJ2aWNlLCBib3R0bGUuY29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBhcmdzLnVuc2hpZnQoU2VydmljZSk7XG4gICAgICAgICAgICAgICAgU2VydmljZUNvcHkgPSBTZXJ2aWNlLmJpbmQuYXBwbHkoU2VydmljZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNlcnZpY2VDb3B5KCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSB2YWx1ZVxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIG1peGVkIHZhbFxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIHZhbHVlID0gZnVuY3Rpb24gdmFsdWUobmFtZSwgdmFsKSB7XG4gICAgICAgIHZhciBwYXJ0cztcbiAgICAgICAgcGFydHMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgIG5hbWUgPSBwYXJ0cy5wb3AoKTtcbiAgICAgICAgZGVmaW5lVmFsdWUuY2FsbChwYXJ0cy5yZWR1Y2Uoc2V0VmFsdWVPYmplY3QsIHRoaXMuY29udGFpbmVyKSwgbmFtZSwgdmFsKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBJdGVyYXRvciBmb3Igc2V0dGluZyBhIHBsYWluIG9iamVjdCBsaXRlcmFsIHZpYSBkZWZpbmVWYWx1ZVxuICAgICAqXG4gICAgICogQHBhcmFtIE9iamVjdCBjb250YWluZXJcbiAgICAgKiBAcGFyYW0gc3RyaW5nIG5hbWVcbiAgICAgKi9cbiAgICB2YXIgc2V0VmFsdWVPYmplY3QgPSBmdW5jdGlvbiBzZXRWYWx1ZU9iamVjdChjb250YWluZXIsIG5hbWUpIHtcbiAgICAgICAgdmFyIG5lc3RlZENvbnRhaW5lciA9IGNvbnRhaW5lcltuYW1lXTtcbiAgICAgICAgaWYgKCFuZXN0ZWRDb250YWluZXIpIHtcbiAgICAgICAgICAgIG5lc3RlZENvbnRhaW5lciA9IHt9O1xuICAgICAgICAgICAgZGVmaW5lVmFsdWUuY2FsbChjb250YWluZXIsIG5hbWUsIG5lc3RlZENvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lc3RlZENvbnRhaW5lcjtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIERlZmluZSBhIG11dGFibGUgcHJvcGVydHkgb24gdGhlIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBtaXhlZCB2YWxcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKiBAc2NvcGUgY29udGFpbmVyXG4gICAgICovXG4gICAgdmFyIGRlZmluZVZhbHVlID0gZnVuY3Rpb24gZGVmaW5lVmFsdWUobmFtZSwgdmFsKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZSA6IHZhbCxcbiAgICAgICAgICAgIHdyaXRhYmxlIDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEJvdHRsZSBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lIE9wdGlvbmFsIG5hbWUgZm9yIGZ1bmN0aW9uYWwgY29uc3RydWN0aW9uXG4gICAgICovXG4gICAgdmFyIEJvdHRsZSA9IGZ1bmN0aW9uIEJvdHRsZShuYW1lKSB7XG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCb3R0bGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gQm90dGxlLnBvcChuYW1lKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB0aGlzLmlkID0gaWQrKztcbiAgICBcbiAgICAgICAgdGhpcy5kZWNvcmF0b3JzID0ge307XG4gICAgICAgIHRoaXMubWlkZGxld2FyZXMgPSB7fTtcbiAgICAgICAgdGhpcy5uZXN0ZWQgPSB7fTtcbiAgICAgICAgdGhpcy5wcm92aWRlck1hcCA9IHt9O1xuICAgICAgICB0aGlzLm9yaWdpbmFsUHJvdmlkZXJzID0ge307XG4gICAgICAgIHRoaXMuZGVmZXJyZWQgPSBbXTtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSB7XG4gICAgICAgICAgICAkZGVjb3JhdG9yIDogZGVjb3JhdG9yLmJpbmQodGhpcyksXG4gICAgICAgICAgICAkcmVnaXN0ZXIgOiByZWdpc3Rlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJGxpc3QgOiBsaXN0LmJpbmQodGhpcylcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJvdHRsZSBwcm90b3R5cGVcbiAgICAgKi9cbiAgICBCb3R0bGUucHJvdG90eXBlID0ge1xuICAgICAgICBjb25zdGFudCA6IGNvbnN0YW50LFxuICAgICAgICBkZWNvcmF0b3IgOiBkZWNvcmF0b3IsXG4gICAgICAgIGRlZmVyIDogZGVmZXIsXG4gICAgICAgIGRpZ2VzdCA6IGRpZ2VzdCxcbiAgICAgICAgZmFjdG9yeSA6IGZhY3RvcnksXG4gICAgICAgIGluc3RhbmNlRmFjdG9yeTogaW5zdGFuY2VGYWN0b3J5LFxuICAgICAgICBsaXN0IDogbGlzdCxcbiAgICAgICAgbWlkZGxld2FyZSA6IG1pZGRsZXdhcmUsXG4gICAgICAgIHByb3ZpZGVyIDogcHJvdmlkZXIsXG4gICAgICAgIHJlc2V0UHJvdmlkZXJzIDogcmVzZXRQcm92aWRlcnMsXG4gICAgICAgIHJlZ2lzdGVyIDogcmVnaXN0ZXIsXG4gICAgICAgIHJlc29sdmUgOiByZXNvbHZlLFxuICAgICAgICBzZXJ2aWNlIDogc2VydmljZSxcbiAgICAgICAgdmFsdWUgOiB2YWx1ZVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQm90dGxlIHN0YXRpY1xuICAgICAqL1xuICAgIEJvdHRsZS5wb3AgPSBwb3A7XG4gICAgQm90dGxlLmNsZWFyID0gY2xlYXI7XG4gICAgQm90dGxlLmxpc3QgPSBsaXN0O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEdsb2JhbCBjb25maWdcbiAgICAgKi9cbiAgICB2YXIgZ2xvYmFsQ29uZmlnID0gQm90dGxlLmNvbmZpZyA9IHtcbiAgICAgICAgc3RyaWN0IDogZmFsc2VcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4cG9ydHMgc2NyaXB0IGFkYXB0ZWQgZnJvbSBsb2Rhc2ggdjIuNC4xIE1vZGVybiBCdWlsZFxuICAgICAqXG4gICAgICogQHNlZSBodHRwOi8vbG9kYXNoLmNvbS9cbiAgICAgKi9cbiAgICBcbiAgICAvKipcbiAgICAgKiBWYWxpZCBvYmplY3QgdHlwZSBtYXBcbiAgICAgKlxuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIHZhciBvYmplY3RUeXBlcyA9IHtcbiAgICAgICAgJ2Z1bmN0aW9uJyA6IHRydWUsXG4gICAgICAgICdvYmplY3QnIDogdHJ1ZVxuICAgIH07XG4gICAgXG4gICAgKGZ1bmN0aW9uIGV4cG9ydEJvdHRsZShyb290KSB7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGcmVlIHZhcmlhYmxlIGV4cG9ydHNcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIHZhciBmcmVlRXhwb3J0cyA9IG9iamVjdFR5cGVzW3R5cGVvZiBleHBvcnRzXSAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGcmVlIHZhcmlhYmxlIG1vZHVsZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgICovXG4gICAgICAgIHZhciBmcmVlTW9kdWxlID0gb2JqZWN0VHlwZXNbdHlwZW9mIG1vZHVsZV0gJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQ29tbW9uSlMgbW9kdWxlLmV4cG9ydHNcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIHZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzICYmIGZyZWVFeHBvcnRzO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRnJlZSB2YXJpYWJsZSBgZ2xvYmFsYFxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgICovXG4gICAgICAgIHZhciBmcmVlR2xvYmFsID0gb2JqZWN0VHlwZXNbdHlwZW9mIGdsb2JhbF0gJiYgZ2xvYmFsO1xuICAgICAgICBpZiAoZnJlZUdsb2JhbCAmJiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpKSB7XG4gICAgICAgICAgICByb290ID0gZnJlZUdsb2JhbDtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRXhwb3J0XG4gICAgICAgICAqL1xuICAgICAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAgICAgcm9vdC5Cb3R0bGUgPSBCb3R0bGU7XG4gICAgICAgICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBCb3R0bGU7IH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcbiAgICAgICAgICAgIGlmIChtb2R1bGVFeHBvcnRzKSB7XG4gICAgICAgICAgICAgICAgKGZyZWVNb2R1bGUuZXhwb3J0cyA9IEJvdHRsZSkuQm90dGxlID0gQm90dGxlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmcmVlRXhwb3J0cy5Cb3R0bGUgPSBCb3R0bGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb290LkJvdHRsZSA9IEJvdHRsZTtcbiAgICAgICAgfVxuICAgIH0oKG9iamVjdFR5cGVzW3R5cGVvZiB3aW5kb3ddICYmIHdpbmRvdykgfHwgdGhpcykpO1xuICAgIFxufS5jYWxsKHRoaXMpKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5mdW5jdGlvbiBub29wKCkge1xuXHRyZXR1cm4gJyc7XG59XG5cbmZ1bmN0aW9uIGdldFN0YWNrKGNvbnRleHQpIHtcblx0cmV0dXJuIGNvbnRleHQuJCRsYXlvdXRTdGFjayB8fCAoXG5cdFx0Y29udGV4dC4kJGxheW91dFN0YWNrID0gW11cblx0KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdGFjayhjb250ZXh0KSB7XG5cdHZhciBzdGFjayA9IGdldFN0YWNrKGNvbnRleHQpO1xuXG5cdHdoaWxlIChzdGFjay5sZW5ndGgpIHtcblx0XHRzdGFjay5zaGlmdCgpKGNvbnRleHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbnMoY29udGV4dCkge1xuXHRyZXR1cm4gY29udGV4dC4kJGxheW91dEFjdGlvbnMgfHwgKFxuXHRcdGNvbnRleHQuJCRsYXlvdXRBY3Rpb25zID0ge31cblx0KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uc0J5TmFtZShjb250ZXh0LCBuYW1lKSB7XG5cdHZhciBhY3Rpb25zID0gZ2V0QWN0aW9ucyhjb250ZXh0KTtcblxuXHRyZXR1cm4gYWN0aW9uc1tuYW1lXSB8fCAoXG5cdFx0YWN0aW9uc1tuYW1lXSA9IFtdXG5cdCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5QWN0aW9uKHZhbCwgYWN0aW9uKSB7XG5cdHZhciBjb250ZXh0ID0gdGhpcztcblxuXHRmdW5jdGlvbiBmbigpIHtcblx0XHRyZXR1cm4gYWN0aW9uLmZuKGNvbnRleHQsIGFjdGlvbi5vcHRpb25zKTtcblx0fVxuXG5cdHN3aXRjaCAoYWN0aW9uLm1vZGUpIHtcblx0XHRjYXNlICdhcHBlbmQnOiB7XG5cdFx0XHRyZXR1cm4gdmFsICsgZm4oKTtcblx0XHR9XG5cblx0XHRjYXNlICdwcmVwZW5kJzoge1xuXHRcdFx0cmV0dXJuIGZuKCkgKyB2YWw7XG5cdFx0fVxuXG5cdFx0Y2FzZSAncmVwbGFjZSc6IHtcblx0XHRcdHJldHVybiBmbigpO1xuXHRcdH1cblxuXHRcdGRlZmF1bHQ6IHtcblx0XHRcdHJldHVybiB2YWw7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIG1peGluKHRhcmdldCkge1xuXHR2YXIgYXJnLCBrZXksXG5cdFx0bGVuID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRpID0gMTtcblxuXHRmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0YXJnID0gYXJndW1lbnRzW2ldO1xuXG5cdFx0aWYgKCFhcmcpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGZvciAoa2V5IGluIGFyZykge1xuXHRcdFx0Ly8gaXN0YW5idWwgaWdub3JlIGVsc2Vcblx0XHRcdGlmIChoYXNPd24uY2FsbChhcmcsIGtleSkpIHtcblx0XHRcdFx0dGFyZ2V0W2tleV0gPSBhcmdba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdGFyZ2V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhbiBvYmplY3Qgb2YgbGF5b3V0IGhlbHBlcnMuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICogQHBhcmFtIHtPYmplY3R9IGhhbmRsZWJhcnMgSGFuZGxlYmFycyBpbnN0YW5jZS5cbiAqIEByZXR1cm4ge09iamVjdH0gT2JqZWN0IG9mIGhlbHBlcnMuXG4gKi9cbmZ1bmN0aW9uIGxheW91dHMoaGFuZGxlYmFycykge1xuXHR2YXIgaGVscGVycyA9IHtcblx0XHQvKipcblx0XHQgKiBAbWV0aG9kIGV4dGVuZFxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG5cdFx0ICogQHBhcmFtIHs/T2JqZWN0fSBjdXN0b21Db250ZXh0XG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9uKE9iamVjdCl9IG9wdGlvbnMuZm5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5oYXNoXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBSZW5kZXJlZCBwYXJ0aWFsLlxuXHRcdCAqL1xuXHRcdGV4dGVuZDogZnVuY3Rpb24gKG5hbWUsIGN1c3RvbUNvbnRleHQsIG9wdGlvbnMpIHtcblx0XHRcdC8vIE1ha2UgYGN1c3RvbUNvbnRleHRgIG9wdGlvbmFsXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcblx0XHRcdFx0b3B0aW9ucyA9IGN1c3RvbUNvbnRleHQ7XG5cdFx0XHRcdGN1c3RvbUNvbnRleHQgPSBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdFx0dmFyIGZuID0gb3B0aW9ucy5mbiB8fCBub29wLFxuXHRcdFx0XHRjb250ZXh0ID0gbWl4aW4oe30sIHRoaXMsIGN1c3RvbUNvbnRleHQsIG9wdGlvbnMuaGFzaCksXG5cdFx0XHRcdGRhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSksXG5cdFx0XHRcdHRlbXBsYXRlID0gaGFuZGxlYmFycy5wYXJ0aWFsc1tuYW1lXTtcblxuXHRcdFx0Ly8gUGFydGlhbCB0ZW1wbGF0ZSByZXF1aXJlZFxuXHRcdFx0aWYgKHRlbXBsYXRlID09IG51bGwpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHBhcnRpYWw6IFxcJycgKyBuYW1lICsgJ1xcJycpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDb21waWxlIHBhcnRpYWwsIGlmIG5lZWRlZFxuXHRcdFx0aWYgKHR5cGVvZiB0ZW1wbGF0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHR0ZW1wbGF0ZSA9IGhhbmRsZWJhcnMuY29tcGlsZSh0ZW1wbGF0ZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFkZCBvdmVycmlkZXMgdG8gc3RhY2tcblx0XHRcdGdldFN0YWNrKGNvbnRleHQpLnB1c2goZm4pO1xuXG5cdFx0XHQvLyBSZW5kZXIgcGFydGlhbFxuXHRcdFx0cmV0dXJuIHRlbXBsYXRlKGNvbnRleHQsIHsgZGF0YTogZGF0YSB9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQG1ldGhvZCBlbWJlZFxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG5cdFx0ICogQHBhcmFtIHs/T2JqZWN0fSBjdXN0b21Db250ZXh0XG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9uKE9iamVjdCl9IG9wdGlvbnMuZm5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5oYXNoXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBSZW5kZXJlZCBwYXJ0aWFsLlxuXHRcdCAqL1xuXHRcdGVtYmVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgY29udGV4dCA9IG1peGluKHt9LCB0aGlzIHx8IHt9KTtcblxuXHRcdFx0Ly8gUmVzZXQgY29udGV4dFxuXHRcdFx0Y29udGV4dC4kJGxheW91dFN0YWNrID0gbnVsbDtcblx0XHRcdGNvbnRleHQuJCRsYXlvdXRBY3Rpb25zID0gbnVsbDtcblxuXHRcdFx0Ly8gRXh0ZW5kXG5cdFx0XHRyZXR1cm4gaGVscGVycy5leHRlbmQuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQG1ldGhvZCBibG9ja1xuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9uKE9iamVjdCl9IG9wdGlvbnMuZm5cblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IE1vZGlmaWVkIGJsb2NrIGNvbnRlbnQuXG5cdFx0ICovXG5cdFx0YmxvY2s6IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdFx0dmFyIGZuID0gb3B0aW9ucy5mbiB8fCBub29wLFxuXHRcdFx0XHRkYXRhID0gaGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpLFxuXHRcdFx0XHRjb250ZXh0ID0gdGhpcyB8fCB7fTtcblxuXHRcdFx0YXBwbHlTdGFjayhjb250ZXh0KTtcblxuXHRcdFx0cmV0dXJuIGdldEFjdGlvbnNCeU5hbWUoY29udGV4dCwgbmFtZSkucmVkdWNlKFxuXHRcdFx0XHRhcHBseUFjdGlvbi5iaW5kKGNvbnRleHQpLFxuXHRcdFx0XHRmbihjb250ZXh0LCB7IGRhdGE6IGRhdGEgfSlcblx0XHRcdCk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgY29udGVudFxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9uKE9iamVjdCl9IG9wdGlvbnMuZm5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5oYXNoXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuaGFzaC5tb2RlXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBBbHdheXMgZW1wdHkuXG5cdFx0ICovXG5cdFx0Y29udGVudDogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0XHR2YXIgZm4gPSBvcHRpb25zLmZuLFxuXHRcdFx0XHRkYXRhID0gaGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpLFxuXHRcdFx0XHRoYXNoID0gb3B0aW9ucy5oYXNoIHx8IHt9LFxuXHRcdFx0XHRtb2RlID0gaGFzaC5tb2RlIHx8ICdyZXBsYWNlJyxcblx0XHRcdFx0Y29udGV4dCA9IHRoaXMgfHwge307XG5cblx0XHRcdGFwcGx5U3RhY2soY29udGV4dCk7XG5cblx0XHRcdC8vIEdldHRlclxuXHRcdFx0aWYgKCFmbikge1xuXHRcdFx0XHRyZXR1cm4gbmFtZSBpbiBnZXRBY3Rpb25zKGNvbnRleHQpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZXR0ZXJcblx0XHRcdGdldEFjdGlvbnNCeU5hbWUoY29udGV4dCwgbmFtZSkucHVzaCh7XG5cdFx0XHRcdG9wdGlvbnM6IHsgZGF0YTogZGF0YSB9LFxuXHRcdFx0XHRtb2RlOiBtb2RlLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdGZuOiBmblxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiBoZWxwZXJzO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBsYXlvdXQgaGVscGVycyBvbiBhIEhhbmRsZWJhcnMgaW5zdGFuY2UuXG4gKlxuICogQG1ldGhvZCByZWdpc3RlclxuICogQHBhcmFtIHtPYmplY3R9IGhhbmRsZWJhcnMgSGFuZGxlYmFycyBpbnN0YW5jZS5cbiAqIEByZXR1cm4ge09iamVjdH0gT2JqZWN0IG9mIGhlbHBlcnMuXG4gKiBAc3RhdGljXG4gKi9cbmxheW91dHMucmVnaXN0ZXIgPSBmdW5jdGlvbiAoaGFuZGxlYmFycykge1xuXHR2YXIgaGVscGVycyA9IGxheW91dHMoaGFuZGxlYmFycyk7XG5cblx0aGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihoZWxwZXJzKTtcblxuXHRyZXR1cm4gaGVscGVycztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbGF5b3V0cztcbiIsImltcG9ydCAqIGFzIGJhc2UgZnJvbSAnLi9oYW5kbGViYXJzL2Jhc2UnO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxuaW1wb3J0IFNhZmVTdHJpbmcgZnJvbSAnLi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi9oYW5kbGViYXJzL2V4Y2VwdGlvbic7XG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuL2hhbmRsZWJhcnMvdXRpbHMnO1xuaW1wb3J0ICogYXMgcnVudGltZSBmcm9tICcuL2hhbmRsZWJhcnMvcnVudGltZSc7XG5cbmltcG9ydCBub0NvbmZsaWN0IGZyb20gJy4vaGFuZGxlYmFycy9uby1jb25mbGljdCc7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxuZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gU2FmZVN0cmluZztcbiAgaGIuRXhjZXB0aW9uID0gRXhjZXB0aW9uO1xuICBoYi5VdGlscyA9IFV0aWxzO1xuICBoYi5lc2NhcGVFeHByZXNzaW9uID0gVXRpbHMuZXNjYXBlRXhwcmVzc2lvbjtcblxuICBoYi5WTSA9IHJ1bnRpbWU7XG4gIGhiLnRlbXBsYXRlID0gZnVuY3Rpb24oc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59XG5cbmxldCBpbnN0ID0gY3JlYXRlKCk7XG5pbnN0LmNyZWF0ZSA9IGNyZWF0ZTtcblxubm9Db25mbGljdChpbnN0KTtcblxuaW5zdFsnZGVmYXVsdCddID0gaW5zdDtcblxuZXhwb3J0IGRlZmF1bHQgaW5zdDtcbiIsImltcG9ydCB7Y3JlYXRlRnJhbWUsIGV4dGVuZCwgdG9TdHJpbmd9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2V4Y2VwdGlvbic7XG5pbXBvcnQge3JlZ2lzdGVyRGVmYXVsdEhlbHBlcnN9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQge3JlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnN9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcblxuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSAnNC4wLjExJztcbmV4cG9ydCBjb25zdCBDT01QSUxFUl9SRVZJU0lPTiA9IDc7XG5cbmV4cG9ydCBjb25zdCBSRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz09IDEueC54JyxcbiAgNTogJz09IDIuMC4wLWFscGhhLngnLFxuICA2OiAnPj0gMi4wLjAtYmV0YS4xJyxcbiAgNzogJz49IDQuMC4wJ1xufTtcblxuY29uc3Qgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5leHBvcnQgZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzLCBkZWNvcmF0b3JzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcbiAgdGhpcy5kZWNvcmF0b3JzID0gZGVjb3JhdG9ycyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xuICByZWdpc3RlckRlZmF1bHREZWNvcmF0b3JzKHRoaXMpO1xufVxuXG5IYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZ2dlci5sb2csXG5cbiAgcmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgICAgZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmhlbHBlcnNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lLCBwYXJ0aWFsKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGV4dGVuZCh0aGlzLnBhcnRpYWxzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBwYXJ0aWFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKGBBdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIGEgcGFydGlhbCBjYWxsZWQgXCIke25hbWV9XCIgYXMgdW5kZWZpbmVkYCk7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gcGFydGlhbDtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMucGFydGlhbHNbbmFtZV07XG4gIH0sXG5cbiAgcmVnaXN0ZXJEZWNvcmF0b3I6IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICAgIGlmIChmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGRlY29yYXRvcnMnKTsgfVxuICAgICAgZXh0ZW5kKHRoaXMuZGVjb3JhdG9ycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVjb3JhdG9yc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlckRlY29yYXRvcjogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRvcnNbbmFtZV07XG4gIH1cbn07XG5cbmV4cG9ydCBsZXQgbG9nID0gbG9nZ2VyLmxvZztcblxuZXhwb3J0IHtjcmVhdGVGcmFtZSwgbG9nZ2VyfTtcbiIsImltcG9ydCByZWdpc3RlcklubGluZSBmcm9tICcuL2RlY29yYXRvcnMvaW5saW5lJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnMoaW5zdGFuY2UpIHtcbiAgcmVnaXN0ZXJJbmxpbmUoaW5zdGFuY2UpO1xufVxuXG4iLCJpbXBvcnQge2V4dGVuZH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckRlY29yYXRvcignaW5saW5lJywgZnVuY3Rpb24oZm4sIHByb3BzLCBjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICBsZXQgcmV0ID0gZm47XG4gICAgaWYgKCFwcm9wcy5wYXJ0aWFscykge1xuICAgICAgcHJvcHMucGFydGlhbHMgPSB7fTtcbiAgICAgIHJldCA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHBhcnRpYWxzIHN0YWNrIGZyYW1lIHByaW9yIHRvIGV4ZWMuXG4gICAgICAgIGxldCBvcmlnaW5hbCA9IGNvbnRhaW5lci5wYXJ0aWFscztcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gZXh0ZW5kKHt9LCBvcmlnaW5hbCwgcHJvcHMucGFydGlhbHMpO1xuICAgICAgICBsZXQgcmV0ID0gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9yaWdpbmFsO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBwcm9wcy5wYXJ0aWFsc1tvcHRpb25zLmFyZ3NbMF1dID0gb3B0aW9ucy5mbjtcblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuIiwiXG5jb25zdCBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgbGV0IGxvYyA9IG5vZGUgJiYgbm9kZS5sb2MsXG4gICAgICBsaW5lLFxuICAgICAgY29sdW1uO1xuICBpZiAobG9jKSB7XG4gICAgbGluZSA9IGxvYy5zdGFydC5saW5lO1xuICAgIGNvbHVtbiA9IGxvYy5zdGFydC5jb2x1bW47XG5cbiAgICBtZXNzYWdlICs9ICcgLSAnICsgbGluZSArICc6JyArIGNvbHVtbjtcbiAgfVxuXG4gIGxldCB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBFeGNlcHRpb24pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAobG9jKSB7XG4gICAgICB0aGlzLmxpbmVOdW1iZXIgPSBsaW5lO1xuXG4gICAgICAvLyBXb3JrIGFyb3VuZCBpc3N1ZSB1bmRlciBzYWZhcmkgd2hlcmUgd2UgY2FuJ3QgZGlyZWN0bHkgc2V0IHRoZSBjb2x1bW4gdmFsdWVcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29sdW1uJywge1xuICAgICAgICAgIHZhbHVlOiBjb2x1bW4sXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAobm9wKSB7XG4gICAgLyogSWdub3JlIGlmIHRoZSBicm93c2VyIGlzIHZlcnkgcGFydGljdWxhciAqL1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0IGRlZmF1bHQgRXhjZXB0aW9uO1xuIiwiaW1wb3J0IHJlZ2lzdGVyQmxvY2tIZWxwZXJNaXNzaW5nIGZyb20gJy4vaGVscGVycy9ibG9jay1oZWxwZXItbWlzc2luZyc7XG5pbXBvcnQgcmVnaXN0ZXJFYWNoIGZyb20gJy4vaGVscGVycy9lYWNoJztcbmltcG9ydCByZWdpc3RlckhlbHBlck1pc3NpbmcgZnJvbSAnLi9oZWxwZXJzL2hlbHBlci1taXNzaW5nJztcbmltcG9ydCByZWdpc3RlcklmIGZyb20gJy4vaGVscGVycy9pZic7XG5pbXBvcnQgcmVnaXN0ZXJMb2cgZnJvbSAnLi9oZWxwZXJzL2xvZyc7XG5pbXBvcnQgcmVnaXN0ZXJMb29rdXAgZnJvbSAnLi9oZWxwZXJzL2xvb2t1cCc7XG5pbXBvcnQgcmVnaXN0ZXJXaXRoIGZyb20gJy4vaGVscGVycy93aXRoJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnMoaW5zdGFuY2UpIHtcbiAgcmVnaXN0ZXJCbG9ja0hlbHBlck1pc3NpbmcoaW5zdGFuY2UpO1xuICByZWdpc3RlckVhY2goaW5zdGFuY2UpO1xuICByZWdpc3RlckhlbHBlck1pc3NpbmcoaW5zdGFuY2UpO1xuICByZWdpc3RlcklmKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJMb2coaW5zdGFuY2UpO1xuICByZWdpc3Rlckxvb2t1cChpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyV2l0aChpbnN0YW5jZSk7XG59XG4iLCJpbXBvcnQge2FwcGVuZENvbnRleHRQYXRoLCBjcmVhdGVGcmFtZSwgaXNBcnJheX0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIGxldCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgIGlmIChjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgICAgb3B0aW9ucy5pZHMgPSBbb3B0aW9ucy5uYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICBsZXQgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgICAgIG9wdGlvbnMgPSB7ZGF0YTogZGF0YX07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH0pO1xufVxuIiwiaW1wb3J0IHthcHBlbmRDb250ZXh0UGF0aCwgYmxvY2tQYXJhbXMsIGNyZWF0ZUZyYW1lLCBpc0FycmF5LCBpc0Z1bmN0aW9ufSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4uL2V4Y2VwdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignTXVzdCBwYXNzIGl0ZXJhdG9yIHRvICNlYWNoJyk7XG4gICAgfVxuXG4gICAgbGV0IGZuID0gb3B0aW9ucy5mbixcbiAgICAgICAgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIHJldCA9ICcnLFxuICAgICAgICBkYXRhLFxuICAgICAgICBjb250ZXh0UGF0aDtcblxuICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgIGNvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSkgKyAnLic7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhlY0l0ZXJhdGlvbihmaWVsZCwgaW5kZXgsIGxhc3QpIHtcbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGRhdGEua2V5ID0gZmllbGQ7XG4gICAgICAgIGRhdGEuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZGF0YS5maXJzdCA9IGluZGV4ID09PSAwO1xuICAgICAgICBkYXRhLmxhc3QgPSAhIWxhc3Q7XG5cbiAgICAgICAgaWYgKGNvbnRleHRQYXRoKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoICsgZmllbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtmaWVsZF0sIHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zKFtjb250ZXh0W2ZpZWxkXSwgZmllbGRdLCBbY29udGV4dFBhdGggKyBmaWVsZCwgbnVsbF0pXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICAgIGZvciAobGV0IGogPSBjb250ZXh0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgIGlmIChpIGluIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGV4ZWNJdGVyYXRpb24oaSwgaSwgaSA9PT0gY29udGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBwcmlvcktleTtcblxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICAgIGlmIChjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJ1bm5pbmcgdGhlIGl0ZXJhdGlvbnMgb25lIHN0ZXAgb3V0IG9mIHN5bmMgc28gd2UgY2FuIGRldGVjdFxuICAgICAgICAgICAgLy8gdGhlIGxhc3QgaXRlcmF0aW9uIHdpdGhvdXQgaGF2ZSB0byBzY2FuIHRoZSBvYmplY3QgdHdpY2UgYW5kIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYW4gaXRlcm1lZGlhdGUga2V5cyBhcnJheS5cbiAgICAgICAgICAgIGlmIChwcmlvcktleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByaW9yS2V5ID0ga2V5O1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJpb3JLZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGV4ZWNJdGVyYXRpb24ocHJpb3JLZXksIGkgLSAxLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuIiwiaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuLi9leGNlcHRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKC8qIFthcmdzLCBdb3B0aW9ucyAqLykge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBBIG1pc3NpbmcgZmllbGQgaW4gYSB7e2Zvb319IGNvbnN0cnVjdC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNvbWVvbmUgaXMgYWN0dWFsbHkgdHJ5aW5nIHRvIGNhbGwgc29tZXRoaW5nLCBibG93IHVwLlxuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignTWlzc2luZyBoZWxwZXI6IFwiJyArIGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0ubmFtZSArICdcIicpO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQge2lzRW1wdHksIGlzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb25kaXRpb25hbCkpIHsgY29uZGl0aW9uYWwgPSBjb25kaXRpb25hbC5jYWxsKHRoaXMpOyB9XG5cbiAgICAvLyBEZWZhdWx0IGJlaGF2aW9yIGlzIHRvIHJlbmRlciB0aGUgcG9zaXRpdmUgcGF0aCBpZiB0aGUgdmFsdWUgaXMgdHJ1dGh5IGFuZCBub3QgZW1wdHkuXG4gICAgLy8gVGhlIGBpbmNsdWRlWmVyb2Agb3B0aW9uIG1heSBiZSBzZXQgdG8gdHJlYXQgdGhlIGNvbmR0aW9uYWwgYXMgcHVyZWx5IG5vdCBlbXB0eSBiYXNlZCBvbiB0aGVcbiAgICAvLyBiZWhhdmlvciBvZiBpc0VtcHR5LiBFZmZlY3RpdmVseSB0aGlzIGRldGVybWluZXMgaWYgMCBpcyBoYW5kbGVkIGJ5IHRoZSBwb3NpdGl2ZSBwYXRoIG9yIG5lZ2F0aXZlLlxuICAgIGlmICgoIW9wdGlvbnMuaGFzaC5pbmNsdWRlWmVybyAmJiAhY29uZGl0aW9uYWwpIHx8IGlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZuLCBoYXNoOiBvcHRpb25zLmhhc2h9KTtcbiAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oLyogbWVzc2FnZSwgb3B0aW9ucyAqLykge1xuICAgIGxldCBhcmdzID0gW3VuZGVmaW5lZF0sXG4gICAgICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuXG4gICAgbGV0IGxldmVsID0gMTtcbiAgICBpZiAob3B0aW9ucy5oYXNoLmxldmVsICE9IG51bGwpIHtcbiAgICAgIGxldmVsID0gb3B0aW9ucy5oYXNoLmxldmVsO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsKSB7XG4gICAgICBsZXZlbCA9IG9wdGlvbnMuZGF0YS5sZXZlbDtcbiAgICB9XG4gICAgYXJnc1swXSA9IGxldmVsO1xuXG4gICAgaW5zdGFuY2UubG9nKC4uLiBhcmdzKTtcbiAgfSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9va3VwJywgZnVuY3Rpb24ob2JqLCBmaWVsZCkge1xuICAgIHJldHVybiBvYmogJiYgb2JqW2ZpZWxkXTtcbiAgfSk7XG59XG4iLCJpbXBvcnQge2FwcGVuZENvbnRleHRQYXRoLCBibG9ja1BhcmFtcywgY3JlYXRlRnJhbWUsIGlzRW1wdHksIGlzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gICAgbGV0IGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmICghaXNFbXB0eShjb250ZXh0KSkge1xuICAgICAgbGV0IGRhdGEgPSBvcHRpb25zLmRhdGE7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLmlkc1swXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyhbY29udGV4dF0sIFtkYXRhICYmIGRhdGEuY29udGV4dFBhdGhdKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCB7aW5kZXhPZn0gZnJvbSAnLi91dGlscyc7XG5cbmxldCBsb2dnZXIgPSB7XG4gIG1ldGhvZE1hcDogWydkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSxcbiAgbGV2ZWw6ICdpbmZvJyxcblxuICAvLyBNYXBzIGEgZ2l2ZW4gbGV2ZWwgdmFsdWUgdG8gdGhlIGBtZXRob2RNYXBgIGluZGV4ZXMgYWJvdmUuXG4gIGxvb2t1cExldmVsOiBmdW5jdGlvbihsZXZlbCkge1xuICAgIGlmICh0eXBlb2YgbGV2ZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICBsZXQgbGV2ZWxNYXAgPSBpbmRleE9mKGxvZ2dlci5tZXRob2RNYXAsIGxldmVsLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKGxldmVsTWFwID49IDApIHtcbiAgICAgICAgbGV2ZWwgPSBsZXZlbE1hcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldmVsID0gcGFyc2VJbnQobGV2ZWwsIDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGV2ZWw7XG4gIH0sXG5cbiAgLy8gQ2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgLi4ubWVzc2FnZSkge1xuICAgIGxldmVsID0gbG9nZ2VyLmxvb2t1cExldmVsKGxldmVsKTtcblxuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9nZ2VyLmxvb2t1cExldmVsKGxvZ2dlci5sZXZlbCkgPD0gbGV2ZWwpIHtcbiAgICAgIGxldCBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICghY29uc29sZVttZXRob2RdKSB7ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgIG1ldGhvZCA9ICdsb2cnO1xuICAgICAgfVxuICAgICAgY29uc29sZVttZXRob2RdKC4uLm1lc3NhZ2UpOyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGxvZ2dlcjtcbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgbGV0IHJvb3QgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyxcbiAgICAgICRIYW5kbGViYXJzID0gcm9vdC5IYW5kbGViYXJzO1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBIYW5kbGViYXJzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocm9vdC5IYW5kbGViYXJzID09PSBIYW5kbGViYXJzKSB7XG4gICAgICByb290LkhhbmRsZWJhcnMgPSAkSGFuZGxlYmFycztcbiAgICB9XG4gICAgcmV0dXJuIEhhbmRsZWJhcnM7XG4gIH07XG59XG4iLCJpbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi9leGNlcHRpb24nO1xuaW1wb3J0IHsgQ09NUElMRVJfUkVWSVNJT04sIFJFVklTSU9OX0NIQU5HRVMsIGNyZWF0ZUZyYW1lIH0gZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIGNvbnN0IGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm8gJiYgY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IENPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgY29uc3QgcnVudGltZVZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IFJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICtcbiAgICAgICAgICAgICdQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgcnVudGltZVZlcnNpb25zICsgJykgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uICgnICsgY29tcGlsZXJWZXJzaW9ucyArICcpLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArXG4gICAgICAgICAgICAnUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uICgnICsgY29tcGlsZXJJbmZvWzFdICsgJykuJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ05vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZScpO1xuICB9XG4gIGlmICghdGVtcGxhdGVTcGVjIHx8ICF0ZW1wbGF0ZVNwZWMubWFpbikge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1Vua25vd24gdGVtcGxhdGUgb2JqZWN0OiAnICsgdHlwZW9mIHRlbXBsYXRlU3BlYyk7XG4gIH1cblxuICB0ZW1wbGF0ZVNwZWMubWFpbi5kZWNvcmF0b3IgPSB0ZW1wbGF0ZVNwZWMubWFpbl9kO1xuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIGVudi5WTS5jaGVja1JldmlzaW9uKHRlbXBsYXRlU3BlYy5jb21waWxlcik7XG5cbiAgZnVuY3Rpb24gaW52b2tlUGFydGlhbFdyYXBwZXIocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAgIGNvbnRleHQgPSBVdGlscy5leHRlbmQoe30sIGNvbnRleHQsIG9wdGlvbnMuaGFzaCk7XG4gICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgb3B0aW9ucy5pZHNbMF0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhcnRpYWwgPSBlbnYuVk0ucmVzb2x2ZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcbiAgICBsZXQgcmVzdWx0ID0gZW52LlZNLmludm9rZVBhcnRpYWwuY2FsbCh0aGlzLCBwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKTtcblxuICAgIGlmIChyZXN1bHQgPT0gbnVsbCAmJiBlbnYuY29tcGlsZSkge1xuICAgICAgb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdID0gZW52LmNvbXBpbGUocGFydGlhbCwgdGVtcGxhdGVTcGVjLmNvbXBpbGVyT3B0aW9ucywgZW52KTtcbiAgICAgIHJlc3VsdCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmRlbnQpIHtcbiAgICAgICAgbGV0IGxpbmVzID0gcmVzdWx0LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBsaW5lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoIWxpbmVzW2ldICYmIGkgKyAxID09PSBsKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaW5lc1tpXSA9IG9wdGlvbnMuaW5kZW50ICsgbGluZXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gbGluZXMuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgbGV0IGNvbnRhaW5lciA9IHtcbiAgICBzdHJpY3Q6IGZ1bmN0aW9uKG9iaiwgbmFtZSkge1xuICAgICAgaWYgKCEobmFtZSBpbiBvYmopKSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1wiJyArIG5hbWUgKyAnXCIgbm90IGRlZmluZWQgaW4gJyArIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqW25hbWVdO1xuICAgIH0sXG4gICAgbG9va3VwOiBmdW5jdGlvbihkZXB0aHMsIG5hbWUpIHtcbiAgICAgIGNvbnN0IGxlbiA9IGRlcHRocy5sZW5ndGg7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChkZXB0aHNbaV0gJiYgZGVwdGhzW2ldW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZGVwdGhzW2ldW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBsYW1iZGE6IGZ1bmN0aW9uKGN1cnJlbnQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgY3VycmVudCA9PT0gJ2Z1bmN0aW9uJyA/IGN1cnJlbnQuY2FsbChjb250ZXh0KSA6IGN1cnJlbnQ7XG4gICAgfSxcblxuICAgIGVzY2FwZUV4cHJlc3Npb246IFV0aWxzLmVzY2FwZUV4cHJlc3Npb24sXG4gICAgaW52b2tlUGFydGlhbDogaW52b2tlUGFydGlhbFdyYXBwZXIsXG5cbiAgICBmbjogZnVuY3Rpb24oaSkge1xuICAgICAgbGV0IHJldCA9IHRlbXBsYXRlU3BlY1tpXTtcbiAgICAgIHJldC5kZWNvcmF0b3IgPSB0ZW1wbGF0ZVNwZWNbaSArICdfZCddO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuXG4gICAgcHJvZ3JhbXM6IFtdLFxuICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICAgIGxldCBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0sXG4gICAgICAgICAgZm4gPSB0aGlzLmZuKGkpO1xuICAgICAgaWYgKGRhdGEgfHwgZGVwdGhzIHx8IGJsb2NrUGFyYW1zIHx8IGRlY2xhcmVkQmxvY2tQYXJhbXMpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSB3cmFwUHJvZ3JhbSh0aGlzLCBpLCBmbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgfSxcblxuICAgIGRhdGE6IGZ1bmN0aW9uKHZhbHVlLCBkZXB0aCkge1xuICAgICAgd2hpbGUgKHZhbHVlICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5fcGFyZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIGxldCBvYmogPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgKHBhcmFtICE9PSBjb21tb24pKSB7XG4gICAgICAgIG9iaiA9IFV0aWxzLmV4dGVuZCh7fSwgY29tbW9uLCBwYXJhbSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICAvLyBBbiBlbXB0eSBvYmplY3QgdG8gdXNlIGFzIHJlcGxhY2VtZW50IGZvciBudWxsLWNvbnRleHRzXG4gICAgbnVsbENvbnRleHQ6IE9iamVjdC5zZWFsKHt9KSxcblxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogdGVtcGxhdGVTcGVjLmNvbXBpbGVyXG4gIH07XG5cbiAgZnVuY3Rpb24gcmV0KGNvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBkYXRhID0gb3B0aW9ucy5kYXRhO1xuXG4gICAgcmV0Ll9zZXR1cChvcHRpb25zKTtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCAmJiB0ZW1wbGF0ZVNwZWMudXNlRGF0YSkge1xuICAgICAgZGF0YSA9IGluaXREYXRhKGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICBsZXQgZGVwdGhzLFxuICAgICAgICBibG9ja1BhcmFtcyA9IHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyA/IFtdIDogdW5kZWZpbmVkO1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzKSB7XG4gICAgICBpZiAob3B0aW9ucy5kZXB0aHMpIHtcbiAgICAgICAgZGVwdGhzID0gY29udGV4dCAhPSBvcHRpb25zLmRlcHRoc1swXSA/IFtjb250ZXh0XS5jb25jYXQob3B0aW9ucy5kZXB0aHMpIDogb3B0aW9ucy5kZXB0aHM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXB0aHMgPSBbY29udGV4dF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFpbihjb250ZXh0LyosIG9wdGlvbnMqLykge1xuICAgICAgcmV0dXJuICcnICsgdGVtcGxhdGVTcGVjLm1haW4oY29udGFpbmVyLCBjb250ZXh0LCBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICB9XG4gICAgbWFpbiA9IGV4ZWN1dGVEZWNvcmF0b3JzKHRlbXBsYXRlU3BlYy5tYWluLCBtYWluLCBjb250YWluZXIsIG9wdGlvbnMuZGVwdGhzIHx8IFtdLCBkYXRhLCBibG9ja1BhcmFtcyk7XG4gICAgcmV0dXJuIG1haW4oY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbiAgcmV0LmlzVG9wID0gdHJ1ZTtcblxuICByZXQuX3NldHVwID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmhlbHBlcnMsIGVudi5oZWxwZXJzKTtcblxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsKSB7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLnBhcnRpYWxzLCBlbnYucGFydGlhbHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRlbXBsYXRlU3BlYy51c2VQYXJ0aWFsIHx8IHRlbXBsYXRlU3BlYy51c2VEZWNvcmF0b3JzKSB7XG4gICAgICAgIGNvbnRhaW5lci5kZWNvcmF0b3JzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuZGVjb3JhdG9ycywgZW52LmRlY29yYXRvcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgICBjb250YWluZXIuZGVjb3JhdG9ycyA9IG9wdGlvbnMuZGVjb3JhdG9ycztcbiAgICB9XG4gIH07XG5cbiAgcmV0Ll9jaGlsZCA9IGZ1bmN0aW9uKGksIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zICYmICFibG9ja1BhcmFtcykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignbXVzdCBwYXNzIGJsb2NrIHBhcmFtcycpO1xuICAgIH1cbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocyAmJiAhZGVwdGhzKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdtdXN0IHBhc3MgcGFyZW50IGRlcHRocycpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIHRlbXBsYXRlU3BlY1tpXSwgZGF0YSwgMCwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gIH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUHJvZ3JhbShjb250YWluZXIsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gIGZ1bmN0aW9uIHByb2coY29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGN1cnJlbnREZXB0aHMgPSBkZXB0aHM7XG4gICAgaWYgKGRlcHRocyAmJiBjb250ZXh0ICE9IGRlcHRoc1swXSAmJiAhKGNvbnRleHQgPT09IGNvbnRhaW5lci5udWxsQ29udGV4dCAmJiBkZXB0aHNbMF0gPT09IG51bGwpKSB7XG4gICAgICBjdXJyZW50RGVwdGhzID0gW2NvbnRleHRdLmNvbmNhdChkZXB0aHMpO1xuICAgIH1cblxuICAgIHJldHVybiBmbihjb250YWluZXIsXG4gICAgICAgIGNvbnRleHQsXG4gICAgICAgIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsXG4gICAgICAgIG9wdGlvbnMuZGF0YSB8fCBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtcyAmJiBbb3B0aW9ucy5ibG9ja1BhcmFtc10uY29uY2F0KGJsb2NrUGFyYW1zKSxcbiAgICAgICAgY3VycmVudERlcHRocyk7XG4gIH1cblxuICBwcm9nID0gZXhlY3V0ZURlY29yYXRvcnMoZm4sIHByb2csIGNvbnRhaW5lciwgZGVwdGhzLCBkYXRhLCBibG9ja1BhcmFtcyk7XG5cbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGRlcHRocyA/IGRlcHRocy5sZW5ndGggOiAwO1xuICBwcm9nLmJsb2NrUGFyYW1zID0gZGVjbGFyZWRCbG9ja1BhcmFtcyB8fCAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgaWYgKCFwYXJ0aWFsKSB7XG4gICAgaWYgKG9wdGlvbnMubmFtZSA9PT0gJ0BwYXJ0aWFsLWJsb2NrJykge1xuICAgICAgcGFydGlhbCA9IG9wdGlvbnMuZGF0YVsncGFydGlhbC1ibG9jayddO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdO1xuICAgIH1cbiAgfSBlbHNlIGlmICghcGFydGlhbC5jYWxsICYmICFvcHRpb25zLm5hbWUpIHtcbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwYXJ0aWFsIHRoYXQgcmV0dXJuZWQgYSBzdHJpbmdcbiAgICBvcHRpb25zLm5hbWUgPSBwYXJ0aWFsO1xuICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW3BhcnRpYWxdO1xuICB9XG4gIHJldHVybiBwYXJ0aWFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIC8vIFVzZSB0aGUgY3VycmVudCBjbG9zdXJlIGNvbnRleHQgdG8gc2F2ZSB0aGUgcGFydGlhbC1ibG9jayBpZiB0aGlzIHBhcnRpYWxcbiAgY29uc3QgY3VycmVudFBhcnRpYWxCbG9jayA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGFbJ3BhcnRpYWwtYmxvY2snXTtcbiAgb3B0aW9ucy5wYXJ0aWFsID0gdHJ1ZTtcbiAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoID0gb3B0aW9ucy5pZHNbMF0gfHwgb3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoO1xuICB9XG5cbiAgbGV0IHBhcnRpYWxCbG9jaztcbiAgaWYgKG9wdGlvbnMuZm4gJiYgb3B0aW9ucy5mbiAhPT0gbm9vcCkge1xuICAgIG9wdGlvbnMuZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgLy8gV3JhcHBlciBmdW5jdGlvbiB0byBnZXQgYWNjZXNzIHRvIGN1cnJlbnRQYXJ0aWFsQmxvY2sgZnJvbSB0aGUgY2xvc3VyZVxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm47XG4gICAgcGFydGlhbEJsb2NrID0gb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ10gPSBmdW5jdGlvbiBwYXJ0aWFsQmxvY2tXcmFwcGVyKGNvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuXG4gICAgICAvLyBSZXN0b3JlIHRoZSBwYXJ0aWFsLWJsb2NrIGZyb20gdGhlIGNsb3N1cmUgZm9yIHRoZSBleGVjdXRpb24gb2YgdGhlIGJsb2NrXG4gICAgICAvLyBpLmUuIHRoZSBwYXJ0IGluc2lkZSB0aGUgYmxvY2sgb2YgdGhlIHBhcnRpYWwgY2FsbC5cbiAgICAgIG9wdGlvbnMuZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICBvcHRpb25zLmRhdGFbJ3BhcnRpYWwtYmxvY2snXSA9IGN1cnJlbnRQYXJ0aWFsQmxvY2s7XG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfTtcbiAgICBpZiAoZm4ucGFydGlhbHMpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHMgPSBVdGlscy5leHRlbmQoe30sIG9wdGlvbnMucGFydGlhbHMsIGZuLnBhcnRpYWxzKTtcbiAgICB9XG4gIH1cblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkICYmIHBhcnRpYWxCbG9jaykge1xuICAgIHBhcnRpYWwgPSBwYXJ0aWFsQmxvY2s7XG4gIH1cblxuICBpZiAocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGZvdW5kJyk7XG4gIH0gZWxzZSBpZiAocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKSB7IHJldHVybiAnJzsgfVxuXG5mdW5jdGlvbiBpbml0RGF0YShjb250ZXh0LCBkYXRhKSB7XG4gIGlmICghZGF0YSB8fCAhKCdyb290JyBpbiBkYXRhKSkge1xuICAgIGRhdGEgPSBkYXRhID8gY3JlYXRlRnJhbWUoZGF0YSkgOiB7fTtcbiAgICBkYXRhLnJvb3QgPSBjb250ZXh0O1xuICB9XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBleGVjdXRlRGVjb3JhdG9ycyhmbiwgcHJvZywgY29udGFpbmVyLCBkZXB0aHMsIGRhdGEsIGJsb2NrUGFyYW1zKSB7XG4gIGlmIChmbi5kZWNvcmF0b3IpIHtcbiAgICBsZXQgcHJvcHMgPSB7fTtcbiAgICBwcm9nID0gZm4uZGVjb3JhdG9yKHByb2csIHByb3BzLCBjb250YWluZXIsIGRlcHRocyAmJiBkZXB0aHNbMF0sIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgIFV0aWxzLmV4dGVuZChwcm9nLCBwcm9wcyk7XG4gIH1cbiAgcmV0dXJuIHByb2c7XG59XG4iLCIvLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gU2FmZVN0cmluZy5wcm90b3R5cGUudG9IVE1MID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAnJyArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU2FmZVN0cmluZztcbiIsImNvbnN0IGVzY2FwZSA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjeDI3OycsXG4gICdgJzogJyYjeDYwOycsXG4gICc9JzogJyYjeDNEOydcbn07XG5cbmNvbnN0IGJhZENoYXJzID0gL1smPD5cIidgPV0vZyxcbiAgICAgIHBvc3NpYmxlID0gL1smPD5cIidgPV0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQob2JqLyogLCAuLi5zb3VyY2UgKi8pIHtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFyZ3VtZW50c1tpXSwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBsZXQgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBTb3VyY2VkIGZyb20gbG9kYXNoXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYmVzdGllanMvbG9kYXNoL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4vKiBlc2xpbnQtZGlzYWJsZSBmdW5jLXN0eWxlICovXG5sZXQgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59O1xuLy8gZmFsbGJhY2sgZm9yIG9sZGVyIHZlcnNpb25zIG9mIENocm9tZSBhbmQgU2FmYXJpXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICB9O1xufVxuZXhwb3J0IHtpc0Z1bmN0aW9ufTtcbi8qIGVzbGludC1lbmFibGUgZnVuYy1zdHlsZSAqL1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZXhwb3J0IGNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtcblxuLy8gT2xkZXIgSUUgdmVyc2lvbnMgZG8gbm90IGRpcmVjdGx5IHN1cHBvcnQgaW5kZXhPZiBzbyB3ZSBtdXN0IGltcGxlbWVudCBvdXIgb3duLCBzYWRseS5cbmV4cG9ydCBmdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyAmJiBzdHJpbmcudG9IVE1MKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvSFRNTCgpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgKyAnJztcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZztcbiAgfVxuXG4gIGlmICghcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRnJhbWUob2JqZWN0KSB7XG4gIGxldCBmcmFtZSA9IGV4dGVuZCh7fSwgb2JqZWN0KTtcbiAgZnJhbWUuX3BhcmVudCA9IG9iamVjdDtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tQYXJhbXMocGFyYW1zLCBpZHMpIHtcbiAgcGFyYW1zLnBhdGggPSBpZHM7XG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRDb250ZXh0UGF0aChjb250ZXh0UGF0aCwgaWQpIHtcbiAgcmV0dXJuIChjb250ZXh0UGF0aCA/IGNvbnRleHRQYXRoICsgJy4nIDogJycpICsgaWQ7XG59XG4iLCIvLyBDcmVhdGUgYSBzaW1wbGUgcGF0aCBhbGlhcyB0byBhbGxvdyBicm93c2VyaWZ5IHRvIHJlc29sdmVcbi8vIHRoZSBydW50aW1lIG9uIGEgc3VwcG9ydGVkIHBhdGguXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lJylbJ2RlZmF1bHQnXTtcbiIsIi8qXHJcbiAqICBDb3B5cmlnaHQgMjAxNCBHYXJ5IEdyZWVuLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqICBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKi9cclxuXHJcbihmdW5jdGlvbih3aW5kb3csIGZhY3RvcnkpIHtcclxuXHJcblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JylcclxuXHR7XHJcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkod2luZG93KTtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdHdpbmRvdy5MaWdodFJvdXRlciA9IGZhY3Rvcnkod2luZG93KTtcclxuXHR9XHJcblxyXG59KHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogd2luZG93LCBmdW5jdGlvbih3aW5kb3cpIHtcclxuXHJcblx0ZnVuY3Rpb24gTGlnaHRSb3V0ZXIob3B0aW9ucylcclxuXHR7XHJcblx0XHQvKipcclxuXHRcdCAqIFBhdGggcm9vdCAod2lsbCBiZSBzdHJpcHBlZCBvdXQgd2hlbiB0ZXN0aW5nIHBhdGgtYmFzZWQgcm91dGVzKVxyXG5cdFx0ICogQHR5cGUgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHRoaXMucGF0aFJvb3QgPSAnJztcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJvdXRlc1xyXG5cdFx0ICogQHR5cGUgYXJyYXlcclxuXHRcdCAqL1xyXG5cdFx0dGhpcy5yb3V0ZXMgPSBbXTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIERlZmF1bHQgcm91dGluZyB0eXBlIFtoYXNoIG9yIHBhdGhdXHJcblx0XHQgKiBAdHlwZSBzdHJpbmdcclxuXHRcdCAqL1xyXG5cdFx0dGhpcy50eXBlID0gJ3BhdGgnO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VzdG9tIHBhdGggKG1haW5seSB1c2VkIGZvciB0ZXN0aW5nKVxyXG5cdFx0ICogQHR5cGUgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHRoaXMucGF0aCA9IG51bGw7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXN0b20gaGFzaCAobWFpbmx5IHVzZWQgZm9yIHRlc3RpbmcpXHJcblx0XHQgKiBAdHlwZSBzdHJpbmdcclxuXHRcdCAqL1xyXG5cdFx0dGhpcy5oYXNoID0gbnVsbDtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnRleHQgdG8gY2FsbCBtYXRjaGVkIHJvdXRlcyB1bmRlclxyXG5cdFx0ICogQHR5cGUge21peGVkfVxyXG5cdFx0ICovXHJcblx0XHR0aGlzLmNvbnRleHQgPSB0aGlzO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSGFuZGxlciBmb3Igc3RyaW5nIGJhc2VkIGNhbGxiYWNrc1xyXG5cdFx0ICogQHR5cGUge29iamVjdHxmdW5jdGlvbn1cclxuXHRcdCAqL1xyXG5cdFx0dGhpcy5oYW5kbGVyID0gd2luZG93O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTmFtZWQgcGFyYW0gcmVwbGFjZSBhbmQgbWF0Y2hpbmcgcmVnZXhcclxuXHRcdCAqIEB0eXBlIHtPYmplY3R9XHJcblx0XHQgKi9cclxuXHRcdHZhciBuYW1lZFBhcmFtID0gJyhbXFxcXHctXSspJztcclxuXHRcdHRoaXMubmFtZWRQYXJhbSA9IHtcclxuXHRcdFx0bWF0Y2g6IG5ldyBSZWdFeHAoJ3soJyArIG5hbWVkUGFyYW0gKyAnKX0nLCAnZycpLFxyXG5cdFx0XHRyZXBsYWNlOiBuYW1lZFBhcmFtXHJcblx0XHR9O1xyXG5cclxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuXHRcdGlmIChvcHRpb25zLnR5cGUpICAgICAgdGhpcy5zZXRUeXBlKG9wdGlvbnMudHlwZSk7XHJcblx0XHRpZiAob3B0aW9ucy5wYXRoKSAgICAgIHRoaXMuc2V0UGF0aChvcHRpb25zLnBhdGgpO1xyXG5cdFx0aWYgKG9wdGlvbnMucGF0aFJvb3QpICB0aGlzLnNldFBhdGhSb290KG9wdGlvbnMucGF0aFJvb3QpO1xyXG5cdFx0aWYgKG9wdGlvbnMuaGFzaCkgICAgICB0aGlzLnNldEhhc2gob3B0aW9ucy5oYXNoKTtcclxuXHRcdGlmIChvcHRpb25zLmNvbnRleHQpICAgdGhpcy5zZXRDb250ZXh0KG9wdGlvbnMuY29udGV4dCk7XHJcblx0XHRpZiAob3B0aW9ucy5oYW5kbGVyKSAgIHRoaXMuc2V0SGFuZGxlcihvcHRpb25zLmhhbmRsZXIpO1xyXG5cclxuXHRcdGlmIChvcHRpb25zLnJvdXRlcylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHJvdXRlO1xyXG5cdFx0XHRmb3IgKHJvdXRlIGluIG9wdGlvbnMucm91dGVzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5hZGQocm91dGUsIG9wdGlvbnMucm91dGVzW3JvdXRlXSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdExpZ2h0Um91dGVyLnByb3RvdHlwZSA9IHtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJvdXRlIGNvbnN0cnVjdG9yXHJcblx0XHQgKiBAdHlwZSB7Um91dGV9XHJcblx0XHQgKi9cclxuXHRcdFJvdXRlOiBSb3V0ZSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEFkZCBhIHJvdXRlXHJcblx0XHQgKiBAcGFyYW0gc3RyaW5nfFJlZ0V4cCAgIHJvdXRlXHJcblx0XHQgKiBAcGFyYW0gc3RyaW5nfGZ1bmN0aW9uIGNhbGxiYWNrXHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0YWRkOiBmdW5jdGlvbihyb3V0ZSwgY2FsbGJhY2spIHtcclxuXHRcdFx0dGhpcy5yb3V0ZXMucHVzaChuZXcgdGhpcy5Sb3V0ZShyb3V0ZSwgY2FsbGJhY2ssIHRoaXMpKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEVtcHR5L2NsZWFyIGFsbCB0aGUgcm91dGVzXHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0ZW1wdHk6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnJvdXRlcyA9IFtdO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQncyB0aGUgcm91dGluZyB0eXBlXHJcblx0XHQgKiBAcGFyYW0gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRzZXRUeXBlOiBmdW5jdGlvbih0eXBlKSB7XHJcblx0XHRcdHRoaXMudHlwZSA9IHR5cGU7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCB0aGUgcGF0aCByb290IHVybFxyXG5cdFx0ICogQHBhcmFtIHN0cmluZyB1cmxcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRzZXRQYXRoUm9vdDogZnVuY3Rpb24odXJsKSB7XHJcblx0XHRcdHRoaXMucGF0aFJvb3QgPSB1cmw7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldHMgdGhlIGN1c3RvbSBwYXRoIHRvIHRlc3Qgcm91dGVzIGFnYWluc3RcclxuXHRcdCAqIEBwYXJhbSAgc3RyaW5nIHBhdGhcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRzZXRQYXRoOiBmdW5jdGlvbihwYXRoKSB7XHJcblx0XHRcdHRoaXMucGF0aCA9IHBhdGg7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldHMgdGhlIGN1c3RvbSBoYXNoIHRvIHRlc3Qgcm91dGVzIGFnYWluc3RcclxuXHRcdCAqIEBwYXJhbSAgc3RyaW5nIGhhc2hcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRzZXRIYXNoOiBmdW5jdGlvbihoYXNoKSB7XHJcblx0XHRcdHRoaXMuaGFzaCA9IGhhc2g7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldHMgY29udGV4dCB0byBjYWxsIG1hdGNoZWQgcm91dGVzIHVuZGVyXHJcblx0XHQgKiBAcGFyYW0gIG1peGVkIGNvbnRleHRcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRzZXRDb250ZXh0OiBmdW5jdGlvbihjb250ZXh0KSB7XHJcblx0XHRcdHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCBoYW5kbGVyXHJcblx0XHQgKiBAcGFyYW0gIG1peGVkIGNvbnRleHRcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRzZXRIYW5kbGVyOiBmdW5jdGlvbihoYW5kbGVyKSB7XHJcblx0XHRcdHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldHMgdGhlIHVybCB0byB0ZXN0IHRoZSByb3V0ZXMgYWdhaW5zdFxyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdGdldFVybDogZnVuY3Rpb24ocm91dGVUeXBlKSB7XHJcblxyXG5cdFx0XHR2YXIgdXJsO1xyXG5cdFx0XHRyb3V0ZVR5cGUgPSByb3V0ZVR5cGUgfHwgdGhpcy50eXBlO1xyXG5cclxuXHRcdFx0aWYgKHJvdXRlVHlwZSA9PSAncGF0aCcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgcm9vdFJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyB0aGlzLnBhdGhSb290ICsgJy8/Jyk7XHJcblx0XHRcdFx0dXJsID0gdGhpcy5wYXRoIHx8IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSk7XHJcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2Uocm9vdFJlZ2V4LCAnJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAocm91dGVUeXBlID09ICdoYXNoJylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHVybCA9IHRoaXMuaGFzaCB8fCB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0cmV0dXJuIGRlY29kZVVSSSh1cmwpO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEF0dGVtcHQgdG8gbWF0Y2ggYSBvbmUtdGltZSByb3V0ZSBhbmQgY2FsbGJhY2tcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEBwYXJhbSAge2Nsb3N1cmV8c3RyaW5nfSBjYWxsYmFja1xyXG5cdFx0ICogQHJldHVybiB7bWl4ZWR9XHJcblx0XHQgKi9cclxuXHRcdG1hdGNoOiBmdW5jdGlvbihwYXRoLCBjYWxsYmFjaykge1xyXG5cdFx0XHR2YXIgcm91dGUgPSBuZXcgdGhpcy5Sb3V0ZShwYXRoLCBjYWxsYmFjaywgdGhpcyk7XHJcblx0XHRcdGlmIChyb3V0ZS50ZXN0KHRoaXMuZ2V0VXJsKCkpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cmV0dXJuIHJvdXRlLnJ1bigpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUnVuIHRoZSByb3V0ZXJcclxuXHRcdCAqIEByZXR1cm4gUm91dGV8dW5kZWZpbmVkXHJcblx0XHQgKi9cclxuXHRcdHJ1bjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciB1cmwgPSB0aGlzLmdldFVybCgpLCByb3V0ZTtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgaW4gdGhpcy5yb3V0ZXMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvLyBHZXQgdGhlIHJvdXRlXHJcblx0XHRcdFx0cm91dGUgPSB0aGlzLnJvdXRlc1tpXTtcclxuXHJcblx0XHRcdFx0Ly8gVGVzdCBhbmQgcnVuIHRoZSByb3V0ZSBpZiBpdCBtYXRjaGVzXHJcblx0XHRcdFx0aWYgKHJvdXRlLnRlc3QodXJsKSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyb3V0ZS5ydW4oKTtcclxuXHRcdFx0XHRcdHJldHVybiByb3V0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHJcblx0LyoqXHJcblx0ICogUm91dGUgb2JqZWN0XHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gY2xvc3VyZVxyXG5cdCAqIEBwYXJhbSB7TGlnaHRSb3V0ZXJ9IHJvdXRlciAgSW5zdGFuY2Ugb2YgdGhlIGxpZ2h0IHJvdXRlciB0aGUgcm91dGUgYmVsb25ncyB0by5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBSb3V0ZShwYXRoLCBjYWxsYmFjaywgcm91dGVyKVxyXG5cdHtcclxuXHRcdHRoaXMucGF0aCA9IHBhdGg7XHJcblx0XHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcblx0XHR0aGlzLnJvdXRlciA9IHJvdXRlcjtcclxuXHRcdHRoaXMudmFsdWVzID0gW107XHJcblx0fVxyXG5cclxuXHRSb3V0ZS5wcm90b3R5cGUgPSB7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb252ZXJ0cyByb3V0ZSB0byBhIHJlZ2V4IChpZiByZXF1aXJlZCkgc28gdGhhdCBpdCdzIHN1aXRhYmxlIGZvciBtYXRjaGluZyBhZ2FpbnN0LlxyXG5cdFx0ICogQHBhcmFtICBzdHJpbmcgcm91dGVcclxuXHRcdCAqIEByZXR1cm4gUmVnRXhwXHJcblx0XHQgKi9cclxuXHRcdHJlZ2V4OiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdHZhciBwYXRoID0gdGhpcy5wYXRoO1xyXG5cclxuXHRcdFx0aWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldHVybiBuZXcgUmVnRXhwKCdeJyArIHBhdGgucmVwbGFjZSgvXFwvL2csICdcXFxcLycpLnJlcGxhY2UodGhpcy5yb3V0ZXIubmFtZWRQYXJhbS5tYXRjaCwgdGhpcy5yb3V0ZXIubmFtZWRQYXJhbS5yZXBsYWNlKSArICckJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHBhdGg7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSBtYXRjaGluZyBwYXJhbSBrZXlzXHJcblx0XHQgKiBAcmV0dXJuIG9iamVjdCAgT2JqZWN0IGtleWVkIHdpdGggcGFyYW0gbmFtZSAob3IgaW5kZXgpIHdpdGggdGhlIHZhbHVlLlxyXG5cdFx0ICovXHJcblx0XHRwYXJhbXM6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0dmFyIG9iaiA9IHt9LCBuYW1lLCB2YWx1ZXMgPSB0aGlzLnZhbHVlcywgcGFyYW1zID0gdmFsdWVzLCBpLCB0ID0gMCwgcGF0aCA9IHRoaXMucGF0aDtcclxuXHJcblx0XHRcdGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0ID0gMTtcclxuXHRcdFx0XHRwYXJhbXMgPSBwYXRoLm1hdGNoKHRoaXMucm91dGVyLm5hbWVkUGFyYW0ubWF0Y2gpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmb3IgKGkgaW4gcGFyYW1zKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZSA9IHQgPyBwYXJhbXNbaV0ucmVwbGFjZSh0aGlzLnJvdXRlci5uYW1lZFBhcmFtLm1hdGNoLCAnJDEnKSA6IGk7XHJcblx0XHRcdFx0b2JqW25hbWVdID0gdmFsdWVzW2ldO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gb2JqO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFRlc3QgdGhlIHJvdXRlIHRvIHNlZSBpZiBpdCBtYXRjaGVzXHJcblx0XHQgKiBAcGFyYW0gIHtzdHJpbmd9IHVybCBVcmwgdG8gbWF0Y2ggYWdhaW5zdFxyXG5cdFx0ICogQHJldHVybiB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0dGVzdDogZnVuY3Rpb24odXJsKSB7XHJcblx0XHRcdHZhciBtYXRjaGVzO1xyXG5cdFx0XHRpZiAobWF0Y2hlcyA9IHVybC5tYXRjaCh0aGlzLnJlZ2V4KCkpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy52YWx1ZXMgPSBtYXRjaGVzLnNsaWNlKDEpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSdW4gdGhlIHJvdXRlIGNhbGxiYWNrIHdpdGggdGhlIG1hdGNoZWQgcGFyYW1zXHJcblx0XHQgKiBAcmV0dXJuIHttaXhlZH1cclxuXHRcdCAqL1xyXG5cdFx0cnVuOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAnc3RyaW5nJylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLnJvdXRlci5oYW5kbGVyW3RoaXMuY2FsbGJhY2tdKHRoaXMucGFyYW1zKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzLmNhbGxiYWNrLmFwcGx5KHRoaXMucm91dGVyLmNvbnRleHQsIFt0aGlzLnBhcmFtcygpXSk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0cmV0dXJuIExpZ2h0Um91dGVyO1xyXG5cclxufSkpOyIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS4xMi4yXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBnZXROYW5vU2Vjb25kcywgaHJ0aW1lLCBsb2FkVGltZSwgbW9kdWxlTG9hZFRpbWUsIG5vZGVMb2FkVGltZSwgdXBUaW1lO1xuXG4gIGlmICgodHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmIHBlcmZvcm1hbmNlICE9PSBudWxsKSAmJiBwZXJmb3JtYW5jZS5ub3cpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MgIT09IG51bGwpICYmIHByb2Nlc3MuaHJ0aW1lKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoZ2V0TmFub1NlY29uZHMoKSAtIG5vZGVMb2FkVGltZSkgLyAxZTY7XG4gICAgfTtcbiAgICBocnRpbWUgPSBwcm9jZXNzLmhydGltZTtcbiAgICBnZXROYW5vU2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhyO1xuICAgICAgaHIgPSBocnRpbWUoKTtcbiAgICAgIHJldHVybiBoclswXSAqIDFlOSArIGhyWzFdO1xuICAgIH07XG4gICAgbW9kdWxlTG9hZFRpbWUgPSBnZXROYW5vU2Vjb25kcygpO1xuICAgIHVwVGltZSA9IHByb2Nlc3MudXB0aW1lKCkgKiAxZTk7XG4gICAgbm9kZUxvYWRUaW1lID0gbW9kdWxlTG9hZFRpbWUgLSB1cFRpbWU7XG4gIH0gZWxzZSBpZiAoRGF0ZS5ub3cpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBlcmZvcm1hbmNlLW5vdy5qcy5tYXBcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKipcbiAqIFplc3QgKGh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL3plc3QpXG4gKiBBIGNzcyBzZWxlY3RvciBlbmdpbmUuXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMiwgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqL1xuXG4vLyBUT0RPXG4vLyAtIFJlY29nbml6ZSB0aGUgVFIgc3ViamVjdCBzZWxlY3RvciB3aGVuIHBhcnNpbmcuXG4vLyAtIFBhc3MgY29udGV4dCB0byBzY29wZS5cbi8vIC0gQWRkIDpjb2x1bW4gcHNldWRvLWNsYXNzZXMuXG5cbjsoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogU2hhcmVkXG4gKi9cblxudmFyIHdpbmRvdyA9IHRoaXNcbiAgLCBkb2N1bWVudCA9IHRoaXMuZG9jdW1lbnRcbiAgLCBvbGQgPSB0aGlzLnplc3Q7XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbnZhciBjb21wYXJlRG9jdW1lbnRQb3NpdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgaWYgKGRvY3VtZW50LmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGIpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgZWwgPSBhLm93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKVxuICAgICAgLCBpID0gZWwubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGVsW2ldID09PSBhKSByZXR1cm4gMjtcbiAgICAgIGlmIChlbFtpXSA9PT0gYikgcmV0dXJuIDQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIDE7XG4gIH07XG59KSgpO1xuXG52YXIgb3JkZXIgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlRG9jdW1lbnRQb3NpdGlvbihhLCBiKSAmIDIgPyAxIDogLTE7XG59O1xuXG52YXIgbmV4dCA9IGZ1bmN0aW9uKGVsKSB7XG4gIHdoaWxlICgoZWwgPSBlbC5uZXh0U2libGluZylcbiAgICAgICAgICYmIGVsLm5vZGVUeXBlICE9PSAxKTtcbiAgcmV0dXJuIGVsO1xufTtcblxudmFyIHByZXYgPSBmdW5jdGlvbihlbCkge1xuICB3aGlsZSAoKGVsID0gZWwucHJldmlvdXNTaWJsaW5nKVxuICAgICAgICAgJiYgZWwubm9kZVR5cGUgIT09IDEpO1xuICByZXR1cm4gZWw7XG59O1xuXG52YXIgY2hpbGQgPSBmdW5jdGlvbihlbCkge1xuICBpZiAoZWwgPSBlbC5maXJzdENoaWxkKSB7XG4gICAgd2hpbGUgKGVsLm5vZGVUeXBlICE9PSAxXG4gICAgICAgICAgICYmIChlbCA9IGVsLm5leHRTaWJsaW5nKSk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufTtcblxudmFyIGxhc3RDaGlsZCA9IGZ1bmN0aW9uKGVsKSB7XG4gIGlmIChlbCA9IGVsLmxhc3RDaGlsZCkge1xuICAgIHdoaWxlIChlbC5ub2RlVHlwZSAhPT0gMVxuICAgICAgICAgICAmJiAoZWwgPSBlbC5wcmV2aW91c1NpYmxpbmcpKTtcbiAgfVxuICByZXR1cm4gZWw7XG59O1xuXG52YXIgdW5xdW90ZSA9IGZ1bmN0aW9uKHN0cikge1xuICBpZiAoIXN0cikgcmV0dXJuIHN0cjtcbiAgdmFyIGNoID0gc3RyWzBdO1xuICByZXR1cm4gY2ggPT09ICdcIicgfHwgY2ggPT09ICdcXCcnXG4gICAgPyBzdHIuc2xpY2UoMSwgLTEpXG4gICAgOiBzdHI7XG59O1xuXG52YXIgaW5kZXhPZiA9IChmdW5jdGlvbigpIHtcbiAgaWYgKEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5pbmRleE9mO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZW0pIHtcbiAgICB2YXIgaSA9IHRoaXMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmICh0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xufSkoKTtcblxudmFyIG1ha2VJbnNpZGUgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG4gIHZhciByZWdleCA9IHJ1bGVzLmluc2lkZS5zb3VyY2VcbiAgICAucmVwbGFjZSgvPC9nLCBzdGFydClcbiAgICAucmVwbGFjZSgvPi9nLCBlbmQpO1xuXG4gIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4KTtcbn07XG5cbnZhciByZXBsYWNlID0gZnVuY3Rpb24ocmVnZXgsIG5hbWUsIHZhbCkge1xuICByZWdleCA9IHJlZ2V4LnNvdXJjZTtcbiAgcmVnZXggPSByZWdleC5yZXBsYWNlKG5hbWUsIHZhbC5zb3VyY2UgfHwgdmFsKTtcbiAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgpO1xufTtcblxudmFyIHRydW5jYXRlVXJsID0gZnVuY3Rpb24odXJsLCBudW0pIHtcbiAgcmV0dXJuIHVybFxuICAgIC5yZXBsYWNlKC9eKD86XFx3KzpcXC9cXC98XFwvKykvLCAnJylcbiAgICAucmVwbGFjZSgvKD86XFwvK3xcXC8qIy4qPykkLywgJycpXG4gICAgLnNwbGl0KCcvJywgbnVtKVxuICAgIC5qb2luKCcvJyk7XG59O1xuXG4vKipcbiAqIEhhbmRsZSBgbnRoYCBTZWxlY3RvcnNcbiAqL1xuXG52YXIgcGFyc2VOdGggPSBmdW5jdGlvbihwYXJhbSwgdGVzdCkge1xuICB2YXIgcGFyYW0gPSBwYXJhbS5yZXBsYWNlKC9cXHMrL2csICcnKVxuICAgICwgY2FwO1xuXG4gIGlmIChwYXJhbSA9PT0gJ2V2ZW4nKSB7XG4gICAgcGFyYW0gPSAnMm4rMCc7XG4gIH0gZWxzZSBpZiAocGFyYW0gPT09ICdvZGQnKSB7XG4gICAgcGFyYW0gPSAnMm4rMSc7XG4gIH0gZWxzZSBpZiAoIX5wYXJhbS5pbmRleE9mKCduJykpIHtcbiAgICBwYXJhbSA9ICcwbicgKyBwYXJhbTtcbiAgfVxuXG4gIGNhcCA9IC9eKFsrLV0pPyhcXGQrKT9uKFsrLV0pPyhcXGQrKT8kLy5leGVjKHBhcmFtKTtcblxuICByZXR1cm4ge1xuICAgIGdyb3VwOiBjYXBbMV0gPT09ICctJ1xuICAgICAgPyAtKGNhcFsyXSB8fCAxKVxuICAgICAgOiArKGNhcFsyXSB8fCAxKSxcbiAgICBvZmZzZXQ6IGNhcFs0XVxuICAgICAgPyAoY2FwWzNdID09PSAnLScgPyAtY2FwWzRdIDogK2NhcFs0XSlcbiAgICAgIDogMFxuICB9O1xufTtcblxudmFyIG50aCA9IGZ1bmN0aW9uKHBhcmFtLCB0ZXN0LCBsYXN0KSB7XG4gIHZhciBwYXJhbSA9IHBhcnNlTnRoKHBhcmFtKVxuICAgICwgZ3JvdXAgPSBwYXJhbS5ncm91cFxuICAgICwgb2Zmc2V0ID0gcGFyYW0ub2Zmc2V0XG4gICAgLCBmaW5kID0gIWxhc3QgPyBjaGlsZCA6IGxhc3RDaGlsZFxuICAgICwgYWR2YW5jZSA9ICFsYXN0ID8gbmV4dCA6IHByZXY7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKGVsLnBhcmVudE5vZGUubm9kZVR5cGUgIT09IDEpIHJldHVybjtcblxuICAgIHZhciByZWwgPSBmaW5kKGVsLnBhcmVudE5vZGUpXG4gICAgICAsIHBvcyA9IDA7XG5cbiAgICB3aGlsZSAocmVsKSB7XG4gICAgICBpZiAodGVzdChyZWwsIGVsKSkgcG9zKys7XG4gICAgICBpZiAocmVsID09PSBlbCkge1xuICAgICAgICBwb3MgLT0gb2Zmc2V0O1xuICAgICAgICByZXR1cm4gZ3JvdXAgJiYgcG9zXG4gICAgICAgICAgPyAhKHBvcyAlIGdyb3VwKSAmJiAocG9zIDwgMCA9PT0gZ3JvdXAgPCAwKVxuICAgICAgICAgIDogIXBvcztcbiAgICAgIH1cbiAgICAgIHJlbCA9IGFkdmFuY2UocmVsKTtcbiAgICB9XG4gIH07XG59O1xuXG4vKipcbiAqIFNpbXBsZSBTZWxlY3RvcnNcbiAqL1xuXG52YXIgc2VsZWN0b3JzID0ge1xuICAnKic6IChmdW5jdGlvbigpIHtcbiAgICBpZiAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpKTtcbiAgICAgIHJldHVybiAhIWVsLmdldEVsZW1lbnRzQnlUYWdOYW1lKCcqJylbMF07XG4gICAgfSgpKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKGVsLm5vZGVUeXBlID09PSAxKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH0pKCksXG4gICd0eXBlJzogZnVuY3Rpb24odHlwZSkge1xuICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gdHlwZTtcbiAgICB9O1xuICB9LFxuICAnYXR0cic6IGZ1bmN0aW9uKGtleSwgb3AsIHZhbCwgaSkge1xuICAgIG9wID0gb3BlcmF0b3JzW29wXTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciBhdHRyO1xuICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZm9yJzpcbiAgICAgICAgICBhdHRyID0gZWwuaHRtbEZvcjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2xhc3MnOlxuICAgICAgICAgIC8vIGNsYXNzTmFtZSBpcyAnJyB3aGVuIG5vbi1leGlzdGVudFxuICAgICAgICAgIC8vIGdldEF0dHJpYnV0ZSgnY2xhc3MnKSBpcyBudWxsXG4gICAgICAgICAgYXR0ciA9IGVsLmNsYXNzTmFtZTtcbiAgICAgICAgICBpZiAoYXR0ciA9PT0gJycgJiYgZWwuZ2V0QXR0cmlidXRlKCdjbGFzcycpID09IG51bGwpIHtcbiAgICAgICAgICAgIGF0dHIgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaHJlZic6XG4gICAgICAgICAgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicsIDIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0aXRsZSc6XG4gICAgICAgICAgLy8gZ2V0QXR0cmlidXRlKCd0aXRsZScpIGNhbiBiZSAnJyB3aGVuIG5vbi1leGlzdGVudCBzb21ldGltZXM/XG4gICAgICAgICAgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpZCc6XG4gICAgICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZSgnaWQnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBhdHRyID0gZWxba2V5XSAhPSBudWxsXG4gICAgICAgICAgICA/IGVsW2tleV1cbiAgICAgICAgICAgIDogZWwuZ2V0QXR0cmlidXRlICYmIGVsLmdldEF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHIgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgYXR0ciA9IGF0dHIgKyAnJztcbiAgICAgIGlmIChpKSB7XG4gICAgICAgIGF0dHIgPSBhdHRyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhbCA9IHZhbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9wKGF0dHIsIHZhbCk7XG4gICAgfTtcbiAgfSxcbiAgJzpmaXJzdC1jaGlsZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFwcmV2KGVsKSAmJiBlbC5wYXJlbnROb2RlLm5vZGVUeXBlID09PSAxO1xuICB9LFxuICAnOmxhc3QtY2hpbGQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhbmV4dChlbCkgJiYgZWwucGFyZW50Tm9kZS5ub2RlVHlwZSA9PT0gMTtcbiAgfSxcbiAgJzpvbmx5LWNoaWxkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIXByZXYoZWwpICYmICFuZXh0KGVsKVxuICAgICAgJiYgZWwucGFyZW50Tm9kZS5ub2RlVHlwZSA9PT0gMTtcbiAgfSxcbiAgJzpudGgtY2hpbGQnOiBmdW5jdGlvbihwYXJhbSwgbGFzdCkge1xuICAgIHJldHVybiBudGgocGFyYW0sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgbGFzdCk7XG4gIH0sXG4gICc6bnRoLWxhc3QtY2hpbGQnOiBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBzZWxlY3RvcnNbJzpudGgtY2hpbGQnXShwYXJhbSwgdHJ1ZSk7XG4gIH0sXG4gICc6cm9vdCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ID09PSBlbDtcbiAgfSxcbiAgJzplbXB0eSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFlbC5maXJzdENoaWxkO1xuICB9LFxuICAnOm5vdCc6IGZ1bmN0aW9uKHNlbCkge1xuICAgIHZhciB0ZXN0ID0gY29tcGlsZUdyb3VwKHNlbCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gIXRlc3QoZWwpO1xuICAgIH07XG4gIH0sXG4gICc6Zmlyc3Qtb2YtdHlwZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKGVsLnBhcmVudE5vZGUubm9kZVR5cGUgIT09IDEpIHJldHVybjtcbiAgICB2YXIgdHlwZSA9IGVsLm5vZGVOYW1lO1xuICAgIHdoaWxlIChlbCA9IHByZXYoZWwpKSB7XG4gICAgICBpZiAoZWwubm9kZU5hbWUgPT09IHR5cGUpIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gICc6bGFzdC1vZi10eXBlJzogZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoZWwucGFyZW50Tm9kZS5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuO1xuICAgIHZhciB0eXBlID0gZWwubm9kZU5hbWU7XG4gICAgd2hpbGUgKGVsID0gbmV4dChlbCkpIHtcbiAgICAgIGlmIChlbC5ub2RlTmFtZSA9PT0gdHlwZSkgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgJzpvbmx5LW9mLXR5cGUnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBzZWxlY3RvcnNbJzpmaXJzdC1vZi10eXBlJ10oZWwpXG4gICAgICAgICYmIHNlbGVjdG9yc1snOmxhc3Qtb2YtdHlwZSddKGVsKTtcbiAgfSxcbiAgJzpudGgtb2YtdHlwZSc6IGZ1bmN0aW9uKHBhcmFtLCBsYXN0KSB7XG4gICAgcmV0dXJuIG50aChwYXJhbSwgZnVuY3Rpb24ocmVsLCBlbCkge1xuICAgICAgcmV0dXJuIHJlbC5ub2RlTmFtZSA9PT0gZWwubm9kZU5hbWU7XG4gICAgfSwgbGFzdCk7XG4gIH0sXG4gICc6bnRoLWxhc3Qtb2YtdHlwZSc6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yc1snOm50aC1vZi10eXBlJ10ocGFyYW0sIHRydWUpO1xuICB9LFxuICAnOmNoZWNrZWQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhIShlbC5jaGVja2VkIHx8IGVsLnNlbGVjdGVkKTtcbiAgfSxcbiAgJzppbmRldGVybWluYXRlJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIXNlbGVjdG9yc1snOmNoZWNrZWQnXShlbCk7XG4gIH0sXG4gICc6ZW5hYmxlZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFlbC5kaXNhYmxlZCAmJiBlbC50eXBlICE9PSAnaGlkZGVuJztcbiAgfSxcbiAgJzpkaXNhYmxlZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICEhZWwuZGlzYWJsZWQ7XG4gIH0sXG4gICc6dGFyZ2V0JzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gZWwuaWQgPT09IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKTtcbiAgfSxcbiAgJzpmb2N1cyc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsID09PSBlbC5vd25lckRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIH0sXG4gICc6bWF0Y2hlcyc6IGZ1bmN0aW9uKHNlbCkge1xuICAgIHJldHVybiBjb21waWxlR3JvdXAoc2VsKTtcbiAgfSxcbiAgJzpudGgtbWF0Y2gnOiBmdW5jdGlvbihwYXJhbSwgbGFzdCkge1xuICAgIHZhciBhcmdzID0gcGFyYW0uc3BsaXQoL1xccyosXFxzKi8pXG4gICAgICAsIGFyZyA9IGFyZ3Muc2hpZnQoKVxuICAgICAgLCB0ZXN0ID0gY29tcGlsZUdyb3VwKGFyZ3Muam9pbignLCcpKTtcblxuICAgIHJldHVybiBudGgoYXJnLCB0ZXN0LCBsYXN0KTtcbiAgfSxcbiAgJzpudGgtbGFzdC1tYXRjaCc6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yc1snOm50aC1tYXRjaCddKHBhcmFtLCB0cnVlKTtcbiAgfSxcbiAgJzpsaW5rcy1oZXJlJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gZWwgKyAnJyA9PT0gd2luZG93LmxvY2F0aW9uICsgJyc7XG4gIH0sXG4gICc6bGFuZyc6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICB3aGlsZSAoZWwpIHtcbiAgICAgICAgaWYgKGVsLmxhbmcpIHJldHVybiBlbC5sYW5nLmluZGV4T2YocGFyYW0pID09PSAwO1xuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgJzpkaXInOiBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgd2hpbGUgKGVsKSB7XG4gICAgICAgIGlmIChlbC5kaXIpIHJldHVybiBlbC5kaXIgPT09IHBhcmFtO1xuICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgJzpzY29wZSc6IGZ1bmN0aW9uKGVsLCBjb24pIHtcbiAgICB2YXIgY29udGV4dCA9IGNvbiB8fCBlbC5vd25lckRvY3VtZW50O1xuICAgIGlmIChjb250ZXh0Lm5vZGVUeXBlID09PSA5KSB7XG4gICAgICByZXR1cm4gZWwgPT09IGNvbnRleHQuZG9jdW1lbnRFbGVtZW50O1xuICAgIH1cbiAgICByZXR1cm4gZWwgPT09IGNvbnRleHQ7XG4gIH0sXG4gICc6YW55LWxpbmsnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiB0eXBlb2YgZWwuaHJlZiA9PT0gJ3N0cmluZyc7XG4gIH0sXG4gICc6bG9jYWwtbGluayc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKGVsLm5vZGVOYW1lKSB7XG4gICAgICByZXR1cm4gZWwuaHJlZiAmJiBlbC5ob3N0ID09PSB3aW5kb3cubG9jYXRpb24uaG9zdDtcbiAgICB9XG4gICAgdmFyIHBhcmFtID0gK2VsICsgMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIGlmICghZWwuaHJlZikgcmV0dXJuO1xuXG4gICAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uICsgJydcbiAgICAgICAgLCBocmVmID0gZWwgKyAnJztcblxuICAgICAgcmV0dXJuIHRydW5jYXRlVXJsKHVybCwgcGFyYW0pID09PSB0cnVuY2F0ZVVybChocmVmLCBwYXJhbSk7XG4gICAgfTtcbiAgfSxcbiAgJzpkZWZhdWx0JzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gISFlbC5kZWZhdWx0U2VsZWN0ZWQ7XG4gIH0sXG4gICc6dmFsaWQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbC53aWxsVmFsaWRhdGUgfHwgKGVsLnZhbGlkaXR5ICYmIGVsLnZhbGlkaXR5LnZhbGlkKTtcbiAgfSxcbiAgJzppbnZhbGlkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIXNlbGVjdG9yc1snOnZhbGlkJ10oZWwpO1xuICB9LFxuICAnOmluLXJhbmdlJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gZWwudmFsdWUgPiBlbC5taW4gJiYgZWwudmFsdWUgPD0gZWwubWF4O1xuICB9LFxuICAnOm91dC1vZi1yYW5nZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFzZWxlY3RvcnNbJzppbi1yYW5nZSddKGVsKTtcbiAgfSxcbiAgJzpyZXF1aXJlZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICEhZWwucmVxdWlyZWQ7XG4gIH0sXG4gICc6b3B0aW9uYWwnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhZWwucmVxdWlyZWQ7XG4gIH0sXG4gICc6cmVhZC1vbmx5JzogZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoZWwucmVhZE9ubHkpIHJldHVybiB0cnVlO1xuXG4gICAgdmFyIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScpXG4gICAgICAsIHByb3AgPSBlbC5jb250ZW50RWRpdGFibGVcbiAgICAgICwgbmFtZSA9IGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBuYW1lID0gbmFtZSAhPT0gJ2lucHV0JyAmJiBuYW1lICE9PSAndGV4dGFyZWEnO1xuXG4gICAgcmV0dXJuIChuYW1lIHx8IGVsLmRpc2FibGVkKSAmJiBhdHRyID09IG51bGwgJiYgcHJvcCAhPT0gJ3RydWUnO1xuICB9LFxuICAnOnJlYWQtd3JpdGUnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhc2VsZWN0b3JzWyc6cmVhZC1vbmx5J10oZWwpO1xuICB9LFxuICAnOmhvdmVyJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6aG92ZXIgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzphY3RpdmUnOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzphY3RpdmUgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzpsaW5rJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6bGluayBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOnZpc2l0ZWQnOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzp2aXNpdGVkIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6Y29sdW1uJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6Y29sdW1uIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6bnRoLWNvbHVtbic6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOm50aC1jb2x1bW4gaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzpudGgtbGFzdC1jb2x1bW4nOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpudGgtbGFzdC1jb2x1bW4gaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzpjdXJyZW50JzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6Y3VycmVudCBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOnBhc3QnOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpwYXN0IGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6ZnV0dXJlJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6ZnV0dXJlIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gIC8vIE5vbi1zdGFuZGFyZCwgZm9yIGNvbXBhdGliaWxpdHkgcHVycG9zZXMuXG4gICc6Y29udGFpbnMnOiBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgdmFyIHRleHQgPSBlbC5pbm5lclRleHQgfHwgZWwudGV4dENvbnRlbnQgfHwgZWwudmFsdWUgfHwgJyc7XG4gICAgICByZXR1cm4gISF+dGV4dC5pbmRleE9mKHBhcmFtKTtcbiAgICB9O1xuICB9LFxuICAnOmhhcyc6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gemVzdChwYXJhbSwgZWwpLmxlbmd0aCA+IDA7XG4gICAgfTtcbiAgfVxuICAvLyBQb3RlbnRpYWxseSBhZGQgbW9yZSBwc2V1ZG8gc2VsZWN0b3JzIGZvclxuICAvLyBjb21wYXRpYmlsaXR5IHdpdGggc2l6emxlIGFuZCBtb3N0IG90aGVyXG4gIC8vIHNlbGVjdG9yIGVuZ2luZXMgKD8pLlxufTtcblxuLyoqXG4gKiBBdHRyaWJ1dGUgT3BlcmF0b3JzXG4gKi9cblxudmFyIG9wZXJhdG9ycyA9IHtcbiAgJy0nOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgJz0nOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcbiAgICByZXR1cm4gYXR0ciA9PT0gdmFsO1xuICB9LFxuICAnKj0nOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcbiAgICByZXR1cm4gYXR0ci5pbmRleE9mKHZhbCkgIT09IC0xO1xuICB9LFxuICAnfj0nOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcbiAgICB2YXIgaSA9IGF0dHIuaW5kZXhPZih2YWwpXG4gICAgICAsIGZcbiAgICAgICwgbDtcblxuICAgIGlmIChpID09PSAtMSkgcmV0dXJuO1xuICAgIGYgPSBhdHRyW2kgLSAxXTtcbiAgICBsID0gYXR0cltpICsgdmFsLmxlbmd0aF07XG5cbiAgICByZXR1cm4gKCFmIHx8IGYgPT09ICcgJykgJiYgKCFsIHx8IGwgPT09ICcgJyk7XG4gIH0sXG4gICd8PSc6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuICAgIHZhciBpID0gYXR0ci5pbmRleE9mKHZhbClcbiAgICAgICwgbDtcblxuICAgIGlmIChpICE9PSAwKSByZXR1cm47XG4gICAgbCA9IGF0dHJbaSArIHZhbC5sZW5ndGhdO1xuXG4gICAgcmV0dXJuIGwgPT09ICctJyB8fCAhbDtcbiAgfSxcbiAgJ149JzogZnVuY3Rpb24oYXR0ciwgdmFsKSB7XG4gICAgcmV0dXJuIGF0dHIuaW5kZXhPZih2YWwpID09PSAwO1xuICB9LFxuICAnJD0nOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcbiAgICByZXR1cm4gYXR0ci5pbmRleE9mKHZhbCkgKyB2YWwubGVuZ3RoID09PSBhdHRyLmxlbmd0aDtcbiAgfSxcbiAgLy8gbm9uLXN0YW5kYXJkXG4gICchPSc6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuICAgIHJldHVybiBhdHRyICE9PSB2YWw7XG4gIH1cbn07XG5cbi8qKlxuICogQ29tYmluYXRvciBMb2dpY1xuICovXG5cbnZhciBjb21iaW5hdG9ycyA9IHtcbiAgJyAnOiBmdW5jdGlvbih0ZXN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICB3aGlsZSAoZWwgPSBlbC5wYXJlbnROb2RlKSB7XG4gICAgICAgIGlmICh0ZXN0KGVsKSkgcmV0dXJuIGVsO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gICc+JzogZnVuY3Rpb24odGVzdCkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuIHRlc3QoZWwgPSBlbC5wYXJlbnROb2RlKSAmJiBlbDtcbiAgICB9O1xuICB9LFxuICAnKyc6IGZ1bmN0aW9uKHRlc3QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiB0ZXN0KGVsID0gcHJldihlbCkpICYmIGVsO1xuICAgIH07XG4gIH0sXG4gICd+JzogZnVuY3Rpb24odGVzdCkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgd2hpbGUgKGVsID0gcHJldihlbCkpIHtcbiAgICAgICAgaWYgKHRlc3QoZWwpKSByZXR1cm4gZWw7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgJ25vb3AnOiBmdW5jdGlvbih0ZXN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gdGVzdChlbCkgJiYgZWw7XG4gICAgfTtcbiAgfSxcbiAgJ3JlZic6IGZ1bmN0aW9uKHRlc3QsIG5hbWUpIHtcbiAgICB2YXIgbm9kZTtcblxuICAgIGZ1bmN0aW9uIHJlZihlbCkge1xuICAgICAgdmFyIGRvYyA9IGVsLm93bmVyRG9jdW1lbnRcbiAgICAgICAgLCBub2RlcyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpXG4gICAgICAgICwgaSA9IG5vZGVzLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChyZWYudGVzdChlbCkpIHtcbiAgICAgICAgICBub2RlID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBub2RlID0gbnVsbDtcbiAgICB9XG5cbiAgICByZWYuY29tYmluYXRvciA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICBpZiAoIW5vZGUgfHwgIW5vZGUuZ2V0QXR0cmlidXRlKSByZXR1cm47XG5cbiAgICAgIHZhciBhdHRyID0gbm9kZS5nZXRBdHRyaWJ1dGUobmFtZSkgfHwgJyc7XG4gICAgICBpZiAoYXR0clswXSA9PT0gJyMnKSBhdHRyID0gYXR0ci5zdWJzdHJpbmcoMSk7XG5cbiAgICAgIGlmIChhdHRyID09PSBlbC5pZCAmJiB0ZXN0KG5vZGUpKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVmO1xuICB9XG59O1xuXG4vKipcbiAqIEdyYW1tYXJcbiAqL1xuXG52YXIgcnVsZXMgPSB7XG4gIHFuYW1lOiAvXiAqKFtcXHdcXC1dK3xcXCopLyxcbiAgc2ltcGxlOiAvXig/OihbLiNdW1xcd1xcLV0rKXxwc2V1ZG98YXR0cikvLFxuICByZWY6IC9eICpcXC8oW1xcd1xcLV0rKVxcLyAqLyxcbiAgY29tYmluYXRvcjogL14oPzogKyhbXiBcXHcqXSkgK3woICkrfChbXiBcXHcqXSkpKD8hICokKS8sXG4gIGF0dHI6IC9eXFxbKFtcXHdcXC1dKykoPzooW15cXHddPz0pKGluc2lkZSkpP1xcXS8sXG4gIHBzZXVkbzogL14oOltcXHdcXC1dKykoPzpcXCgoaW5zaWRlKVxcKSk/LyxcbiAgaW5zaWRlOiAvKD86XCIoPzpcXFxcXCJ8W15cIl0pKlwifCcoPzpcXFxcJ3xbXiddKSonfDxbXlwiJz5dKj58XFxcXFtcIic+XXxbXlwiJz5dKSovXG59O1xuXG5ydWxlcy5pbnNpZGUgPSByZXBsYWNlKHJ1bGVzLmluc2lkZSwgJ1teXCJcXCc+XSonLCBydWxlcy5pbnNpZGUpO1xucnVsZXMuYXR0ciA9IHJlcGxhY2UocnVsZXMuYXR0ciwgJ2luc2lkZScsIG1ha2VJbnNpZGUoJ1xcXFxbJywgJ1xcXFxdJykpO1xucnVsZXMucHNldWRvID0gcmVwbGFjZShydWxlcy5wc2V1ZG8sICdpbnNpZGUnLCBtYWtlSW5zaWRlKCdcXFxcKCcsICdcXFxcKScpKTtcbnJ1bGVzLnNpbXBsZSA9IHJlcGxhY2UocnVsZXMuc2ltcGxlLCAncHNldWRvJywgcnVsZXMucHNldWRvKTtcbnJ1bGVzLnNpbXBsZSA9IHJlcGxhY2UocnVsZXMuc2ltcGxlLCAnYXR0cicsIHJ1bGVzLmF0dHIpO1xuXG4vKipcbiAqIENvbXBpbGluZ1xuICovXG5cbnZhciBjb21waWxlID0gZnVuY3Rpb24oc2VsKSB7XG4gIHZhciBzZWwgPSBzZWwucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG4gICAgLCB0ZXN0XG4gICAgLCBmaWx0ZXIgPSBbXVxuICAgICwgYnVmZiA9IFtdXG4gICAgLCBzdWJqZWN0XG4gICAgLCBxbmFtZVxuICAgICwgY2FwXG4gICAgLCBvcFxuICAgICwgcmVmO1xuXG4gIHdoaWxlIChzZWwpIHtcbiAgICBpZiAoY2FwID0gcnVsZXMucW5hbWUuZXhlYyhzZWwpKSB7XG4gICAgICBzZWwgPSBzZWwuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgcW5hbWUgPSBjYXBbMV07XG4gICAgICBidWZmLnB1c2godG9rKHFuYW1lLCB0cnVlKSk7XG4gICAgfSBlbHNlIGlmIChjYXAgPSBydWxlcy5zaW1wbGUuZXhlYyhzZWwpKSB7XG4gICAgICBzZWwgPSBzZWwuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgcW5hbWUgPSAnKic7XG4gICAgICBidWZmLnB1c2godG9rKHFuYW1lLCB0cnVlKSk7XG4gICAgICBidWZmLnB1c2godG9rKGNhcCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2VsZWN0b3IuJyk7XG4gICAgfVxuXG4gICAgd2hpbGUgKGNhcCA9IHJ1bGVzLnNpbXBsZS5leGVjKHNlbCkpIHtcbiAgICAgIHNlbCA9IHNlbC5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBidWZmLnB1c2godG9rKGNhcCkpO1xuICAgIH1cblxuICAgIGlmIChzZWxbMF0gPT09ICchJykge1xuICAgICAgc2VsID0gc2VsLnN1YnN0cmluZygxKTtcbiAgICAgIHN1YmplY3QgPSBtYWtlU3ViamVjdCgpO1xuICAgICAgc3ViamVjdC5xbmFtZSA9IHFuYW1lO1xuICAgICAgYnVmZi5wdXNoKHN1YmplY3Quc2ltcGxlKTtcbiAgICB9XG5cbiAgICBpZiAoY2FwID0gcnVsZXMucmVmLmV4ZWMoc2VsKSkge1xuICAgICAgc2VsID0gc2VsLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHJlZiA9IGNvbWJpbmF0b3JzLnJlZihtYWtlU2ltcGxlKGJ1ZmYpLCBjYXBbMV0pO1xuICAgICAgZmlsdGVyLnB1c2gocmVmLmNvbWJpbmF0b3IpO1xuICAgICAgYnVmZiA9IFtdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGNhcCA9IHJ1bGVzLmNvbWJpbmF0b3IuZXhlYyhzZWwpKSB7XG4gICAgICBzZWwgPSBzZWwuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3AgPSBjYXBbMV0gfHwgY2FwWzJdIHx8IGNhcFszXTtcbiAgICAgIGlmIChvcCA9PT0gJywnKSB7XG4gICAgICAgIGZpbHRlci5wdXNoKGNvbWJpbmF0b3JzLm5vb3AobWFrZVNpbXBsZShidWZmKSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3AgPSAnbm9vcCc7XG4gICAgfVxuXG4gICAgZmlsdGVyLnB1c2goY29tYmluYXRvcnNbb3BdKG1ha2VTaW1wbGUoYnVmZikpKTtcbiAgICBidWZmID0gW107XG4gIH1cblxuICB0ZXN0ID0gbWFrZVRlc3QoZmlsdGVyKTtcbiAgdGVzdC5xbmFtZSA9IHFuYW1lO1xuICB0ZXN0LnNlbCA9IHNlbDtcblxuICBpZiAoc3ViamVjdCkge1xuICAgIHN1YmplY3QubG5hbWUgPSB0ZXN0LnFuYW1lO1xuXG4gICAgc3ViamVjdC50ZXN0ID0gdGVzdDtcbiAgICBzdWJqZWN0LnFuYW1lID0gc3ViamVjdC5xbmFtZTtcbiAgICBzdWJqZWN0LnNlbCA9IHRlc3Quc2VsO1xuICAgIHRlc3QgPSBzdWJqZWN0O1xuICB9XG5cbiAgaWYgKHJlZikge1xuICAgIHJlZi50ZXN0ID0gdGVzdDtcbiAgICByZWYucW5hbWUgPSB0ZXN0LnFuYW1lO1xuICAgIHJlZi5zZWwgPSB0ZXN0LnNlbDtcbiAgICB0ZXN0ID0gcmVmO1xuICB9XG5cbiAgcmV0dXJuIHRlc3Q7XG59O1xuXG52YXIgdG9rID0gZnVuY3Rpb24oY2FwLCBxbmFtZSkge1xuICAvLyBxbmFtZVxuICBpZiAocW5hbWUpIHtcbiAgICByZXR1cm4gY2FwID09PSAnKidcbiAgICAgID8gc2VsZWN0b3JzWycqJ11cbiAgICAgIDogc2VsZWN0b3JzLnR5cGUoY2FwKTtcbiAgfVxuXG4gIC8vIGNsYXNzL2lkXG4gIGlmIChjYXBbMV0pIHtcbiAgICByZXR1cm4gY2FwWzFdWzBdID09PSAnLidcbiAgICAgID8gc2VsZWN0b3JzLmF0dHIoJ2NsYXNzJywgJ349JywgY2FwWzFdLnN1YnN0cmluZygxKSlcbiAgICAgIDogc2VsZWN0b3JzLmF0dHIoJ2lkJywgJz0nLCBjYXBbMV0uc3Vic3RyaW5nKDEpKTtcbiAgfVxuXG4gIC8vIHBzZXVkby1uYW1lXG4gIC8vIGluc2lkZS1wc2V1ZG9cbiAgaWYgKGNhcFsyXSkge1xuICAgIHJldHVybiBjYXBbM11cbiAgICAgID8gc2VsZWN0b3JzW2NhcFsyXV0odW5xdW90ZShjYXBbM10pKVxuICAgICAgOiBzZWxlY3RvcnNbY2FwWzJdXTtcbiAgfVxuXG4gIC8vIGF0dHIgbmFtZVxuICAvLyBhdHRyIG9wXG4gIC8vIGF0dHIgdmFsdWVcbiAgaWYgKGNhcFs0XSkge1xuICAgIHZhciBpO1xuICAgIGlmIChjYXBbNl0pIHtcbiAgICAgIGkgPSBjYXBbNl0ubGVuZ3RoO1xuICAgICAgY2FwWzZdID0gY2FwWzZdLnJlcGxhY2UoLyAraSQvLCAnJyk7XG4gICAgICBpID0gaSA+IGNhcFs2XS5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RvcnMuYXR0cihjYXBbNF0sIGNhcFs1XSB8fCAnLScsIHVucXVvdGUoY2FwWzZdKSwgaSk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gU2VsZWN0b3IuJyk7XG59O1xuXG52YXIgbWFrZVNpbXBsZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgdmFyIGwgPSBmdW5jLmxlbmd0aFxuICAgICwgaTtcblxuICAvLyBQb3RlbnRpYWxseSBtYWtlIHN1cmVcbiAgLy8gYGVsYCBpcyB0cnV0aHkuXG4gIGlmIChsIDwgMikgcmV0dXJuIGZ1bmNbMF07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKCFlbCkgcmV0dXJuO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICghZnVuY1tpXShlbCkpIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59O1xuXG52YXIgbWFrZVRlc3QgPSBmdW5jdGlvbihmdW5jKSB7XG4gIGlmIChmdW5jLmxlbmd0aCA8IDIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiAhIWZ1bmNbMF0oZWwpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIGkgPSBmdW5jLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoIShlbCA9IGZ1bmNbaV0oZWwpKSkgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn07XG5cbnZhciBtYWtlU3ViamVjdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdGFyZ2V0O1xuXG4gIGZ1bmN0aW9uIHN1YmplY3QoZWwpIHtcbiAgICB2YXIgbm9kZSA9IGVsLm93bmVyRG9jdW1lbnRcbiAgICAgICwgc2NvcGUgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKHN1YmplY3QubG5hbWUpXG4gICAgICAsIGkgPSBzY29wZS5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoc3ViamVjdC50ZXN0KHNjb3BlW2ldKSAmJiB0YXJnZXQgPT09IGVsKSB7XG4gICAgICAgIHRhcmdldCA9IG51bGw7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRhcmdldCA9IG51bGw7XG4gIH1cblxuICBzdWJqZWN0LnNpbXBsZSA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdGFyZ2V0ID0gZWw7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgcmV0dXJuIHN1YmplY3Q7XG59O1xuXG52YXIgY29tcGlsZUdyb3VwID0gZnVuY3Rpb24oc2VsKSB7XG4gIHZhciB0ZXN0ID0gY29tcGlsZShzZWwpXG4gICAgLCB0ZXN0cyA9IFsgdGVzdCBdO1xuXG4gIHdoaWxlICh0ZXN0LnNlbCkge1xuICAgIHRlc3QgPSBjb21waWxlKHRlc3Quc2VsKTtcbiAgICB0ZXN0cy5wdXNoKHRlc3QpO1xuICB9XG5cbiAgaWYgKHRlc3RzLmxlbmd0aCA8IDIpIHJldHVybiB0ZXN0O1xuXG4gIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgIHZhciBsID0gdGVzdHMubGVuZ3RoXG4gICAgICAsIGkgPSAwO1xuXG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICh0ZXN0c1tpXShlbCkpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcbn07XG5cbi8qKlxuICogU2VsZWN0aW9uXG4gKi9cblxudmFyIGZpbmQgPSBmdW5jdGlvbihzZWwsIG5vZGUpIHtcbiAgdmFyIHJlc3VsdHMgPSBbXVxuICAgICwgdGVzdCA9IGNvbXBpbGUoc2VsKVxuICAgICwgc2NvcGUgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRlc3QucW5hbWUpXG4gICAgLCBpID0gMFxuICAgICwgZWw7XG5cbiAgd2hpbGUgKGVsID0gc2NvcGVbaSsrXSkge1xuICAgIGlmICh0ZXN0KGVsKSkgcmVzdWx0cy5wdXNoKGVsKTtcbiAgfVxuXG4gIGlmICh0ZXN0LnNlbCkge1xuICAgIHdoaWxlICh0ZXN0LnNlbCkge1xuICAgICAgdGVzdCA9IGNvbXBpbGUodGVzdC5zZWwpO1xuICAgICAgc2NvcGUgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRlc3QucW5hbWUpO1xuICAgICAgaSA9IDA7XG4gICAgICB3aGlsZSAoZWwgPSBzY29wZVtpKytdKSB7XG4gICAgICAgIGlmICh0ZXN0KGVsKSAmJiAhfmluZGV4T2YuY2FsbChyZXN1bHRzLCBlbCkpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goZWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdHMuc29ydChvcmRlcik7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8qKlxuICogTmF0aXZlXG4gKi9cblxudmFyIHNlbGVjdCA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHNsaWNlID0gKGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnemVzdCcpKTtcbiAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlID0gbnVsbDtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGEgPSBbXSwgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgZm9yICg7IGkgPCBsOyBpKyspIGEucHVzaCh0aGlzW2ldKTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9O1xuICAgIH1cbiAgfSkoKTtcblxuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzZWwsIG5vZGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBzbGljZS5jYWxsKG5vZGUucXVlcnlTZWxlY3RvckFsbChzZWwpKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmluZChzZWwsIG5vZGUpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oc2VsLCBub2RlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChzZWxbMF0gPT09ICcjJyAmJiAvXiNbXFx3XFwtXSskLy50ZXN0KHNlbCkpIHtcbiAgICAgICAgcmV0dXJuIFtub2RlLmdldEVsZW1lbnRCeUlkKHNlbC5zdWJzdHJpbmcoMSkpXTtcbiAgICAgIH1cbiAgICAgIGlmIChzZWxbMF0gPT09ICcuJyAmJiAvXlxcLltcXHdcXC1dKyQvLnRlc3Qoc2VsKSkge1xuICAgICAgICBzZWwgPSBub2RlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2VsLnN1YnN0cmluZygxKSk7XG4gICAgICAgIHJldHVybiBzbGljZS5jYWxsKHNlbCk7XG4gICAgICB9XG4gICAgICBpZiAoL15bXFx3XFwtXSskLy50ZXN0KHNlbCkpIHtcbiAgICAgICAgcmV0dXJuIHNsaWNlLmNhbGwobm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShzZWwpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIDtcbiAgICB9XG4gICAgcmV0dXJuIGZpbmQoc2VsLCBub2RlKTtcbiAgfTtcbn0pKCk7XG5cbi8qKlxuICogWmVzdFxuICovXG5cbnZhciB6ZXN0ID0gZnVuY3Rpb24oc2VsLCBub2RlKSB7XG4gIHRyeSB7XG4gICAgc2VsID0gc2VsZWN0KHNlbCwgbm9kZSB8fCBkb2N1bWVudCk7XG4gIH0gY2F0Y2goZSkge1xuICAgIGlmICh3aW5kb3cuWkVTVF9ERUJVRykge1xuICAgICAgY29uc29sZS5sb2coZS5zdGFjayB8fCBlICsgJycpO1xuICAgIH1cbiAgICBzZWwgPSBbXTtcbiAgfVxuICByZXR1cm4gc2VsO1xufTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xuXG56ZXN0LnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbnplc3Qub3BlcmF0b3JzID0gb3BlcmF0b3JzO1xuemVzdC5jb21iaW5hdG9ycyA9IGNvbWJpbmF0b3JzO1xuemVzdC5jb21waWxlID0gY29tcGlsZUdyb3VwO1xuXG56ZXN0Lm1hdGNoZXMgPSBmdW5jdGlvbihlbCwgc2VsKSB7XG4gIHJldHVybiAhIWNvbXBpbGVHcm91cChzZWwpKGVsKTtcbn07XG5cbnplc3QuY2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKGNvbXBpbGUucmF3KSByZXR1cm47XG5cbiAgdmFyIHJhdyA9IGNvbXBpbGVcbiAgICAsIGNhY2hlID0ge307XG5cbiAgY29tcGlsZSA9IGZ1bmN0aW9uKHNlbCkge1xuICAgIHJldHVybiBjYWNoZVtzZWxdXG4gICAgICB8fCAoY2FjaGVbc2VsXSA9IHJhdyhzZWwpKTtcbiAgfTtcblxuICBjb21waWxlLnJhdyA9IHJhdztcbiAgemVzdC5fY2FjaGUgPSBjYWNoZTtcbn07XG5cbnplc3Qubm9DYWNoZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWNvbXBpbGUucmF3KSByZXR1cm47XG4gIGNvbXBpbGUgPSBjb21waWxlLnJhdztcbiAgZGVsZXRlIHplc3QuX2NhY2hlO1xufTtcblxuemVzdC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gIHdpbmRvdy56ZXN0ID0gb2xkO1xuICByZXR1cm4gemVzdDtcbn07XG5cbnplc3Qubm9OYXRpdmUgPSBmdW5jdGlvbigpIHtcbiAgc2VsZWN0ID0gZmluZDtcbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHplc3Q7XG59IGVsc2Uge1xuICB0aGlzLnplc3QgPSB6ZXN0O1xufVxuXG5pZiAod2luZG93LlpFU1RfREVCVUcpIHtcbiAgemVzdC5ub05hdGl2ZSgpO1xufSBlbHNlIHtcbiAgemVzdC5jYWNoZSgpO1xufVxuXG59KS5jYWxsKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcyB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpO1xufSgpKTtcbiIsInZhciBwZXJmbm93ICAgICA9IHJlcXVpcmUoXCJ1dGlsL3BlcmZub3dcIiksXG4gICAgUGFnZVZpZXcgICAgPSByZXF1aXJlKFwiLi4vdmlldy9wYWdlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhZ2UoY29udGFpbmVyKSB7XG4gIGNvbnNvbGUubG9nKFwiSW5pdGlhbGl6aW5nIHBhZ2VGYWN0b3J5XCIsXCJbflwiICsgcGVyZm5vdygpICsgXCJtc11cIilcbiAgXG4gIHJldHVybiB7XG4gICAgdmlldzpudWxsLFxuICAgIHN0YXJ0OmZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnZpZXcgPSBuZXcgUGFnZVZpZXcoe1xuICAgICAgICBlbDogXCIjcGFnZVwiLFxuICAgICAgICB0ZW1wbGF0ZTogY29udGFpbmVyLnRlbXBsYXRlLFxuICAgICAgICBtb2RlbDogY29udGFpbmVyLmNvbmZpZy5hYm91dFxuICAgICAgfSk7XG4gICAgfSxcbiAgICBsb2FkUGFnZTogZnVuY3Rpb24ocGFnZSxzdWJwYWdlKSB7XG4gICAgICB0aGlzLnZpZXcucmVuZGVyKHBhZ2Usc3VicGFnZSk7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiXFx0XCIsIFwicGFnZUZhY3RvcnkgRGVzdHJveWVkXCIpO1xuICAgIH1cbiAgfVxufTtcbiIsInZhciBoYW5kbGViYXJzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKSxcbiAgICBsYXlvdXRzICAgID0gcmVxdWlyZShcImhhbmRsZWJhcnMtbGF5b3V0c1wiKSxcbiAgICBfdGVtcGxhdGVzID0gcmVxdWlyZShcIi4uL3RlbXBsYXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbnRhaW5lcil7XG4gICAgLy9JbnN0YW50aWF0ZSB0ZW1wbGF0ZXMgYnkgaW5qZWN0aW5nIGhhbmRsZWJhcnNcbiAgICB2YXIgdGVtcGxhdGVzID0gX3RlbXBsYXRlcyhoYW5kbGViYXJzKTtcblxuICAgIC8vUmVnaXN0ZXIgbGF5b3V0cyBoZWxwZXJcbiAgICBoYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKGxheW91dHMoaGFuZGxlYmFycykpO1xuXG4gICAgLy9SZWdpc3RlciBsYXlvdXQgcGFydGlhbFxuICAgIGhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKCdsYXlvdXQnLCB0ZW1wbGF0ZXNbJ2xheW91dCddKTtcblxuICAgIC8vcmV0dXJuIHRlbXBsYXRlcztcbiAgICByZXR1cm4gdGVtcGxhdGVzO1xufVxuIiwid2luZG93LiQgICAgICAgICAgPSByZXF1aXJlKFwiemVzdFwiKTtcblxudmFyIHBlcmZub3cgPSByZXF1aXJlKCd1dGlsL3BlcmZub3cnKSxcbiAgICBzd2FwQ1NTID0gcmVxdWlyZSgndXRpbC9zd2FwY3NzJyksXG4gICAgZmx1eGJvdHRsZSA9IHJlcXVpcmUoJ2ZsdXhib3R0bGUnKSxcbiAgICBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcvYXBwJyksXG4gICAgY29udGVudCA9ICh7XCJzZXJ2aWNlXCI6KHtcImNvbmZpZ1wiOnJlcXVpcmUoXCIuL3NlcnZpY2UvY29uZmlnLmpzXCIpLFwicm91dGVyXCI6cmVxdWlyZShcIi4vc2VydmljZS9yb3V0ZXIuanNcIil9KSxcImZhY3RvcnlcIjooe1wicGFnZVwiOnJlcXVpcmUoXCIuL2ZhY3RvcnkvcGFnZS5qc1wiKSxcInRlbXBsYXRlXCI6cmVxdWlyZShcIi4vZmFjdG9yeS90ZW1wbGF0ZS5qc1wiKX0pfSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4vKipcbiAqIENvcmUgZm9yIHlvdXIgYXBwbGljYXRpb24gdGhhdCBnZXRzIGJvdHRsZWQgaW50byBhIGZhY3RvcnkuXG4gKiBBbGwgeW91ciBzZXJ2aWNlcywgZmFjdG9yaWVzIGFuZCBzdWNoIHdpbGwgYmUgYm90dGxlZCBiZWZvcmVoYW5kIGFuZFxuICogYXJlIGFjY2VzaWJsZSBmcm9tIGBjb250YWluZXJgLlxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRhaW5lciBBIEJvdHRsZUpTIGNvbnRhaW5lclxuICogQHJldHVybnMge29iamVjdH0gc2VydmljZSBBIHNlcnZpY2UgdG8gZXhwb3NlXG4gKi9cbnZhciBBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICBcbiAgbGV0IHJvdXRlSGFuZGxlciA9IChvcHRpb25zKSA9PlxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5wYWdlLmxvYWRQYWdlKG9wdGlvbnMucGFnZSxvcHRpb25zLnN1YnBhZ2UpO1xuICAgIFxuICBjb250YWluZXIucm91dGVyLmFkZChcIntwYWdlfS97c3VicGFnZX1cIiwgcm91dGVIYW5kbGVyICk7XG4gIGNvbnRhaW5lci5yb3V0ZXIuYWRkKFwie3BhZ2V9XCIsICAgICAgICAgICByb3V0ZUhhbmRsZXIgKTtcbiAgXG4gIFxuICByZXR1cm4ge1xuICAgIGZhZGVJbjogZnVuY3Rpb24oZHVyYXRpb24sc3RlcHMpe1xuICAgICAgXG4gICAgbGV0IGh0bWwgPSAkKFwiaHRtbFwiKVswXSxcbiAgICAgICAgb3BhY2l0eSA9IDAsXG4gICAgICAgIGxpZnQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgIG9wYWNpdHkgKz0gMS9zdGVwcztcbiAgICAgICAgICBcbiAgICAgICAgICBodG1sLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5LnRvU3RyaW5nKCk7XG4gICAgICBcbiAgICAgICAgICBpZiAob3BhY2l0eSA8IDEpXG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChsaWZ0LDEwKVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICBodG1sLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgIGh0bWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBcbiAgICBcbiAgICB3aW5kb3cuc2V0VGltZW91dChsaWZ0LGR1cmF0aW9uL3N0ZXBzKVxuICAgIH0sXG4gICAgc3RhcnQ6ICAgIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiXFx0XCIsXCJBcHBsaWNhdGlvbiBTdGFydGVkXCIsIFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpO1xuICAgIFxuICAgIGNvbnRhaW5lci5zdHlsZSA9IHN3YXBDU1MoJChcIiN0aGVtZVwiKVswXSk7XG4gICAgXG4gICAgJChcIiN0aGVtZXNlbGVjdFwiKVswXS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsKGUpID0+IHtcbiAgICAgIGxldCB1cmkgPSBcImh0dHBzOi8vamVuaWwuZ2l0aHViLmlvL2J1bG1hc3dhdGNoL1wiK2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNyY0VsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbHVlK1wiL2J1bG1hc3dhdGNoLm1pbi5jc3NcIjtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5zd2FwKHVyaSk7XG4gICAgfSlcbiAgXG4gICAgY29udGFpbmVyLnBhZ2Uuc3RhcnQoKTtcbiAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGUpID0+IGNvbnRhaW5lci5yb3V0ZXIucnVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSBcIlwiKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBcImhvbWVcIlxuICAgIFxuICAgIGNvbnRhaW5lci5yb3V0ZXIucnVuKCk7XG4gICAgXG4gICAgdGhpcy5mYWRlSW4oNzUwLDEwKTtcbiAgICBcbiAgICB9XG4gIH1cbn07XG5cbndpbmRvdy5hcHAgPSBmbHV4Ym90dGxlLnNldHVwKEFwcGxpY2F0aW9uLGNvbmZpZyxjb250ZW50KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjtcbiIsInZhciBhcHBjb25maWcgPSByZXF1aXJlKFwiLi4vLi4vY29uZmlnL2FwcFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb25maWcoKXtcbiAgcmV0dXJuIGFwcGNvbmZpZztcbn07XG4iLCJ2YXIgcGVyZm5vdyAgPSByZXF1aXJlKFwidXRpbC9wZXJmbm93XCIpLFxuICAgIExpZ2h0cm91dGVyID0gcmVxdWlyZShcImxpZ2h0cm91dGVyXCIpO1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByb3V0ZXIoKSB7XG5cbiAgY29uc29sZS5sb2coXCJJbml0aWFsaXppbmcgUm91dGVyTW9kdWxlXCIsIFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpXG4gIFxuICB2YXIgcm91dGVyID0gbmV3IExpZ2h0cm91dGVyKHtcblx0ICB0eXBlOiAnaGFzaCcsICAgICAgICAgICAgIC8vIERlZmF1bHQgcm91dGluZyB0eXBlXG5cdCAgcGF0aFJvb3Q6ICdmbHV4YnVpbGQnLCAgLy8gQmFzZSBwYXRoIGZvciB5b3VyIGFwcFxuICB9KTtcbiBcbiAgcmV0dXJuIHJvdXRlcjtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKXt2YXIgY29udGFpbmVyID0ge307IGNvbnRhaW5lcltcImFib3V0XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5BYm91dDwvaDI+XFxuIFxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICAgICAgPGgyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+QXV0aG9yPC9oMj5cXG4gICAgICA8cCBjbGFzcz1cXFwiYm94XFxcIj5cXG4gICAgICAgIEZsdXhidWlsZCBpcyB3cml0dGVuIGJ5IDxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9GbHViYmV4XFxcIj5GbHViYmV4LjwvYT5cXG4gICAgICA8L3A+XFxuICAgIDwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkaXNjXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICA8aDEgY2xhc3M9XFxcInRpdGxlXFxcIj5EaXNjPC9oMT5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGVtYmVkIHNyYz1cXFwiY29udGVudC9kaXNjL2luZGV4Lmh0bWxcXFwiIFxcbiAgICAgICAgICAgY2xhc3M9XFxcIm5vLW1hcmdpblxcXCIgXFxuICAgICAgICAgICBzdHlsZT1cXFwiaGVpZ2h0OjkwJTt3aWR0aDoxMDAlXFxcIj48L2VtYmVkPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcImhvbWVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGgxIGNsYXNzPVxcXCJ0aXRsZVxcXCI+Rmx1eGJ1aWxkPC9oMT5cXG48aDEgY2xhc3M9XFxcInN1YnRpdGxlXFxcIj5cXG4gICAgICAgIEVtYmVyLWluc3BpcmVkIGJ1aWxkIHRvb2wgd3JpdHRlbiBpbiBOb2RlLmpzXFxuICA8c3BhbiBjbGFzcz1cXFwiZmFkZS1pbi1mcm9tLXRvcCBhbmltLWRlbGF5LS0xMFxcXCI+XFxuICAgICAgICAgIGZvciBjcmVhdGluZyBmYXN0LFxcbiAgPC9zcGFuPlxcbiAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMTVcXFwiPmxpZ2h0d2VpZ2h0LDwvc3Bhbj5cXG4gIDxzcGFuIGNsYXNzPVxcXCJmYWRlLWluLWZyb20tdG9wIGFuaW0tZGVsYXktLTIwXFxcIj51bmNvdXBsZWQsPC9zcGFuPlxcbiAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMjVcXFwiPmZ1bGwtc2NhbGUgYXBwbGljYXRpb25zIC0gPC9zcGFuPlxcbiAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMzVcXFwiPnRoYXQgd29yayBhbnl3aGVyZSA8L3NwYW4+XFxuPC9oMT5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWFuY2VzdG9yXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwidGlsZSBpcy1wYXJlbnQgaXMtdmVydGljYWxcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcInRpbGUgaXMtY2hpbGQgYm94XFxcIj5cXG4gICAgPGgyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+R3VscCA0PC9oMiBjbGFzcz1cXFwidGl0bGVcXFwiPlxcbiAgICA8cD5cXG4gICAgICAgICAgZ3VscCBpcyBhIHRvb2xraXQgZm9yIGF1dG9tYXRpbmcgcGFpbmZ1bCBvciB0aW1lLWNvbnN1bWluZyB0YXNrcyBpbiB5b3VyIGRldmVsb3BtZW50IHdvcmtmbG93LCBzbyB5b3UgY2FuIHN0b3AgbWVzc2luZyBhcm91bmQgYW5kIGJ1aWxkIHNvbWV0aGluZy5cXG4gICAgICA8L3A+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwidGlsZSBpcy1jaGlsZCBib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+QnJvd3NlcmlmeTwvaDIgY2xhc3M9XFxcInRpdGxlXFxcIj5cXG4gICAgICAgIDxwPlxcbiAgICAgICAgICBCcm93c2VycyBkb24ndCBoYXZlIHRoZSByZXF1aXJlIG1ldGhvZCBkZWZpbmVkLCBidXQgTm9kZS5qcyBkb2VzLiBXaXRoIEJyb3dzZXJpZnkgeW91IGNhbiB3cml0ZSBjb2RlIHRoYXQgdXNlcyByZXF1aXJlIGluIHRoZSBzYW1lIHdheSB0aGF0IHlvdSB3b3VsZCB1c2UgaXQgaW4gTm9kZS5cXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWNoaWxkIGJveFxcXCI+XFxuICAgICAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5Cb3R0bGUuanM8L2gyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICBCb3R0bGVKUyBpcyBhIHRpbnksIHBvd2VyZnVsIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGNvbnRhaW5lci4gSXQgZmVhdHVyZXMgbGF6eSBsb2FkaW5nLCBtaWRkbGV3YXJlIGhvb2tzLCBkZWNvcmF0b3JzIGFuZCBhIGNsZWFuIGFwaSBpbnNwaXJlZCBieSB0aGUgQW5ndWxhckpTIE1vZHVsZSBBUEkgYW5kIHRoZSBzaW1wbGUgUEhQIGxpYnJhcnkgUGltcGxlLiBcXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcInRpbGUgaXMtcGFyZW50IGlzLXZlcnRpY2FsXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWNoaWxkIGJveFxcXCI+XFxuICAgICAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5IYW5kbGViYXJzPC9oMiBjbGFzcz1cXFwidGl0bGVcXFwiPlxcbiAgICAgICAgPHA+XFxuICAgICAgICAgIEhhbmRsZWJhcnMgcHJvdmlkZXMgdGhlIHBvd2VyIG5lY2Vzc2FyeSB0byBsZXQgeW91IGJ1aWxkIHNlbWFudGljIHRlbXBsYXRlcyBlZmZlY3RpdmVseSB3aXRoIG5vIGZydXN0cmF0aW9uLlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcInRpbGUgaXMtY2hpbGQgYm94XFxcIj5cXG4gICAgICAgIDxoMiBjbGFzcz1cXFwidGl0bGVcXFwiPkJ1bG1hIENTUzwvaDIgY2xhc3M9XFxcInRpdGxlXFxcIj5cXG4gICAgICAgIDxwPlxcbiAgICAgICAgICBCdWxtYSBpcyBhIGZyZWUgYW5kIG9wZW4gc291cmNlIENTUyBmcmFtZXdvcmsgYmFzZWQgb24gRmxleGJveC5cXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWNoaWxkIGJveFxcXCI+XFxuICAgICAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5GbHV4YnVpbGQ8L2gyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICAgQnVpbGQgYmxhemluZ2x5LWZhc3QgYXBwbGljYXRpb25zIHVzaW5nIGFsbCBvZiB0aGUgYWJvdmUsIHdpdGggcHJlbWFkZSBndWxwIHRhc2tzIGZvciBhdXRvbWF0ZWQgdGVzdGluZywgZG9jdW1lbnRhdGlvbix0ZW1wbGF0aW5nIGFuZCBtb3JlLiBDb25maWd1cmFibGUgdG8gZml0IHlvdXIgZmF2b3JpdGUgd29ya2Zsb3cgd2l0aG91dCBnZXR0aW5nIGluIHlvdXIgd2F5LlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2Plxcbjwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICBcIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuY29udGFpbmVyW1wibGF5b3V0XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCIgIDxzZWN0aW9uIGNsYXNzPVxcXCJoZXJvIGlzLXByaW1hcnlcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJoZXJvLWJvZHlcXFwiPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmJsb2NrIHx8IChkZXB0aDAgJiYgZGVwdGgwLmJsb2NrKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwiaGVhZGVyXCIse1wibmFtZVwiOlwiYmxvY2tcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICAgIDwvZGl2PlxcbiAgPC9zZWN0aW9uPlxcblxcbiAgPGRpdiBjbGFzcz1cXFwiY29udGFpbmVyXFxcIiBpZD1cXFwicGFnZVxcXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuYmxvY2sgfHwgKGRlcHRoMCAmJiBkZXB0aDAuYmxvY2spIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJwYWdlXCIse1wibmFtZVwiOlwiYmxvY2tcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICA8L2Rpdj5cXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgICBDb250ZW50XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5ibG9jayB8fCAoZGVwdGgwICYmIGRlcHRoMC5ibG9jaykgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJmdWxscGFnZVwiLHtcIm5hbWVcIjpcImJsb2NrXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcInNpZGViYXJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxhc2lkZSBjbGFzcz1cXFwibWVudVxcXCI+XFxuICA8c2VjdGlvbiBjbGFzcz1cXFwiaGVybyBpcy1pbmZvXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiaGVyby1ib2R5XFxcIj5cXG4gICAgICA8aW1nIHNyYz1cXFwiaW1hZ2VzL2xvZ28ucG5nXFxcIiBzdHlsZT1cXFwid2lkdGg6NzVweDtoZWlnaHQ6YXV0bztcXFwiLz5cXG4gICAgPC9kaXY+XFxuICA8L3NlY3Rpb24+XFxuICBcXG4gIDxwIGNsYXNzPVxcXCJtZW51LWxhYmVsXFxcIj5cXG4gICAgR2VuZXJhbFxcbiAgPC9wPlxcbiAgPHVsIGNsYXNzPVxcXCJtZW51LWxpc3RcXFwiPlxcbiAgICA8bGk+PGE+SG9tZTwvYT48L2xpPlxcbiAgICA8bGk+PGE+QWJvdXQ8L2E+PC9saT5cXG4gICAgPGxpPjxhPkRpc2M8L2E+PC9saT5cXG4gIDwvdWw+XFxuICA8cCBjbGFzcz1cXFwibWVudS1sYWJlbFxcXCI+XFxuICAgIERvY3VtZW50YXRpb25cXG4gIDwvcD5cXG4gIDx1bCBjbGFzcz1cXFwibWVudS1saXN0XFxcIj5cXG4gICAgPGxpPjxhPlByb2plY3QgU3RydWN0dXJlPC9hPjwvbGk+XFxuICAgIDxsaT48YT5HdWxwIFRhc2tzPC9hPjwvbGk+XFxuICAgIDxsaT48YT5IYW5kbGViYXJzPC9hPjwvbGk+XFxuICAgIDxsaT48YT5Xb3JrZmxvdzwvYT48L2xpPlxcbiAgICA8bGk+PGE+QnVsbWEgQ1NTPC9hPjwvbGk+XFxuICAgIDxsaT48YT5FeHRlcm5hbCBEb2N1bWVudGF0aW9uPC9hPjwvbGk+XFxuICA8L3VsPlxcbjwvYXNpZGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl0gPSBjb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdIHx8IHt9O1xuY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXVtcImJ1bG1hXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgIDxoMiBjbGFzcz1cXFwidGl0bGVcXFwiPkJ1bG1hIENTUzwvaDI+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICA8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICAgIDxwIGNsYXNzPVxcXCJib3hcXFwiPkNvbWluZyBTb29uPC9wPlxcbiAgPC9zZWN0aW9uPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl0gPSBjb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdIHx8IHt9O1xuY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXVtcImRvY3VtZW50YXRpb25cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxoMiBjbGFzcz1cXFwidGl0bGVcXFwiPkdlbmVyYXRpbmcgRG9jdW1lbnRhdGlvbjwvaDI+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICA8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICAgIDxwIGNsYXNzPVxcXCJib3hcXFwiPkNvbWluZyBTb29uPC9wPlxcbiAgPC9zZWN0aW9uPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl0gPSBjb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdIHx8IHt9O1xuY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXVtcImV4dGVybmFsXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5FeHRlcm5hbCBJbmZvcm1hdGlvbjwvaDI+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICA8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICA8ZGl2IGNsYXNzPVxcXCJjb2x1bW5zXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiY29sdW1uXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJzdWJ0aXRsZVxcXCI+QmFja2JvbmU8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2JhY2tib25lanMub3JnL1xcXCI+T2ZmaWNpYWwgd2Vic2l0ZTwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJzdWJ0aXRsZVxcXCI+ZG9jLmpzPC9oMj5cXG4gICAgICAgIDx1bD5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHA6Ly9kb2N1bWVudGF0aW9uLmpzLm9yZy9cXFwiPm9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9kb2N1bWVudGF0aW9uanMvZG9jdW1lbnRhdGlvbi9ibG9iL21hc3Rlci9kb2NzL0dFVFRJTkdfU1RBUlRFRC5tZFxcXCI+RG9jdW1lbnRhdGlvbjwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJzdWJ0aXRsZVxcXCI+c2NhbGVBcHA8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL3NjYWxlYXBwLm9yZy9cXFwiPm9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiYm94XFxcIj5cXG4gICAgICAgIDxoMiBjbGFzcz1cXFwic3VidGl0bGVcXFwiPlplc3Q8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly9naXRodWIuY29tL2NoamovemVzdFxcXCI+R2l0aHViPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS96ZXN0XFxcIj5OUE0gUGFja2FnZTwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcImNvbHVtblxcXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cXFwiYm94XFxcIj5cXG4gICAgICAgIDxoMiBjbGFzcz1cXFwic3VidGl0bGVcXFwiPkJyb3dzZXJpZnk8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2Jyb3dzZXJpZnkub3JnL1xcXCI+T2ZmaWNpYWwgU2l0ZTwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly9naXRodWIuY29tL3N1YnN0YWNrL25vZGUtYnJvd3NlcmlmeSN1c2FnZVxcXCI+RG9jdW1lbnRhdGlvbjwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJzdWJ0aXRsZVxcXCI+QXRvbS5qczwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9hdG9tLWpzXFxcIj5OUE0gUGFja2FnZTwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJzdWJ0aXRsZVxcXCI+R3VscDwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vZ3VscGpzLmNvbS9cXFwiPk9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9ndWxwanMvZ3VscC90cmVlL21hc3Rlci9kb2NzXFxcIj5Eb2N1bWVudGF0aW9uIChHaXRodWIpPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vZ3VscGpzLm9yZy9yZWNpcGVzL1xcXCI+UmVjaXBlcyAoR3VscC5qcyk8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9ndWxwanMvZ3VscC90cmVlL21hc3Rlci9kb2NzL3JlY2lwZXNcXFwiPlJlY2lwZXMgKEdpdGh1Yik8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiYm94XFxcIj5cXG4gICAgICAgIDxoMiBjbGFzcz1cXFwic3VidGl0bGVcXFwiPkhhbmRsZWJhcnM8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2hhbmRsZWJhcnNqcy5jb20vXFxcIj5PZmZpY2lhbCB3ZWJzaXRlPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiY29sdW1uXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJzdWJ0aXRsZVxcXCI+TW9jaGE8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly9tb2NoYWpzLm9yZy9cXFwiPk9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vbW9jaGFqbC5yZWFkdGhlZG9jcy5pby9lbi9sYXRlc3QvXFxcIj5Eb2N1bWVudGF0aW9uPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImJveFxcXCI+XFxuICAgICAgICA8aDIgY2xhc3M9XFxcInN1YnRpdGxlXFxcIj5TdXJmYWNlIENTUzwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vbWlsZHJlbmJlbi5naXRodWIuaW8vc3VyZmFjZS9cXFwiPk9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiYm94XFxcIj5cXG4gICAgICAgIDxoMiBjbGFzcz1cXFwic3VidGl0bGVcXFwiPkd1bHAgUGx1Z2luczwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtY29uY2F0XFxcIj5cXG4gICAgICAgICAgZ3VscC1jb25jYXRcXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC1kZWNsYXJlXFxcIj5cXG4gICAgICAgICAgZ3VscC1kZWNsYXJlXFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtZG9jdW1lbnRhdGlvblxcXCI+XFxuICAgICAgICAgIGd1bHAtZG9jdW1lbnRhdGlvblxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLWhhbmRsZWJhcnNcXFwiPlxcbiAgICAgICAgICBndWxwLWhhbmRsZWJhcnNcXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC1odWJcXFwiPlxcbiAgICAgICAgICBndWxwLWh1YlxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLWpzaGludFxcXCI+XFxuICAgICAgICAgIGd1bHAtanNoaW50XFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtb3BlblxcXCI+XFxuICAgICAgICAgIGd1bHAtb3BlblxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLXRhcFxcXCI+XFxuICAgICAgICAgIGd1bHAtdGFwXFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtdWdsaWZ5XFxcIj5cXG4gICAgICAgICAgZ3VscC11Z2xpZnlcXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG4gIDwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJndWxwXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgIDxoMiBjbGFzcz1cXFwidGl0bGVcXFwiPkd1bHA8L2gyPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgPHNlY3Rpb24gY2xhc3M9XFxcInNlY3Rpb25cXFwiPlxcbiAgICA8cCBjbGFzcz1cXFwiYm94XFxcIj5Db21pbmcgU29vbjwvcD5cXG4gIDwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJoYW5kbGViYXJzXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgIDxoMiBjbGFzcz1cXFwidGl0bGVcXFwiPkhhbmRsZWJhcnM8L2gyPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgPHNlY3Rpb24gY2xhc3M9XFxcInNlY3Rpb25cXFwiPlxcbiAgICA8cCBjbGFzcz1cXFwiYm94XFxcIj5Db21pbmcgU29vbjwvcD5cXG4gIDwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJzdHJ1Y3R1cmVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgPGgyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+UHJvamVjdCBTdHJ1Y3R1cmU8L2gyPlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgPHNlY3Rpb24gY2xhc3M9XFxcInNlY3Rpb25cXFwiPlxcbiAgICA8cCBjbGFzcz1cXFwiYm94XFxcIj5Db21pbmcgU29vbjwvcD5cXG4gIDwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJ3b3JrZmxvd1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbiAgcmV0dXJuIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwiaGVhZGVyXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJwYWdlXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5Xb3JrZmxvdzwvaDI+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICA8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICAgIDxwIGNsYXNzPVxcXCJib3hcXFwiPkNvbWluZyBTb29uPC9wPlxcbiAgPC9zZWN0aW9uPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTs7IHJldHVybiBjb250YWluZXI7fSIsInZhciBTaWRlYmFyVmlldyA9IHJlcXVpcmUoXCIuL3NpZGViYXJcIik7XG5cbnZhciBQYWdlVmlldyA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgIHRoaXMuZWwgICAgICAgPSAkKGRhdGEuZWwpWzBdO1xuICAgIHRoaXMudGVtcGxhdGUgPSBkYXRhLnRlbXBsYXRlO1xuICAgIHRoaXMubW9kZWwgICAgPSBkYXRhLm1vZGVsO1xufTsgIFxuXG5QYWdlVmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24ocGFnZSxzdWJwYWdlKSB7XG4gIGxldCB0ZW1wbGF0ZXBhZ2UgPSBzdWJwYWdlID8gdGhpcy50ZW1wbGF0ZVtwYWdlXVtzdWJwYWdlXSA6IHRoaXMudGVtcGxhdGVbcGFnZV07XG4gIHRoaXMuZWwuaW5uZXJIVE1MID0gdGVtcGxhdGVwYWdlKHRoaXMubW9kZWwpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFnZVZpZXc7XG4iLCJcbnZhciBTaWRlYmFyVmlldyA9IGZ1bmN0aW9uKGRhdGEpe1xuXG4gICAgdGhpcy5lbCA9ICQoZGF0YS5lbClbMF07XG4gICAgdGhpcy50ZW1wbGF0ZSA9IGRhdGEudGVtcGxhdGU7XG4gICAgdGhpcy5tb2RlbCA9IGRhdGEubW9kZWw7XG4gICAgdGhpcy5uYXYgPSBkYXRhLm5hdjtcbiAgICB0aGlzLnJlbmRlcigpO1xuXG4gIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrIGFcIix0aGlzLmhpZGUsdGhpcylcbiAgXG4gIHRoaXMucmVuZGVyKCk7XG59O1xuXG5TaWRlYmFyVmlldy5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubmF2LmNoZWNrZWQgPSBmYWxzZTtcbn1cblxuU2lkZWJhclZpZXcucHJvdG90eXBlLnJlbmRlciA9ICBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbCk7XG59XG4gIFxubW9kdWxlLmV4cG9ydHMgPSBTaWRlYmFyVmlldztcbiJdfQ==
