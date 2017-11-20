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
          else
            console.log("Finish")
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
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Surface CSS Reference</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
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
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Generating Documentation</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
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
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">External Information</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"container container--wrap\">\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Backbone</h2>\n        <ul>\n          <li><a href=\"http://backbonejs.org/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>doc.js</h2>\n        <ul>\n          <li><a href=\"http://documentation.js.org/\">official website</a></li>\n          <li><a href=\"https://github.com/documentationjs/documentation/blob/master/docs/GETTING_STARTED.md\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>scaleApp</h2>\n        <ul>\n          <li><a href=\"http://scaleapp.org/\">official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12 g--3 g-m--4 g-t--12\">\n        <h2>Zest</h2>\n        <ul>\n          <li><a href=\"https://github.com/chjj/zest\">Github</a></li>\n          <li><a href=\"https://www.npmjs.com/package/zest\">NPM Package</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Browserify</h2>\n        <ul>\n          <li><a href=\"http://browserify.org/\">Official Site</a></li>\n          <li><a href=\"https://github.com/substack/node-browserify#usage\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Atom.js</h2>\n        <ul>\n          <li><a href=\"https://www.npmjs.com/package/atom-js\">NPM Package</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Gulp</h2>\n        <ul>\n          <li><a href=\"http://gulpjs.com/\">Official website</a></li>\n          <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs\">Documentation (Github)</a></li>\n          <li><a href=\"http://gulpjs.org/recipes/\">Recipes (Gulp.js)</a></li>\n          <li><a href=\"https://github.com/gulpjs/gulp/tree/master/docs/recipes\">Recipes (Github)</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Handlebars</h2>\n        <ul>\n          <li><a href=\"http://handlebarsjs.com/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Mocha</h2>\n        <ul>\n          <li><a href=\"https://mochajs.org/\">Official website</a></li>\n          <li><a href=\"https://mochajl.readthedocs.io/en/latest/\">Documentation</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Surface CSS</h2>\n        <ul>\n          <li><a href=\"http://mildrenben.github.io/surface/\">Official website</a></li>\n        </ul>\n      </div>\n\n      <div class=\"card no-margin-vertical g--3 g-m--4 g-t--12\">\n        <h2>Gulp Plugins</h2>\n        <ul>\n          <a href=\"https://www.npmjs.com/package/gulp-concat\">\n          gulp-concat\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-declare\">\n          gulp-declare\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-documentation\">\n          gulp-documentation\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-handlebars\">\n          gulp-handlebars\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-hub\">\n          gulp-hub\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-jshint\">\n          gulp-jshint\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-open\">\n          gulp-open\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-tap\">\n          gulp-tap\n        </a></li>\n          <li><a href=\"https://www.npmjs.com/package/gulp-uglify\">\n          gulp-uglify\n        </a></li>\n        </ul>\n      </div>\n    </div>\n";
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
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Gulp Tasks</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
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
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Handlebars Reference</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
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
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Project Structure</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
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
    return "    <div class=\"g--10 m--1 no-margin\">\n      <h2 class=\"m--1 fade-in-from-top color--paper\">Workflow</h2>\n    </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "    <h2>Coming Soon</h2>\n";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcvYXBwL2Fib3V0LmpzIiwiY29uZmlnL2FwcC9jb3JlLmpzIiwiY29uZmlnL2FwcC9pbmRleC5qcyIsImxpYi9mbHV4Ym90dGxlL2luZGV4LmpzIiwibGliL3V0aWwvcGVyZm5vdy5qcyIsImxpYi91dGlsL3N3YXBjc3MuanMiLCJub2RlX21vZHVsZXMvYm90dGxlanMvZGlzdC9ib3R0bGUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy1sYXlvdXRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMucnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9kZWNvcmF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvZGVjb3JhdG9ycy9pbmxpbmUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9leGNlcHRpb24uanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9ibG9jay1oZWxwZXItbWlzc2luZy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvZWFjaC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaGVscGVyLW1pc3NpbmcuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2lmLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9sb2cuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2xvb2t1cC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvd2l0aC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2xvZ2dlci5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvbGlnaHRyb3V0ZXIvc3JjL2xpZ2h0cm91dGVyLmpzIiwibm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy96ZXN0L2xpYi96ZXN0LmpzIiwic291cmNlL2ZhY3RvcnkvcGFnZS5qcyIsInNvdXJjZS9mYWN0b3J5L3RlbXBsYXRlLmpzIiwic291cmNlL2luZGV4LmpzIiwic291cmNlL3NlcnZpY2UvY29uZmlnLmpzIiwic291cmNlL3NlcnZpY2Uvcm91dGVyLmpzIiwic291cmNlL3RlbXBsYXRlLmpzIiwic291cmNlL3ZpZXcvcGFnZS5qcyIsInNvdXJjZS92aWV3L3NpZGViYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNscEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9VQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICAgICAgIFwiRmx1eGJ1aWxkXCIsXG4gIGZpbGVuYW1lOiAgIFwiZmx1eGJ1aWxkXCIsXG4gIHZlcnNpb246ICAgIFwiMS4wLjBcIlxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFib3V0OiAgICAgIHJlcXVpcmUoXCIuL2Fib3V0XCIpLFxuICBtb2R1bGU6ICAgICByZXF1aXJlKFwiLi9tb2R1bGVcIiksXG4gIGNvcmU6ICAgICAgIHJlcXVpcmUoXCIuL2NvcmVcIilcbn1cbiIsInZhciBwZXJmbm93ICAgPSByZXF1aXJlKFwidXRpbC9wZXJmbm93XCIpO1xuY29uc29sZS5sb2coXCJGbHV4Ym90dGxlIEAgXCIsbmV3IERhdGUoKS50b1N0cmluZygpLnNsaWNlKDE2LCAyNCksXCJbflwiK3BlcmZub3coKStcIm1zXVwiKTtcblxudmFyIEJvdHRsZSA9IHJlcXVpcmUoXCJib3R0bGVqc1wiKTtcblxuLyoqXG4gIFVzZWQgaW50ZXJuYWxseSB0byBpbnN0YW50aWF0ZSBhbiBhcHBsaWNhdGlvbiB1c2luZyBwcm92aWRlZCBhcmd1bWVudHMgYW5kIHJldHVybnMgaXQuXG4gKlxuICAgQHBhcmFtIHtvYmplY3R9IGFwcGxpY2F0aW9uIFRoZSBvYmplY3Qgb24gd2hpY2ggdG8gY2FsbCB0aGUgZnVuY3Rpb24uXG4gICBAcGFyYW0ge29iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gZmlsZVxuICAgQHBhcmFtIHtvYmplY3R9IGluY2x1ZGUgSGFzaG1hcCBvZiBpbmNsdWRhYmxlcyAoIGxpYnJhcmllcyBlLmcuICkuXG4gICBAcGFyYW0ge29iamVjdH0gbW9kdWxlcyBIYXNobWFwIG9mIG1vZHVsZXMuXG4gICBAcmV0dXJucyB7b2JqZWN0fSBBbiBpbnN0YW50aWF0ZWQgYXBwbGljYXRpb25cbiovXG5mdW5jdGlvbiBpbml0aWFsaXplKGFwcCxjb25maWcsY29udGVudCkge1xuICB2YXIgYm90dGxlID0gQm90dGxlKGNvbmZpZy5hYm91dC5maWxlbmFtZSk7XG4gIHZhciBkZXBlbmRlbmNpZXMgPSBbXTtcblxuICBPYmplY3Qua2V5cyhjb250ZW50KS5tYXAoZnVuY3Rpb24odHlwZSl7XG4gICAgdmFyIHN1YnNldCA9IGNvbnRlbnRbdHlwZV07XG4gICAgT2JqZWN0LmtleXMoc3Vic2V0KS5tYXAoZnVuY3Rpb24obmFtZSl7XG4gICAgICB2YXIgcmVhbG5hbWUgPSBuYW1lO1xuICAgICAgdmFyIG5hbWUgICAgID0gc3Vic2V0W25hbWVdLm5hbWV8fG5hbWU7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiXFx0XCIsXCJCb3R0bGluZ1wiLHR5cGUsbmFtZSxcIlt+XCIgKyBwZXJmbm93KCkgKyBcIm1zXVwiKTtcblxuICAgICAgYm90dGxlW3R5cGVdKG5hbWUsc3Vic2V0W3JlYWxuYW1lXSk7XG4gICAgICBkZXBlbmRlbmNpZXMucHVzaChuYW1lKTtcbiAgICB9KVxuICB9KVxuXG4gIHZhciBhcHBkYXRhID0gW2NvbmZpZy5hYm91dC5maWxlbmFtZSxhcHBdLy8uY29uY2F0KGRlcGVuZGVuY2llcyk7XG5cbiAgYm90dGxlLmZhY3RvcnkuYXBwbHkoYm90dGxlLGFwcGRhdGEpO1xuXG4gIHJldHVybiBib3R0bGU7XG59O1xuXG4vKipcbiAgSW5pdGlhbGl6ZXMgYW4gYXBwbGljYXRpb24gdXNpbmcgc3VwcGxpZWQgYXJndW1lbnRzLlxuICBVc3VhbGx5IGNhbGxlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAgIEBwYXJhbSB7b2JqZWN0fSBhcHBsaWNhdGlvbiBUaGUgb2JqZWN0IG9uIHdoaWNoIHRvIGNhbGwgdGhlIGZ1bmN0aW9uLlxuICAgQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBDb25maWd1cmF0aW9uIGZpbGVcbiAgIEBwYXJhbSB7b2JqZWN0fSBpbmNsdWRlIEhhc2htYXAgb2YgaW5jbHVkYWJsZXMgKCBsaWJyYXJpZXMgZS5nLiApLlxuICAgQHBhcmFtIHtvYmplY3R9IG1vZHVsZXMgSGFzaG1hcCBvZiBtb2R1bGVzLlxuICAgQHJldHVybnMge29iamVjdH0gQW4gaW5zdGFudGlhdGVkIGFwcGxpY2F0aW9uXG4qL1xuZnVuY3Rpb24gc2V0dXAoYXBwbGljYXRpb24sIGNvbmZpZywgY29udGVudCkge1xuICBpZiAodGhpcy5zdGFydGVkKVxuICAgIGNvbnNvbGUud2FybihcIldhcm5pbmc6IEFwcCBzZXR1cCBjYWxsZWQgd2hpbGUgYWxyZWFkeSBzdGFydGVkXCIpXG5cbiAgY29uc29sZS5sb2coXCJJbml0aWFsaXppbmcgQXBwbGljYXRpb25cIixcIlt+XCIgKyBwZXJmbm93KCkgKyBcIm1zXVwiKTtcblxuICB0aGlzLmFwcCA9IHRoaXMuaW5pdGlhbGl6ZShhcHBsaWNhdGlvbiwgY29uZmlnLCBjb250ZW50KTtcbiAgXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5hcHAuY29udGFpbmVyLmZsdXhidWlsZC5zdGFydCgpO1xuICB9KTtcblxuICBjb25zb2xlLmxvZyhcIkZpbmlzaGVkIEFwcGxpY2F0aW9uIEluaXRpYWxpemF0aW9uIFt+XCIgKyBwZXJmbm93KCkgKyBcIm1zXVwiKTtcblxuICByZXR1cm4gdGhpcy5hcHA7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXBwOiAgICAgICAgbnVsbCxcbiAgc3RhcnRlZDogICAgZmFsc2UsXG4gIGluaXRpYWxpemU6IGluaXRpYWxpemUsXG4gIHNldHVwOiAgICAgIHNldHVwXG59O1xuIiwidmFyIG5vdyAgICAgICAgPSByZXF1aXJlKFwicGVyZm9ybWFuY2Utbm93XCIpLFxuICAgIF90aW1lICAgICAgPSBub3coKTtcblxuZnVuY3Rpb24gZWxhcHNlZChwYXNzZWQpe1xuICByZXR1cm4gbm93KCktcGFzc2VkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG92ZXJyaWRlKXtcbiAgX3RpbWUgPSBvdmVycmlkZSA/IF90aW1lID0gbm93KCkgOiBfdGltZTtcbiAgdmFyIG91dCA9IGVsYXBzZWQoX3RpbWUpLnRvU3RyaW5nKCk7XG4gIHJldHVybiBvdXQuc2xpY2UoMCxvdXQuaW5kZXhPZihcIi5cIikrMik7XG59XG4iLCJmdW5jdGlvbiBzd2FwQ1NTKGVsLHBhdGgpXHJcbntcclxuXHRlbCA9IGVsIHx8IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgbGV0IG91dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xyXG4gICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG91dCk7XHJcbiAgICAgICAgICAgICByZXR1cm4gb3V0fSgpO1xyXG4gICAgICAgICAgICAgXHJcbiAgbGV0IG91dCA9IHtcclxuICBcdGVsOmVsLFxyXG4gICAgc3dhcDpmdW5jdGlvbihwYXRoKXtcclxuICAgICAgZWwuc2V0QXR0cmlidXRlKCdyZWwnLCdzdHlsZXNoZWV0Jyk7XHJcbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgnaHJlZicscGF0aCk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBcclxuICBpZiAocGF0aClcclxuICBcdG91dC5zd2FwKHBhdGgpXHJcbiAgICBcclxuICByZXR1cm4gb3V0XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc3dhcENTUzsiLCI7KGZ1bmN0aW9uKHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvKipcbiAgICAgKiBCb3R0bGVKUyB2MS42LjEgLSAyMDE3LTA1LTE3XG4gICAgICogQSBwb3dlcmZ1bCBkZXBlbmRlbmN5IGluamVjdGlvbiBtaWNybyBjb250YWluZXJcbiAgICAgKlxuICAgICAqIENvcHlyaWdodCAoYykgMjAxNyBTdGVwaGVuIFlvdW5nXG4gICAgICogTGljZW5zZWQgTUlUXG4gICAgICovXG4gICAgXG4gICAgLyoqXG4gICAgICogVW5pcXVlIGlkIGNvdW50ZXI7XG4gICAgICpcbiAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgKi9cbiAgICB2YXIgaWQgPSAwO1xuICAgIFxuICAgIC8qKlxuICAgICAqIExvY2FsIHNsaWNlIGFsaWFzXG4gICAgICpcbiAgICAgKiBAdHlwZSBGdW5jdGlvbnNcbiAgICAgKi9cbiAgICB2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG4gICAgXG4gICAgLyoqXG4gICAgICogSXRlcmF0b3IgdXNlZCB0byB3YWxrIGRvd24gYSBuZXN0ZWQgb2JqZWN0LlxuICAgICAqXG4gICAgICogSWYgQm90dGxlLmNvbmZpZy5zdHJpY3QgaXMgdHJ1ZSwgdGhpcyBtZXRob2Qgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgaXQgZW5jb3VudGVycyBhblxuICAgICAqIHVuZGVmaW5lZCBwYXRoXG4gICAgICpcbiAgICAgKiBAcGFyYW0gT2JqZWN0IG9ialxuICAgICAqIEBwYXJhbSBTdHJpbmcgcHJvcFxuICAgICAqIEByZXR1cm4gbWl4ZWRcbiAgICAgKiBAdGhyb3dzIEVycm9yIGlmIEJvdHRsZSBpcyB1bmFibGUgdG8gcmVzb2x2ZSB0aGUgcmVxdWVzdGVkIHNlcnZpY2UuXG4gICAgICovXG4gICAgdmFyIGdldE5lc3RlZCA9IGZ1bmN0aW9uIGdldE5lc3RlZChvYmosIHByb3ApIHtcbiAgICAgICAgdmFyIHNlcnZpY2UgPSBvYmpbcHJvcF07XG4gICAgICAgIGlmIChzZXJ2aWNlID09PSB1bmRlZmluZWQgJiYgZ2xvYmFsQ29uZmlnLnN0cmljdCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb3R0bGUgd2FzIHVuYWJsZSB0byByZXNvbHZlIGEgc2VydmljZS4gIGAnICsgcHJvcCArICdgIGlzIHVuZGVmaW5lZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VydmljZTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEdldCBhIG5lc3RlZCBib3R0bGUuIFdpbGwgc2V0IGFuZCByZXR1cm4gaWYgbm90IHNldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGdldE5lc3RlZEJvdHRsZSA9IGZ1bmN0aW9uIGdldE5lc3RlZEJvdHRsZShuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5lc3RlZFtuYW1lXSB8fCAodGhpcy5uZXN0ZWRbbmFtZV0gPSBCb3R0bGUucG9wKCkpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogR2V0IGEgc2VydmljZSBzdG9yZWQgdW5kZXIgYSBuZXN0ZWQga2V5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIGZ1bGxuYW1lXG4gICAgICogQHJldHVybiBTZXJ2aWNlXG4gICAgICovXG4gICAgdmFyIGdldE5lc3RlZFNlcnZpY2UgPSBmdW5jdGlvbiBnZXROZXN0ZWRTZXJ2aWNlKGZ1bGxuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdWxsbmFtZS5zcGxpdCgnLicpLnJlZHVjZShnZXROZXN0ZWQsIHRoaXMpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBjb25zdGFudFxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIG1peGVkIHZhbHVlXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgY29uc3RhbnQgPSBmdW5jdGlvbiBjb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICAgICAgICB2YXIgcGFydHMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgIG5hbWUgPSBwYXJ0cy5wb3AoKTtcbiAgICAgICAgZGVmaW5lQ29uc3RhbnQuY2FsbChwYXJ0cy5yZWR1Y2Uoc2V0VmFsdWVPYmplY3QsIHRoaXMuY29udGFpbmVyKSwgbmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIHZhciBkZWZpbmVDb25zdGFudCA9IGZ1bmN0aW9uIGRlZmluZUNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBuYW1lLCB7XG4gICAgICAgICAgICBjb25maWd1cmFibGUgOiBmYWxzZSxcbiAgICAgICAgICAgIGVudW1lcmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWUgOiB2YWx1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlIDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBkZWNvcmF0b3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIGZ1bGxuYW1lXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIGZ1bmNcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBkZWNvcmF0b3IgPSBmdW5jdGlvbiBkZWNvcmF0b3IoZnVsbG5hbWUsIGZ1bmMpIHtcbiAgICAgICAgdmFyIHBhcnRzLCBuYW1lO1xuICAgICAgICBpZiAodHlwZW9mIGZ1bGxuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBmdW5jID0gZnVsbG5hbWU7XG4gICAgICAgICAgICBmdWxsbmFtZSA9ICdfX2dsb2JhbF9fJztcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBwYXJ0cyA9IGZ1bGxuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgIG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBnZXROZXN0ZWRCb3R0bGUuY2FsbCh0aGlzLCBuYW1lKS5kZWNvcmF0b3IocGFydHMuam9pbignLicpLCBmdW5jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5kZWNvcmF0b3JzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3JzW25hbWVdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvcnNbbmFtZV0ucHVzaChmdW5jKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIHdoZW4gQm90dGxlI3Jlc29sdmUgaXMgY2FsbGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIGZ1bmNcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBkZWZlciA9IGZ1bmN0aW9uIGRlZmVyKGZ1bmMpIHtcbiAgICAgICAgdGhpcy5kZWZlcnJlZC5wdXNoKGZ1bmMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIEltbWVkaWF0ZWx5IGluc3RhbnRpYXRlcyB0aGUgcHJvdmlkZWQgbGlzdCBvZiBzZXJ2aWNlcyBhbmQgcmV0dXJucyB0aGVtLlxuICAgICAqXG4gICAgICogQHBhcmFtIEFycmF5IHNlcnZpY2VzXG4gICAgICogQHJldHVybiBBcnJheSBBcnJheSBvZiBpbnN0YW5jZXMgKGluIHRoZSBvcmRlciB0aGV5IHdlcmUgcHJvdmlkZWQpXG4gICAgICovXG4gICAgdmFyIGRpZ2VzdCA9IGZ1bmN0aW9uIGRpZ2VzdChzZXJ2aWNlcykge1xuICAgICAgICByZXR1cm4gKHNlcnZpY2VzIHx8IFtdKS5tYXAoZ2V0TmVzdGVkU2VydmljZSwgdGhpcy5jb250YWluZXIpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBmYWN0b3J5IGluc2lkZSBhIGdlbmVyaWMgcHJvdmlkZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gRmFjdG9yeVxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGZhY3RvcnkgPSBmdW5jdGlvbiBmYWN0b3J5KG5hbWUsIEZhY3RvcnkpIHtcbiAgICAgICAgcmV0dXJuIHByb3ZpZGVyLmNhbGwodGhpcywgbmFtZSwgZnVuY3Rpb24gR2VuZXJpY1Byb3ZpZGVyKCkge1xuICAgICAgICAgICAgdGhpcy4kZ2V0ID0gRmFjdG9yeTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhbiBpbnN0YW5jZSBmYWN0b3J5IGluc2lkZSBhIGdlbmVyaWMgZmFjdG9yeS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHNlcnZpY2VcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBGYWN0b3J5IC0gVGhlIGZhY3RvcnkgZnVuY3Rpb24sIG1hdGNoZXMgdGhlIHNpZ25hdHVyZSByZXF1aXJlZCBmb3IgdGhlXG4gICAgICogYGZhY3RvcnlgIG1ldGhvZFxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGluc3RhbmNlRmFjdG9yeSA9IGZ1bmN0aW9uIGluc3RhbmNlRmFjdG9yeShuYW1lLCBGYWN0b3J5KSB7XG4gICAgICAgIHJldHVybiBmYWN0b3J5LmNhbGwodGhpcywgbmFtZSwgZnVuY3Rpb24gR2VuZXJpY0luc3RhbmNlRmFjdG9yeShjb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgOiBGYWN0b3J5LmJpbmQoRmFjdG9yeSwgY29udGFpbmVyKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgcmVtb3ZpbmcgYm90dGxlIGNvbnRhaW5lciBtZXRob2RzIGFuZCBwcm92aWRlcnMgZnJvbSBhIGxpc3Qgb2Yga2V5c1xuICAgICAqL1xuICAgIHZhciBieU1ldGhvZCA9IGZ1bmN0aW9uIGJ5TWV0aG9kKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuICEvXlxcJCg/OmRlY29yYXRvcnxyZWdpc3RlcnxsaXN0KSR8UHJvdmlkZXIkLy50ZXN0KG5hbWUpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogTGlzdCB0aGUgc2VydmljZXMgcmVnaXN0ZXJlZCBvbiB0aGUgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIE9iamVjdCBjb250YWluZXJcbiAgICAgKiBAcmV0dXJuIEFycmF5XG4gICAgICovXG4gICAgdmFyIGxpc3QgPSBmdW5jdGlvbiBsaXN0KGNvbnRhaW5lcikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoY29udGFpbmVyIHx8IHRoaXMuY29udGFpbmVyIHx8IHt9KS5maWx0ZXIoYnlNZXRob2QpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdXNlZCBieSBwcm92aWRlciB0byBzZXQgdXAgbWlkZGxld2FyZSBmb3IgZWFjaCByZXF1ZXN0LlxuICAgICAqXG4gICAgICogQHBhcmFtIE51bWJlciBpZFxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBPYmplY3QgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGNvbnRhaW5lclxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqL1xuICAgIHZhciBhcHBseU1pZGRsZXdhcmUgPSBmdW5jdGlvbiBhcHBseU1pZGRsZXdhcmUobWlkZGxld2FyZSwgbmFtZSwgaW5zdGFuY2UsIGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgZGVzY3JpcHRvciA9IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlIDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBpZiAobWlkZGxld2FyZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0b3IuZ2V0ID0gZnVuY3Rpb24gZ2V0V2l0aE1pZGRsZXdlYXIoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uIG5leHRNaWRkbGV3YXJlKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pZGRsZXdhcmVbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaWRkbGV3YXJlW2luZGV4KytdKGluc3RhbmNlLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXNjcmlwdG9yLnZhbHVlID0gaW5zdGFuY2U7XG4gICAgICAgICAgICBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udGFpbmVyLCBuYW1lLCBkZXNjcmlwdG9yKTtcbiAgICBcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcltuYW1lXTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIG1pZGRsZXdhcmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gZnVuY1xuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIG1pZGRsZXdhcmUgPSBmdW5jdGlvbiBtaWRkbGV3YXJlKGZ1bGxuYW1lLCBmdW5jKSB7XG4gICAgICAgIHZhciBwYXJ0cywgbmFtZTtcbiAgICAgICAgaWYgKHR5cGVvZiBmdWxsbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZnVuYyA9IGZ1bGxuYW1lO1xuICAgICAgICAgICAgZnVsbG5hbWUgPSAnX19nbG9iYWxfXyc7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcGFydHMgPSBmdWxsbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgZ2V0TmVzdGVkQm90dGxlLmNhbGwodGhpcywgbmFtZSkubWlkZGxld2FyZShwYXJ0cy5qb2luKCcuJyksIGZ1bmMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1pZGRsZXdhcmVzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taWRkbGV3YXJlc1tuYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5taWRkbGV3YXJlc1tuYW1lXS5wdXNoKGZ1bmMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogTmFtZWQgYm90dGxlIGluc3RhbmNlc1xuICAgICAqXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgdmFyIGJvdHRsZXMgPSB7fTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBHZXQgYW4gaW5zdGFuY2Ugb2YgYm90dGxlLlxuICAgICAqXG4gICAgICogSWYgYSBuYW1lIGlzIHByb3ZpZGVkIHRoZSBpbnN0YW5jZSB3aWxsIGJlIHN0b3JlZCBpbiBhIGxvY2FsIGhhc2guICBDYWxsaW5nIEJvdHRsZS5wb3AgbXVsdGlwbGVcbiAgICAgKiB0aW1lcyB3aXRoIHRoZSBzYW1lIG5hbWUgd2lsbCByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBwb3AgPSBmdW5jdGlvbiBwb3AobmFtZSkge1xuICAgICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGluc3RhbmNlID0gYm90dGxlc1tuYW1lXTtcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBib3R0bGVzW25hbWVdID0gaW5zdGFuY2UgPSBuZXcgQm90dGxlKCk7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuY29uc3RhbnQoJ0JPVFRMRV9OQU1FJywgbmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBCb3R0bGUoKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBuYW1lZCBib3R0bGVzLlxuICAgICAqL1xuICAgIHZhciBjbGVhciA9IGZ1bmN0aW9uIGNsZWFyKG5hbWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZGVsZXRlIGJvdHRsZXNbbmFtZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib3R0bGVzID0ge307XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gcHJvY2VzcyBkZWNvcmF0b3JzIGluIHRoZSBwcm92aWRlclxuICAgICAqXG4gICAgICogQHBhcmFtIE9iamVjdCBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBmdW5jXG4gICAgICogQHJldHVybiBNaXhlZFxuICAgICAqL1xuICAgIHZhciByZWR1Y2VyID0gZnVuY3Rpb24gcmVkdWNlcihpbnN0YW5jZSwgZnVuYykge1xuICAgICAgICByZXR1cm4gZnVuYyhpbnN0YW5jZSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhIHByb3ZpZGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBmdWxsbmFtZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBQcm92aWRlclxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIHByb3ZpZGVyID0gZnVuY3Rpb24gcHJvdmlkZXIoZnVsbG5hbWUsIFByb3ZpZGVyKSB7XG4gICAgICAgIHZhciBwYXJ0cywgbmFtZTtcbiAgICAgICAgcGFydHMgPSBmdWxsbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICBpZiAodGhpcy5wcm92aWRlck1hcFtmdWxsbmFtZV0gJiYgcGFydHMubGVuZ3RoID09PSAxICYmICF0aGlzLmNvbnRhaW5lcltmdWxsbmFtZSArICdQcm92aWRlciddKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihmdWxsbmFtZSArICcgcHJvdmlkZXIgYWxyZWFkeSBpbnN0YW50aWF0ZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcmlnaW5hbFByb3ZpZGVyc1tmdWxsbmFtZV0gPSBQcm92aWRlcjtcbiAgICAgICAgdGhpcy5wcm92aWRlck1hcFtmdWxsbmFtZV0gPSB0cnVlO1xuICAgIFxuICAgICAgICBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICBcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY3JlYXRlU3ViUHJvdmlkZXIuY2FsbCh0aGlzLCBuYW1lLCBQcm92aWRlciwgcGFydHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZVByb3ZpZGVyLmNhbGwodGhpcywgbmFtZSwgUHJvdmlkZXIpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogR2V0IGRlY29yYXRvcnMgYW5kIG1pZGRsZXdhcmUgaW5jbHVkaW5nIGdsb2JhbHNcbiAgICAgKlxuICAgICAqIEByZXR1cm4gYXJyYXlcbiAgICAgKi9cbiAgICB2YXIgZ2V0V2l0aEdsb2JhbCA9IGZ1bmN0aW9uIGdldFdpdGhHbG9iYWwoY29sbGVjdGlvbiwgbmFtZSkge1xuICAgICAgICByZXR1cm4gKGNvbGxlY3Rpb25bbmFtZV0gfHwgW10pLmNvbmNhdChjb2xsZWN0aW9uLl9fZ2xvYmFsX18gfHwgW10pO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRoZSBwcm92aWRlciBwcm9wZXJ0aWVzIG9uIHRoZSBjb250YWluZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBQcm92aWRlclxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGNyZWF0ZVByb3ZpZGVyID0gZnVuY3Rpb24gY3JlYXRlUHJvdmlkZXIobmFtZSwgUHJvdmlkZXIpIHtcbiAgICAgICAgdmFyIHByb3ZpZGVyTmFtZSwgcHJvcGVydGllcywgY29udGFpbmVyLCBpZCwgZGVjb3JhdG9ycywgbWlkZGxld2FyZXM7XG4gICAgXG4gICAgICAgIGlkID0gdGhpcy5pZDtcbiAgICAgICAgY29udGFpbmVyID0gdGhpcy5jb250YWluZXI7XG4gICAgICAgIGRlY29yYXRvcnMgPSB0aGlzLmRlY29yYXRvcnM7XG4gICAgICAgIG1pZGRsZXdhcmVzID0gdGhpcy5taWRkbGV3YXJlcztcbiAgICAgICAgcHJvdmlkZXJOYW1lID0gbmFtZSArICdQcm92aWRlcic7XG4gICAgXG4gICAgICAgIHByb3BlcnRpZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBwcm9wZXJ0aWVzW3Byb3ZpZGVyTmFtZV0gPSB7XG4gICAgICAgICAgICBjb25maWd1cmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICBnZXQgOiBmdW5jdGlvbiBnZXRQcm92aWRlcigpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgUHJvdmlkZXIoKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgY29udGFpbmVyW3Byb3ZpZGVyTmFtZV07XG4gICAgICAgICAgICAgICAgY29udGFpbmVyW3Byb3ZpZGVyTmFtZV0gPSBpbnN0YW5jZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIHByb3BlcnRpZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICBjb25maWd1cmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICBnZXQgOiBmdW5jdGlvbiBnZXRTZXJ2aWNlKCkge1xuICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IGNvbnRhaW5lcltwcm92aWRlck5hbWVdO1xuICAgICAgICAgICAgICAgIHZhciBpbnN0YW5jZTtcbiAgICAgICAgICAgICAgICBpZiAocHJvdmlkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmlsdGVyIHRocm91Z2ggZGVjb3JhdG9yc1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGdldFdpdGhHbG9iYWwoZGVjb3JhdG9ycywgbmFtZSkucmVkdWNlKHJlZHVjZXIsIHByb3ZpZGVyLiRnZXQoY29udGFpbmVyKSk7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb250YWluZXJbcHJvdmlkZXJOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbnRhaW5lcltuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlID09PSB1bmRlZmluZWQgPyBpbnN0YW5jZSA6IGFwcGx5TWlkZGxld2FyZShnZXRXaXRoR2xvYmFsKG1pZGRsZXdhcmVzLCBuYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSwgaW5zdGFuY2UsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGNvbnRhaW5lciwgcHJvcGVydGllcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGJvdHRsZSBjb250YWluZXIgb24gdGhlIGN1cnJlbnQgYm90dGxlIGNvbnRhaW5lciwgYW5kIHJlZ2lzdGVyc1xuICAgICAqIHRoZSBwcm92aWRlciB1bmRlciB0aGUgc3ViIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBQcm92aWRlclxuICAgICAqIEBwYXJhbSBBcnJheSBwYXJ0c1xuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGNyZWF0ZVN1YlByb3ZpZGVyID0gZnVuY3Rpb24gY3JlYXRlU3ViUHJvdmlkZXIobmFtZSwgUHJvdmlkZXIsIHBhcnRzKSB7XG4gICAgICAgIHZhciBib3R0bGU7XG4gICAgICAgIGJvdHRsZSA9IGdldE5lc3RlZEJvdHRsZS5jYWxsKHRoaXMsIG5hbWUpO1xuICAgICAgICB0aGlzLmZhY3RvcnkobmFtZSwgZnVuY3Rpb24gU3ViUHJvdmlkZXJGYWN0b3J5KCkge1xuICAgICAgICAgICAgcmV0dXJuIGJvdHRsZS5jb250YWluZXI7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYm90dGxlLnByb3ZpZGVyKHBhcnRzLmpvaW4oJy4nKSwgUHJvdmlkZXIpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBzZXJ2aWNlLCBmYWN0b3J5LCBwcm92aWRlciwgb3IgdmFsdWUgYmFzZWQgb24gcHJvcGVydGllcyBvbiB0aGUgb2JqZWN0LlxuICAgICAqXG4gICAgICogcHJvcGVydGllczpcbiAgICAgKiAgKiBPYmouJG5hbWUgICBTdHJpbmcgcmVxdWlyZWQgZXg6IGAnVGhpbmcnYFxuICAgICAqICAqIE9iai4kdHlwZSAgIFN0cmluZyBvcHRpb25hbCAnc2VydmljZScsICdmYWN0b3J5JywgJ3Byb3ZpZGVyJywgJ3ZhbHVlJy4gIERlZmF1bHQ6ICdzZXJ2aWNlJ1xuICAgICAqICAqIE9iai4kaW5qZWN0IE1peGVkICBvcHRpb25hbCBvbmx5IHVzZWZ1bCB3aXRoICR0eXBlICdzZXJ2aWNlJyBuYW1lIG9yIGFycmF5IG9mIG5hbWVzXG4gICAgICogICogT2JqLiR2YWx1ZSAgTWl4ZWQgIG9wdGlvbmFsIE5vcm1hbGx5IE9iaiBpcyByZWdpc3RlcmVkIG9uIHRoZSBjb250YWluZXIuICBIb3dldmVyLCBpZiB0aGlzXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5IGlzIGluY2x1ZGVkLCBpdCdzIHZhbHVlIHdpbGwgYmUgcmVnaXN0ZXJlZCBvbiB0aGUgY29udGFpbmVyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgIGluc3RlYWQgb2YgdGhlIG9iamVjdCBpdHNzZWxmLiAgVXNlZnVsIGZvciByZWdpc3RlcmluZyBvYmplY3RzIG9uIHRoZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICBib3R0bGUgY29udGFpbmVyIHdpdGhvdXQgbW9kaWZ5aW5nIHRob3NlIG9iamVjdHMgd2l0aCBib3R0bGUgc3BlY2lmaWMga2V5cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBPYmpcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciByZWdpc3RlciA9IGZ1bmN0aW9uIHJlZ2lzdGVyKE9iaikge1xuICAgICAgICB2YXIgdmFsdWUgPSBPYmouJHZhbHVlID09PSB1bmRlZmluZWQgPyBPYmogOiBPYmouJHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpc1tPYmouJHR5cGUgfHwgJ3NlcnZpY2UnXS5hcHBseSh0aGlzLCBbT2JqLiRuYW1lLCB2YWx1ZV0uY29uY2F0KE9iai4kaW5qZWN0IHx8IFtdKSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHByb3ZpZGVycyBmcm9tIHRoZSBtYXAgYW5kIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqL1xuICAgIHZhciByZW1vdmVQcm92aWRlck1hcCA9IGZ1bmN0aW9uIHJlc2V0UHJvdmlkZXIobmFtZSkge1xuICAgICAgICBkZWxldGUgdGhpcy5wcm92aWRlck1hcFtuYW1lXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuY29udGFpbmVyW25hbWVdO1xuICAgICAgICBkZWxldGUgdGhpcy5jb250YWluZXJbbmFtZSArICdQcm92aWRlciddO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVzZXRzIGFsbCBwcm92aWRlcnMgb24gYSBib3R0bGUgaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICB2YXIgcmVzZXRQcm92aWRlcnMgPSBmdW5jdGlvbiByZXNldFByb3ZpZGVycygpIHtcbiAgICAgICAgdmFyIHByb3ZpZGVycyA9IHRoaXMub3JpZ2luYWxQcm92aWRlcnM7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMub3JpZ2luYWxQcm92aWRlcnMpLmZvckVhY2goZnVuY3Rpb24gcmVzZXRQcnZpZGVyKHByb3ZpZGVyKSB7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSBwcm92aWRlci5zcGxpdCgnLicpO1xuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVQcm92aWRlck1hcC5jYWxsKHRoaXMsIHBhcnRzWzBdKTtcbiAgICAgICAgICAgICAgICBwYXJ0cy5mb3JFYWNoKHJlbW92ZVByb3ZpZGVyTWFwLCBnZXROZXN0ZWRCb3R0bGUuY2FsbCh0aGlzLCBwYXJ0c1swXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVtb3ZlUHJvdmlkZXJNYXAuY2FsbCh0aGlzLCBwcm92aWRlcik7XG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVyKHByb3ZpZGVyLCBwcm92aWRlcnNbcHJvdmlkZXJdKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGFueSBkZWZlcnJlZCBmdW5jdGlvbnNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBNaXhlZCBkYXRhXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgcmVzb2x2ZSA9IGZ1bmN0aW9uIHJlc29sdmUoZGF0YSkge1xuICAgICAgICB0aGlzLmRlZmVycmVkLmZvckVhY2goZnVuY3Rpb24gZGVmZXJyZWRJdGVyYXRvcihmdW5jKSB7XG4gICAgICAgICAgICBmdW5jKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhIHNlcnZpY2UgaW5zaWRlIGEgZ2VuZXJpYyBmYWN0b3J5LlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIFNlcnZpY2VcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBzZXJ2aWNlID0gZnVuY3Rpb24gc2VydmljZShuYW1lLCBTZXJ2aWNlKSB7XG4gICAgICAgIHZhciBkZXBzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMikgOiBudWxsO1xuICAgICAgICB2YXIgYm90dGxlID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGZhY3RvcnkuY2FsbCh0aGlzLCBuYW1lLCBmdW5jdGlvbiBHZW5lcmljRmFjdG9yeSgpIHtcbiAgICAgICAgICAgIHZhciBTZXJ2aWNlQ29weSA9IFNlcnZpY2U7XG4gICAgICAgICAgICBpZiAoZGVwcykge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gZGVwcy5tYXAoZ2V0TmVzdGVkU2VydmljZSwgYm90dGxlLmNvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgYXJncy51bnNoaWZ0KFNlcnZpY2UpO1xuICAgICAgICAgICAgICAgIFNlcnZpY2VDb3B5ID0gU2VydmljZS5iaW5kLmFwcGx5KFNlcnZpY2UsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXJ2aWNlQ29weSgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgdmFsdWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBtaXhlZCB2YWxcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciB2YWx1ZSA9IGZ1bmN0aW9uIHZhbHVlKG5hbWUsIHZhbCkge1xuICAgICAgICB2YXIgcGFydHM7XG4gICAgICAgIHBhcnRzID0gbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICBuYW1lID0gcGFydHMucG9wKCk7XG4gICAgICAgIGRlZmluZVZhbHVlLmNhbGwocGFydHMucmVkdWNlKHNldFZhbHVlT2JqZWN0LCB0aGlzLmNvbnRhaW5lciksIG5hbWUsIHZhbCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogSXRlcmF0b3IgZm9yIHNldHRpbmcgYSBwbGFpbiBvYmplY3QgbGl0ZXJhbCB2aWEgZGVmaW5lVmFsdWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBPYmplY3QgY29udGFpbmVyXG4gICAgICogQHBhcmFtIHN0cmluZyBuYW1lXG4gICAgICovXG4gICAgdmFyIHNldFZhbHVlT2JqZWN0ID0gZnVuY3Rpb24gc2V0VmFsdWVPYmplY3QoY29udGFpbmVyLCBuYW1lKSB7XG4gICAgICAgIHZhciBuZXN0ZWRDb250YWluZXIgPSBjb250YWluZXJbbmFtZV07XG4gICAgICAgIGlmICghbmVzdGVkQ29udGFpbmVyKSB7XG4gICAgICAgICAgICBuZXN0ZWRDb250YWluZXIgPSB7fTtcbiAgICAgICAgICAgIGRlZmluZVZhbHVlLmNhbGwoY29udGFpbmVyLCBuYW1lLCBuZXN0ZWRDb250YWluZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXN0ZWRDb250YWluZXI7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBEZWZpbmUgYSBtdXRhYmxlIHByb3BlcnR5IG9uIHRoZSBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gbWl4ZWQgdmFsXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICogQHNjb3BlIGNvbnRhaW5lclxuICAgICAqL1xuICAgIHZhciBkZWZpbmVWYWx1ZSA9IGZ1bmN0aW9uIGRlZmluZVZhbHVlKG5hbWUsIHZhbCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWUgOiB2YWwsXG4gICAgICAgICAgICB3cml0YWJsZSA6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBCb3R0bGUgY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZSBPcHRpb25hbCBuYW1lIGZvciBmdW5jdGlvbmFsIGNvbnN0cnVjdGlvblxuICAgICAqL1xuICAgIHZhciBCb3R0bGUgPSBmdW5jdGlvbiBCb3R0bGUobmFtZSkge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQm90dGxlKSkge1xuICAgICAgICAgICAgcmV0dXJuIEJvdHRsZS5wb3AobmFtZSk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgdGhpcy5pZCA9IGlkKys7XG4gICAgXG4gICAgICAgIHRoaXMuZGVjb3JhdG9ycyA9IHt9O1xuICAgICAgICB0aGlzLm1pZGRsZXdhcmVzID0ge307XG4gICAgICAgIHRoaXMubmVzdGVkID0ge307XG4gICAgICAgIHRoaXMucHJvdmlkZXJNYXAgPSB7fTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFByb3ZpZGVycyA9IHt9O1xuICAgICAgICB0aGlzLmRlZmVycmVkID0gW107XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0ge1xuICAgICAgICAgICAgJGRlY29yYXRvciA6IGRlY29yYXRvci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgJHJlZ2lzdGVyIDogcmVnaXN0ZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICRsaXN0IDogbGlzdC5iaW5kKHRoaXMpXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBCb3R0bGUgcHJvdG90eXBlXG4gICAgICovXG4gICAgQm90dGxlLnByb3RvdHlwZSA9IHtcbiAgICAgICAgY29uc3RhbnQgOiBjb25zdGFudCxcbiAgICAgICAgZGVjb3JhdG9yIDogZGVjb3JhdG9yLFxuICAgICAgICBkZWZlciA6IGRlZmVyLFxuICAgICAgICBkaWdlc3QgOiBkaWdlc3QsXG4gICAgICAgIGZhY3RvcnkgOiBmYWN0b3J5LFxuICAgICAgICBpbnN0YW5jZUZhY3Rvcnk6IGluc3RhbmNlRmFjdG9yeSxcbiAgICAgICAgbGlzdCA6IGxpc3QsXG4gICAgICAgIG1pZGRsZXdhcmUgOiBtaWRkbGV3YXJlLFxuICAgICAgICBwcm92aWRlciA6IHByb3ZpZGVyLFxuICAgICAgICByZXNldFByb3ZpZGVycyA6IHJlc2V0UHJvdmlkZXJzLFxuICAgICAgICByZWdpc3RlciA6IHJlZ2lzdGVyLFxuICAgICAgICByZXNvbHZlIDogcmVzb2x2ZSxcbiAgICAgICAgc2VydmljZSA6IHNlcnZpY2UsXG4gICAgICAgIHZhbHVlIDogdmFsdWVcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJvdHRsZSBzdGF0aWNcbiAgICAgKi9cbiAgICBCb3R0bGUucG9wID0gcG9wO1xuICAgIEJvdHRsZS5jbGVhciA9IGNsZWFyO1xuICAgIEJvdHRsZS5saXN0ID0gbGlzdDtcbiAgICBcbiAgICAvKipcbiAgICAgKiBHbG9iYWwgY29uZmlnXG4gICAgICovXG4gICAgdmFyIGdsb2JhbENvbmZpZyA9IEJvdHRsZS5jb25maWcgPSB7XG4gICAgICAgIHN0cmljdCA6IGZhbHNlXG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBFeHBvcnRzIHNjcmlwdCBhZGFwdGVkIGZyb20gbG9kYXNoIHYyLjQuMSBNb2Rlcm4gQnVpbGRcbiAgICAgKlxuICAgICAqIEBzZWUgaHR0cDovL2xvZGFzaC5jb20vXG4gICAgICovXG4gICAgXG4gICAgLyoqXG4gICAgICogVmFsaWQgb2JqZWN0IHR5cGUgbWFwXG4gICAgICpcbiAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgKi9cbiAgICB2YXIgb2JqZWN0VHlwZXMgPSB7XG4gICAgICAgICdmdW5jdGlvbicgOiB0cnVlLFxuICAgICAgICAnb2JqZWN0JyA6IHRydWVcbiAgICB9O1xuICAgIFxuICAgIChmdW5jdGlvbiBleHBvcnRCb3R0bGUocm9vdCkge1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRnJlZSB2YXJpYWJsZSBleHBvcnRzXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZnJlZUV4cG9ydHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogRnJlZSB2YXJpYWJsZSBtb2R1bGVcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZnJlZU1vZHVsZSA9IG9iamVjdFR5cGVzW3R5cGVvZiBtb2R1bGVdICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbW1vbkpTIG1vZHVsZS5leHBvcnRzXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cyAmJiBmcmVlRXhwb3J0cztcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZyZWUgdmFyaWFibGUgYGdsb2JhbGBcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgZnJlZUdsb2JhbCA9IG9iamVjdFR5cGVzW3R5cGVvZiBnbG9iYWxdICYmIGdsb2JhbDtcbiAgICAgICAgaWYgKGZyZWVHbG9iYWwgJiYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSkge1xuICAgICAgICAgICAgcm9vdCA9IGZyZWVHbG9iYWw7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4cG9ydFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgICAgIHJvb3QuQm90dGxlID0gQm90dGxlO1xuICAgICAgICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gQm90dGxlOyB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG4gICAgICAgICAgICBpZiAobW9kdWxlRXhwb3J0cykge1xuICAgICAgICAgICAgICAgIChmcmVlTW9kdWxlLmV4cG9ydHMgPSBCb3R0bGUpLkJvdHRsZSA9IEJvdHRsZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZnJlZUV4cG9ydHMuQm90dGxlID0gQm90dGxlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm9vdC5Cb3R0bGUgPSBCb3R0bGU7XG4gICAgICAgIH1cbiAgICB9KChvYmplY3RUeXBlc1t0eXBlb2Ygd2luZG93XSAmJiB3aW5kb3cpIHx8IHRoaXMpKTtcbiAgICBcbn0uY2FsbCh0aGlzKSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gbm9vcCgpIHtcblx0cmV0dXJuICcnO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFjayhjb250ZXh0KSB7XG5cdHJldHVybiBjb250ZXh0LiQkbGF5b3V0U3RhY2sgfHwgKFxuXHRcdGNvbnRleHQuJCRsYXlvdXRTdGFjayA9IFtdXG5cdCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3RhY2soY29udGV4dCkge1xuXHR2YXIgc3RhY2sgPSBnZXRTdGFjayhjb250ZXh0KTtcblxuXHR3aGlsZSAoc3RhY2subGVuZ3RoKSB7XG5cdFx0c3RhY2suc2hpZnQoKShjb250ZXh0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRBY3Rpb25zKGNvbnRleHQpIHtcblx0cmV0dXJuIGNvbnRleHQuJCRsYXlvdXRBY3Rpb25zIHx8IChcblx0XHRjb250ZXh0LiQkbGF5b3V0QWN0aW9ucyA9IHt9XG5cdCk7XG59XG5cbmZ1bmN0aW9uIGdldEFjdGlvbnNCeU5hbWUoY29udGV4dCwgbmFtZSkge1xuXHR2YXIgYWN0aW9ucyA9IGdldEFjdGlvbnMoY29udGV4dCk7XG5cblx0cmV0dXJuIGFjdGlvbnNbbmFtZV0gfHwgKFxuXHRcdGFjdGlvbnNbbmFtZV0gPSBbXVxuXHQpO1xufVxuXG5mdW5jdGlvbiBhcHBseUFjdGlvbih2YWwsIGFjdGlvbikge1xuXHR2YXIgY29udGV4dCA9IHRoaXM7XG5cblx0ZnVuY3Rpb24gZm4oKSB7XG5cdFx0cmV0dXJuIGFjdGlvbi5mbihjb250ZXh0LCBhY3Rpb24ub3B0aW9ucyk7XG5cdH1cblxuXHRzd2l0Y2ggKGFjdGlvbi5tb2RlKSB7XG5cdFx0Y2FzZSAnYXBwZW5kJzoge1xuXHRcdFx0cmV0dXJuIHZhbCArIGZuKCk7XG5cdFx0fVxuXG5cdFx0Y2FzZSAncHJlcGVuZCc6IHtcblx0XHRcdHJldHVybiBmbigpICsgdmFsO1xuXHRcdH1cblxuXHRcdGNhc2UgJ3JlcGxhY2UnOiB7XG5cdFx0XHRyZXR1cm4gZm4oKTtcblx0XHR9XG5cblx0XHRkZWZhdWx0OiB7XG5cdFx0XHRyZXR1cm4gdmFsO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBtaXhpbih0YXJnZXQpIHtcblx0dmFyIGFyZywga2V5LFxuXHRcdGxlbiA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdFx0aSA9IDE7XG5cblx0Zm9yICg7IGkgPCBsZW47IGkrKykge1xuXHRcdGFyZyA9IGFyZ3VtZW50c1tpXTtcblxuXHRcdGlmICghYXJnKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRmb3IgKGtleSBpbiBhcmcpIHtcblx0XHRcdC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXG5cdFx0XHRpZiAoaGFzT3duLmNhbGwoYXJnLCBrZXkpKSB7XG5cdFx0XHRcdHRhcmdldFtrZXldID0gYXJnW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYW4gb2JqZWN0IG9mIGxheW91dCBoZWxwZXJzLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGViYXJzIEhhbmRsZWJhcnMgaW5zdGFuY2UuXG4gKiBAcmV0dXJuIHtPYmplY3R9IE9iamVjdCBvZiBoZWxwZXJzLlxuICovXG5mdW5jdGlvbiBsYXlvdXRzKGhhbmRsZWJhcnMpIHtcblx0dmFyIGhlbHBlcnMgPSB7XG5cdFx0LyoqXG5cdFx0ICogQG1ldGhvZCBleHRlbmRcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuXHRcdCAqIEBwYXJhbSB7P09iamVjdH0gY3VzdG9tQ29udGV4dFxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbihPYmplY3QpfSBvcHRpb25zLmZuXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuaGFzaFxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gUmVuZGVyZWQgcGFydGlhbC5cblx0XHQgKi9cblx0XHRleHRlbmQ6IGZ1bmN0aW9uIChuYW1lLCBjdXN0b21Db250ZXh0LCBvcHRpb25zKSB7XG5cdFx0XHQvLyBNYWtlIGBjdXN0b21Db250ZXh0YCBvcHRpb25hbFxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSBjdXN0b21Db250ZXh0O1xuXHRcdFx0XHRjdXN0b21Db250ZXh0ID0gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRcdHZhciBmbiA9IG9wdGlvbnMuZm4gfHwgbm9vcCxcblx0XHRcdFx0Y29udGV4dCA9IG1peGluKHt9LCB0aGlzLCBjdXN0b21Db250ZXh0LCBvcHRpb25zLmhhc2gpLFxuXHRcdFx0XHRkYXRhID0gaGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpLFxuXHRcdFx0XHR0ZW1wbGF0ZSA9IGhhbmRsZWJhcnMucGFydGlhbHNbbmFtZV07XG5cblx0XHRcdC8vIFBhcnRpYWwgdGVtcGxhdGUgcmVxdWlyZWRcblx0XHRcdGlmICh0ZW1wbGF0ZSA9PSBudWxsKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignTWlzc2luZyBwYXJ0aWFsOiBcXCcnICsgbmFtZSArICdcXCcnKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ29tcGlsZSBwYXJ0aWFsLCBpZiBuZWVkZWRcblx0XHRcdGlmICh0eXBlb2YgdGVtcGxhdGUgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0dGVtcGxhdGUgPSBoYW5kbGViYXJzLmNvbXBpbGUodGVtcGxhdGUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBZGQgb3ZlcnJpZGVzIHRvIHN0YWNrXG5cdFx0XHRnZXRTdGFjayhjb250ZXh0KS5wdXNoKGZuKTtcblxuXHRcdFx0Ly8gUmVuZGVyIHBhcnRpYWxcblx0XHRcdHJldHVybiB0ZW1wbGF0ZShjb250ZXh0LCB7IGRhdGE6IGRhdGEgfSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgZW1iZWRcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuXHRcdCAqIEBwYXJhbSB7P09iamVjdH0gY3VzdG9tQ29udGV4dFxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbihPYmplY3QpfSBvcHRpb25zLmZuXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuaGFzaFxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gUmVuZGVyZWQgcGFydGlhbC5cblx0XHQgKi9cblx0XHRlbWJlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGNvbnRleHQgPSBtaXhpbih7fSwgdGhpcyB8fCB7fSk7XG5cblx0XHRcdC8vIFJlc2V0IGNvbnRleHRcblx0XHRcdGNvbnRleHQuJCRsYXlvdXRTdGFjayA9IG51bGw7XG5cdFx0XHRjb250ZXh0LiQkbGF5b3V0QWN0aW9ucyA9IG51bGw7XG5cblx0XHRcdC8vIEV4dGVuZFxuXHRcdFx0cmV0dXJuIGhlbHBlcnMuZXh0ZW5kLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgYmxvY2tcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbihPYmplY3QpfSBvcHRpb25zLmZuXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBNb2RpZmllZCBibG9jayBjb250ZW50LlxuXHRcdCAqL1xuXHRcdGJsb2NrOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRcdHZhciBmbiA9IG9wdGlvbnMuZm4gfHwgbm9vcCxcblx0XHRcdFx0ZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKSxcblx0XHRcdFx0Y29udGV4dCA9IHRoaXMgfHwge307XG5cblx0XHRcdGFwcGx5U3RhY2soY29udGV4dCk7XG5cblx0XHRcdHJldHVybiBnZXRBY3Rpb25zQnlOYW1lKGNvbnRleHQsIG5hbWUpLnJlZHVjZShcblx0XHRcdFx0YXBwbHlBY3Rpb24uYmluZChjb250ZXh0KSxcblx0XHRcdFx0Zm4oY29udGV4dCwgeyBkYXRhOiBkYXRhIH0pXG5cdFx0XHQpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBAbWV0aG9kIGNvbnRlbnRcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbihPYmplY3QpfSBvcHRpb25zLmZuXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuaGFzaFxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLmhhc2gubW9kZVxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gQWx3YXlzIGVtcHR5LlxuXHRcdCAqL1xuXHRcdGNvbnRlbnQ6IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdFx0dmFyIGZuID0gb3B0aW9ucy5mbixcblx0XHRcdFx0ZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKSxcblx0XHRcdFx0aGFzaCA9IG9wdGlvbnMuaGFzaCB8fCB7fSxcblx0XHRcdFx0bW9kZSA9IGhhc2gubW9kZSB8fCAncmVwbGFjZScsXG5cdFx0XHRcdGNvbnRleHQgPSB0aGlzIHx8IHt9O1xuXG5cdFx0XHRhcHBseVN0YWNrKGNvbnRleHQpO1xuXG5cdFx0XHQvLyBHZXR0ZXJcblx0XHRcdGlmICghZm4pIHtcblx0XHRcdFx0cmV0dXJuIG5hbWUgaW4gZ2V0QWN0aW9ucyhjb250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gU2V0dGVyXG5cdFx0XHRnZXRBY3Rpb25zQnlOYW1lKGNvbnRleHQsIG5hbWUpLnB1c2goe1xuXHRcdFx0XHRvcHRpb25zOiB7IGRhdGE6IGRhdGEgfSxcblx0XHRcdFx0bW9kZTogbW9kZS50b0xvd2VyQ2FzZSgpLFxuXHRcdFx0XHRmbjogZm5cblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gaGVscGVycztcbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMgbGF5b3V0IGhlbHBlcnMgb24gYSBIYW5kbGViYXJzIGluc3RhbmNlLlxuICpcbiAqIEBtZXRob2QgcmVnaXN0ZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kbGViYXJzIEhhbmRsZWJhcnMgaW5zdGFuY2UuXG4gKiBAcmV0dXJuIHtPYmplY3R9IE9iamVjdCBvZiBoZWxwZXJzLlxuICogQHN0YXRpY1xuICovXG5sYXlvdXRzLnJlZ2lzdGVyID0gZnVuY3Rpb24gKGhhbmRsZWJhcnMpIHtcblx0dmFyIGhlbHBlcnMgPSBsYXlvdXRzKGhhbmRsZWJhcnMpO1xuXG5cdGhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoaGVscGVycyk7XG5cblx0cmV0dXJuIGhlbHBlcnM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxheW91dHM7XG4iLCJpbXBvcnQgKiBhcyBiYXNlIGZyb20gJy4vaGFuZGxlYmFycy9iYXNlJztcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbmltcG9ydCBTYWZlU3RyaW5nIGZyb20gJy4vaGFuZGxlYmFycy9zYWZlLXN0cmluZyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vaGFuZGxlYmFycy9leGNlcHRpb24nO1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi9oYW5kbGViYXJzL3V0aWxzJztcbmltcG9ydCAqIGFzIHJ1bnRpbWUgZnJvbSAnLi9oYW5kbGViYXJzL3J1bnRpbWUnO1xuXG5pbXBvcnQgbm9Db25mbGljdCBmcm9tICcuL2hhbmRsZWJhcnMvbm8tY29uZmxpY3QnO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcbiAgaGIuZXNjYXBlRXhwcmVzc2lvbiA9IFV0aWxzLmVzY2FwZUV4cHJlc3Npb247XG5cbiAgaGIuVk0gPSBydW50aW1lO1xuICBoYi50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgICByZXR1cm4gcnVudGltZS50ZW1wbGF0ZShzcGVjLCBoYik7XG4gIH07XG5cbiAgcmV0dXJuIGhiO1xufVxuXG5sZXQgaW5zdCA9IGNyZWF0ZSgpO1xuaW5zdC5jcmVhdGUgPSBjcmVhdGU7XG5cbm5vQ29uZmxpY3QoaW5zdCk7XG5cbmluc3RbJ2RlZmF1bHQnXSA9IGluc3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGluc3Q7XG4iLCJpbXBvcnQge2NyZWF0ZUZyYW1lLCBleHRlbmQsIHRvU3RyaW5nfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi9leGNlcHRpb24nO1xuaW1wb3J0IHtyZWdpc3RlckRlZmF1bHRIZWxwZXJzfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHtyZWdpc3RlckRlZmF1bHREZWNvcmF0b3JzfSBmcm9tICcuL2RlY29yYXRvcnMnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gJzQuMC4xMSc7XG5leHBvcnQgY29uc3QgQ09NUElMRVJfUkVWSVNJT04gPSA3O1xuXG5leHBvcnQgY29uc3QgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc9PSAxLngueCcsXG4gIDU6ICc9PSAyLjAuMC1hbHBoYS54JyxcbiAgNjogJz49IDIuMC4wLWJldGEuMScsXG4gIDc6ICc+PSA0LjAuMCdcbn07XG5cbmNvbnN0IG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZXhwb3J0IGZ1bmN0aW9uIEhhbmRsZWJhcnNFbnZpcm9ubWVudChoZWxwZXJzLCBwYXJ0aWFscywgZGVjb3JhdG9ycykge1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzIHx8IHt9O1xuICB0aGlzLnBhcnRpYWxzID0gcGFydGlhbHMgfHwge307XG4gIHRoaXMuZGVjb3JhdG9ycyA9IGRlY29yYXRvcnMgfHwge307XG5cbiAgcmVnaXN0ZXJEZWZhdWx0SGVscGVycyh0aGlzKTtcbiAgcmVnaXN0ZXJEZWZhdWx0RGVjb3JhdG9ycyh0aGlzKTtcbn1cblxuSGFuZGxlYmFyc0Vudmlyb25tZW50LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IEhhbmRsZWJhcnNFbnZpcm9ubWVudCxcblxuICBsb2dnZXI6IGxvZ2dlcixcbiAgbG9nOiBsb2dnZXIubG9nLFxuXG4gIHJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbihuYW1lLCBmbikge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBpZiAoZm4pIHsgdGhyb3cgbmV3IEV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICAgIGV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJIZWxwZXI6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5oZWxwZXJzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24obmFtZSwgcGFydGlhbCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBleHRlbmQodGhpcy5wYXJ0aWFscywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgcGFydGlhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihgQXR0ZW1wdGluZyB0byByZWdpc3RlciBhIHBhcnRpYWwgY2FsbGVkIFwiJHtuYW1lfVwiIGFzIHVuZGVmaW5lZGApO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHBhcnRpYWw7XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVyUGFydGlhbDogZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLnBhcnRpYWxzW25hbWVdO1xuICB9LFxuXG4gIHJlZ2lzdGVyRGVjb3JhdG9yOiBmdW5jdGlvbihuYW1lLCBmbikge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBpZiAoZm4pIHsgdGhyb3cgbmV3IEV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBkZWNvcmF0b3JzJyk7IH1cbiAgICAgIGV4dGVuZCh0aGlzLmRlY29yYXRvcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlY29yYXRvcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG4gIHVucmVnaXN0ZXJEZWNvcmF0b3I6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5kZWNvcmF0b3JzW25hbWVdO1xuICB9XG59O1xuXG5leHBvcnQgbGV0IGxvZyA9IGxvZ2dlci5sb2c7XG5cbmV4cG9ydCB7Y3JlYXRlRnJhbWUsIGxvZ2dlcn07XG4iLCJpbXBvcnQgcmVnaXN0ZXJJbmxpbmUgZnJvbSAnLi9kZWNvcmF0b3JzL2lubGluZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRlZmF1bHREZWNvcmF0b3JzKGluc3RhbmNlKSB7XG4gIHJlZ2lzdGVySW5saW5lKGluc3RhbmNlKTtcbn1cblxuIiwiaW1wb3J0IHtleHRlbmR9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJEZWNvcmF0b3IoJ2lubGluZScsIGZ1bmN0aW9uKGZuLCBwcm9wcywgY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgbGV0IHJldCA9IGZuO1xuICAgIGlmICghcHJvcHMucGFydGlhbHMpIHtcbiAgICAgIHByb3BzLnBhcnRpYWxzID0ge307XG4gICAgICByZXQgPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBwYXJ0aWFscyBzdGFjayBmcmFtZSBwcmlvciB0byBleGVjLlxuICAgICAgICBsZXQgb3JpZ2luYWwgPSBjb250YWluZXIucGFydGlhbHM7XG4gICAgICAgIGNvbnRhaW5lci5wYXJ0aWFscyA9IGV4dGVuZCh7fSwgb3JpZ2luYWwsIHByb3BzLnBhcnRpYWxzKTtcbiAgICAgICAgbGV0IHJldCA9IGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBvcmlnaW5hbDtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvcHMucGFydGlhbHNbb3B0aW9ucy5hcmdzWzBdXSA9IG9wdGlvbnMuZm47XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cbiIsIlxuY29uc3QgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIGxldCBsb2MgPSBub2RlICYmIG5vZGUubG9jLFxuICAgICAgbGluZSxcbiAgICAgIGNvbHVtbjtcbiAgaWYgKGxvYykge1xuICAgIGxpbmUgPSBsb2Muc3RhcnQubGluZTtcbiAgICBjb2x1bW4gPSBsb2Muc3RhcnQuY29sdW1uO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBjb2x1bW47XG4gIH1cblxuICBsZXQgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgRXhjZXB0aW9uKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKGxvYykge1xuICAgICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcblxuICAgICAgLy8gV29yayBhcm91bmQgaXNzdWUgdW5kZXIgc2FmYXJpIHdoZXJlIHdlIGNhbid0IGRpcmVjdGx5IHNldCB0aGUgY29sdW1uIHZhbHVlXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbHVtbicsIHtcbiAgICAgICAgICB2YWx1ZTogY29sdW1uLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKG5vcCkge1xuICAgIC8qIElnbm9yZSBpZiB0aGUgYnJvd3NlciBpcyB2ZXJ5IHBhcnRpY3VsYXIgKi9cbiAgfVxufVxuXG5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbmV4cG9ydCBkZWZhdWx0IEV4Y2VwdGlvbjtcbiIsImltcG9ydCByZWdpc3RlckJsb2NrSGVscGVyTWlzc2luZyBmcm9tICcuL2hlbHBlcnMvYmxvY2staGVscGVyLW1pc3NpbmcnO1xuaW1wb3J0IHJlZ2lzdGVyRWFjaCBmcm9tICcuL2hlbHBlcnMvZWFjaCc7XG5pbXBvcnQgcmVnaXN0ZXJIZWxwZXJNaXNzaW5nIGZyb20gJy4vaGVscGVycy9oZWxwZXItbWlzc2luZyc7XG5pbXBvcnQgcmVnaXN0ZXJJZiBmcm9tICcuL2hlbHBlcnMvaWYnO1xuaW1wb3J0IHJlZ2lzdGVyTG9nIGZyb20gJy4vaGVscGVycy9sb2cnO1xuaW1wb3J0IHJlZ2lzdGVyTG9va3VwIGZyb20gJy4vaGVscGVycy9sb29rdXAnO1xuaW1wb3J0IHJlZ2lzdGVyV2l0aCBmcm9tICcuL2hlbHBlcnMvd2l0aCc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckRlZmF1bHRIZWxwZXJzKGluc3RhbmNlKSB7XG4gIHJlZ2lzdGVyQmxvY2tIZWxwZXJNaXNzaW5nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJFYWNoKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJIZWxwZXJNaXNzaW5nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJJZihpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyTG9nKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJMb29rdXAoaW5zdGFuY2UpO1xuICByZWdpc3RlcldpdGgoaW5zdGFuY2UpO1xufVxuIiwiaW1wb3J0IHthcHBlbmRDb250ZXh0UGF0aCwgY3JlYXRlRnJhbWUsIGlzQXJyYXl9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBsZXQgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSxcbiAgICAgICAgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmbih0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICBpZiAoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmlkcykge1xuICAgICAgICAgIG9wdGlvbnMuaWRzID0gW29wdGlvbnMubmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgICAgbGV0IGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gYXBwZW5kQ29udGV4dFBhdGgob3B0aW9ucy5kYXRhLmNvbnRleHRQYXRoLCBvcHRpb25zLm5hbWUpO1xuICAgICAgICBvcHRpb25zID0ge2RhdGE6IGRhdGF9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGJsb2NrUGFyYW1zLCBjcmVhdGVGcmFtZSwgaXNBcnJheSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuLi9leGNlcHRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ011c3QgcGFzcyBpdGVyYXRvciB0byAjZWFjaCcpO1xuICAgIH1cblxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm4sXG4gICAgICAgIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICByZXQgPSAnJyxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgY29udGV4dFBhdGg7XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pICsgJy4nO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWNJdGVyYXRpb24oZmllbGQsIGluZGV4LCBsYXN0KSB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBkYXRhLmtleSA9IGZpZWxkO1xuICAgICAgICBkYXRhLmluZGV4ID0gaW5kZXg7XG4gICAgICAgIGRhdGEuZmlyc3QgPSBpbmRleCA9PT0gMDtcbiAgICAgICAgZGF0YS5sYXN0ID0gISFsYXN0O1xuXG4gICAgICAgIGlmIChjb250ZXh0UGF0aCkge1xuICAgICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBjb250ZXh0UGF0aCArIGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbZmllbGRdLCB7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyhbY29udGV4dFtmaWVsZF0sIGZpZWxkXSwgW2NvbnRleHRQYXRoICsgZmllbGQsIG51bGxdKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IgKGxldCBqID0gY29udGV4dC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgICBleGVjSXRlcmF0aW9uKGksIGksIGkgPT09IGNvbnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcHJpb3JLZXk7XG5cbiAgICAgICAgZm9yIChsZXQga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZiAoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBydW5uaW5nIHRoZSBpdGVyYXRpb25zIG9uZSBzdGVwIG91dCBvZiBzeW5jIHNvIHdlIGNhbiBkZXRlY3RcbiAgICAgICAgICAgIC8vIHRoZSBsYXN0IGl0ZXJhdGlvbiB3aXRob3V0IGhhdmUgdG8gc2NhbiB0aGUgb2JqZWN0IHR3aWNlIGFuZCBjcmVhdGVcbiAgICAgICAgICAgIC8vIGFuIGl0ZXJtZWRpYXRlIGtleXMgYXJyYXkuXG4gICAgICAgICAgICBpZiAocHJpb3JLZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmlvcktleSA9IGtleTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByaW9yS2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBleGVjSXRlcmF0aW9uKHByaW9yS2V5LCBpIC0gMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cbiIsImltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi4vZXhjZXB0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbigvKiBbYXJncywgXW9wdGlvbnMgKi8pIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gQSBtaXNzaW5nIGZpZWxkIGluIGEge3tmb299fSBjb25zdHJ1Y3QuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTb21lb25lIGlzIGFjdHVhbGx5IHRyeWluZyB0byBjYWxsIHNvbWV0aGluZywgYmxvdyB1cC5cbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ01pc3NpbmcgaGVscGVyOiBcIicgKyBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdLm5hbWUgKyAnXCInKTtcbiAgICB9XG4gIH0pO1xufVxuIiwiaW1wb3J0IHtpc0VtcHR5LCBpc0Z1bmN0aW9ufSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoKCFvcHRpb25zLmhhc2guaW5jbHVkZVplcm8gJiYgIWNvbmRpdGlvbmFsKSB8fCBpc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7Zm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNofSk7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKC8qIG1lc3NhZ2UsIG9wdGlvbnMgKi8pIHtcbiAgICBsZXQgYXJncyA9IFt1bmRlZmluZWRdLFxuICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cblxuICAgIGxldCBsZXZlbCA9IDE7XG4gICAgaWYgKG9wdGlvbnMuaGFzaC5sZXZlbCAhPSBudWxsKSB7XG4gICAgICBsZXZlbCA9IG9wdGlvbnMuaGFzaC5sZXZlbDtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCkge1xuICAgICAgbGV2ZWwgPSBvcHRpb25zLmRhdGEubGV2ZWw7XG4gICAgfVxuICAgIGFyZ3NbMF0gPSBsZXZlbDtcblxuICAgIGluc3RhbmNlLmxvZyguLi4gYXJncyk7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2xvb2t1cCcsIGZ1bmN0aW9uKG9iaiwgZmllbGQpIHtcbiAgICByZXR1cm4gb2JqICYmIG9ialtmaWVsZF07XG4gIH0pO1xufVxuIiwiaW1wb3J0IHthcHBlbmRDb250ZXh0UGF0aCwgYmxvY2tQYXJhbXMsIGNyZWF0ZUZyYW1lLCBpc0VtcHR5LCBpc0Z1bmN0aW9ufSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGxldCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoIWlzRW1wdHkoY29udGV4dCkpIHtcbiAgICAgIGxldCBkYXRhID0gb3B0aW9ucy5kYXRhO1xuICAgICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5pZHNbMF0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwge1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMoW2NvbnRleHRdLCBbZGF0YSAmJiBkYXRhLmNvbnRleHRQYXRoXSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQge2luZGV4T2Z9IGZyb20gJy4vdXRpbHMnO1xuXG5sZXQgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IFsnZGVidWcnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ10sXG4gIGxldmVsOiAnaW5mbycsXG5cbiAgLy8gTWFwcyBhIGdpdmVuIGxldmVsIHZhbHVlIHRvIHRoZSBgbWV0aG9kTWFwYCBpbmRleGVzIGFib3ZlLlxuICBsb29rdXBMZXZlbDogZnVuY3Rpb24obGV2ZWwpIHtcbiAgICBpZiAodHlwZW9mIGxldmVsID09PSAnc3RyaW5nJykge1xuICAgICAgbGV0IGxldmVsTWFwID0gaW5kZXhPZihsb2dnZXIubWV0aG9kTWFwLCBsZXZlbC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIGlmIChsZXZlbE1hcCA+PSAwKSB7XG4gICAgICAgIGxldmVsID0gbGV2ZWxNYXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXZlbCA9IHBhcnNlSW50KGxldmVsLCAxMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxldmVsO1xuICB9LFxuXG4gIC8vIENhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIC4uLm1lc3NhZ2UpIHtcbiAgICBsZXZlbCA9IGxvZ2dlci5sb29rdXBMZXZlbChsZXZlbCk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGxvZ2dlci5sb29rdXBMZXZlbChsb2dnZXIubGV2ZWwpIDw9IGxldmVsKSB7XG4gICAgICBsZXQgbWV0aG9kID0gbG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAoIWNvbnNvbGVbbWV0aG9kXSkgeyAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICBtZXRob2QgPSAnbG9nJztcbiAgICAgIH1cbiAgICAgIGNvbnNvbGVbbWV0aG9kXSguLi5tZXNzYWdlKTsgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBsb2dnZXI7XG4iLCIvKiBnbG9iYWwgd2luZG93ICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihIYW5kbGViYXJzKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGxldCByb290ID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3csXG4gICAgICAkSGFuZGxlYmFycyA9IHJvb3QuSGFuZGxlYmFycztcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgSGFuZGxlYmFycy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJvb3QuSGFuZGxlYmFycyA9PT0gSGFuZGxlYmFycykge1xuICAgICAgcm9vdC5IYW5kbGViYXJzID0gJEhhbmRsZWJhcnM7XG4gICAgfVxuICAgIHJldHVybiBIYW5kbGViYXJzO1xuICB9O1xufVxuIiwiaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vZXhjZXB0aW9uJztcbmltcG9ydCB7IENPTVBJTEVSX1JFVklTSU9OLCBSRVZJU0lPTl9DSEFOR0VTLCBjcmVhdGVGcmFtZSB9IGZyb20gJy4vYmFzZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1JldmlzaW9uKGNvbXBpbGVySW5mbykge1xuICBjb25zdCBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICBjdXJyZW50UmV2aXNpb24gPSBDT01QSUxFUl9SRVZJU0lPTjtcblxuICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgIGNvbnN0IHJ1bnRpbWVWZXJzaW9ucyA9IFJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gJyArXG4gICAgICAgICAgICAnUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIHJ1bnRpbWVWZXJzaW9ucyArICcpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVyVmVyc2lvbnMgKyAnKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgK1xuICAgICAgICAgICAgJ1BsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoJyArIGNvbXBpbGVySW5mb1sxXSArICcpLicpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGUodGVtcGxhdGVTcGVjLCBlbnYpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKCFlbnYpIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGUnKTtcbiAgfVxuICBpZiAoIXRlbXBsYXRlU3BlYyB8fCAhdGVtcGxhdGVTcGVjLm1haW4pIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdVbmtub3duIHRlbXBsYXRlIG9iamVjdDogJyArIHR5cGVvZiB0ZW1wbGF0ZVNwZWMpO1xuICB9XG5cbiAgdGVtcGxhdGVTcGVjLm1haW4uZGVjb3JhdG9yID0gdGVtcGxhdGVTcGVjLm1haW5fZDtcblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHN1ZWRvLXN1cHBvcnRlZCBBUElzLlxuICBlbnYuVk0uY2hlY2tSZXZpc2lvbih0ZW1wbGF0ZVNwZWMuY29tcGlsZXIpO1xuXG4gIGZ1bmN0aW9uIGludm9rZVBhcnRpYWxXcmFwcGVyKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgICBjb250ZXh0ID0gVXRpbHMuZXh0ZW5kKHt9LCBjb250ZXh0LCBvcHRpb25zLmhhc2gpO1xuICAgICAgaWYgKG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIG9wdGlvbnMuaWRzWzBdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJ0aWFsID0gZW52LlZNLnJlc29sdmVQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG4gICAgbGV0IHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmNhbGwodGhpcywgcGFydGlhbCwgY29udGV4dCwgb3B0aW9ucyk7XG5cbiAgICBpZiAocmVzdWx0ID09IG51bGwgJiYgZW52LmNvbXBpbGUpIHtcbiAgICAgIG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXSA9IGVudi5jb21waWxlKHBhcnRpYWwsIHRlbXBsYXRlU3BlYy5jb21waWxlck9wdGlvbnMsIGVudik7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgaWYgKG9wdGlvbnMuaW5kZW50KSB7XG4gICAgICAgIGxldCBsaW5lcyA9IHJlc3VsdC5zcGxpdCgnXFxuJyk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gbGluZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFsaW5lc1tpXSAmJiBpICsgMSA9PT0gbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGluZXNbaV0gPSBvcHRpb25zLmluZGVudCArIGxpbmVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGhlIHBhcnRpYWwgJyArIG9wdGlvbnMubmFtZSArICcgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIGxldCBjb250YWluZXIgPSB7XG4gICAgc3RyaWN0OiBmdW5jdGlvbihvYmosIG5hbWUpIHtcbiAgICAgIGlmICghKG5hbWUgaW4gb2JqKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdcIicgKyBuYW1lICsgJ1wiIG5vdCBkZWZpbmVkIGluICcgKyBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9ialtuYW1lXTtcbiAgICB9LFxuICAgIGxvb2t1cDogZnVuY3Rpb24oZGVwdGhzLCBuYW1lKSB7XG4gICAgICBjb25zdCBsZW4gPSBkZXB0aHMubGVuZ3RoO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZGVwdGhzW2ldICYmIGRlcHRoc1tpXVtuYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGRlcHRoc1tpXVtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbGFtYmRhOiBmdW5jdGlvbihjdXJyZW50LCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGN1cnJlbnQgPT09ICdmdW5jdGlvbicgPyBjdXJyZW50LmNhbGwoY29udGV4dCkgOiBjdXJyZW50O1xuICAgIH0sXG5cbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuXG4gICAgZm46IGZ1bmN0aW9uKGkpIHtcbiAgICAgIGxldCByZXQgPSB0ZW1wbGF0ZVNwZWNbaV07XG4gICAgICByZXQuZGVjb3JhdG9yID0gdGVtcGxhdGVTcGVjW2kgKyAnX2QnXTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcblxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgICBsZXQgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldLFxuICAgICAgICAgIGZuID0gdGhpcy5mbihpKTtcbiAgICAgIGlmIChkYXRhIHx8IGRlcHRocyB8fCBibG9ja1BhcmFtcyB8fCBkZWNsYXJlZEJsb2NrUGFyYW1zKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gd3JhcFByb2dyYW0odGhpcywgaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG5cbiAgICBkYXRhOiBmdW5jdGlvbih2YWx1ZSwgZGVwdGgpIHtcbiAgICAgIHdoaWxlICh2YWx1ZSAmJiBkZXB0aC0tKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuX3BhcmVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICBsZXQgb2JqID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICBpZiAocGFyYW0gJiYgY29tbW9uICYmIChwYXJhbSAhPT0gY29tbW9uKSkge1xuICAgICAgICBvYmogPSBVdGlscy5leHRlbmQoe30sIGNvbW1vbiwgcGFyYW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG4gICAgLy8gQW4gZW1wdHkgb2JqZWN0IHRvIHVzZSBhcyByZXBsYWNlbWVudCBmb3IgbnVsbC1jb250ZXh0c1xuICAgIG51bGxDb250ZXh0OiBPYmplY3Quc2VhbCh7fSksXG5cbiAgICBub29wOiBlbnYuVk0ubm9vcCxcbiAgICBjb21waWxlckluZm86IHRlbXBsYXRlU3BlYy5jb21waWxlclxuICB9O1xuXG4gIGZ1bmN0aW9uIHJldChjb250ZXh0LCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgZGF0YSA9IG9wdGlvbnMuZGF0YTtcblxuICAgIHJldC5fc2V0dXAob3B0aW9ucyk7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwgJiYgdGVtcGxhdGVTcGVjLnVzZURhdGEpIHtcbiAgICAgIGRhdGEgPSBpbml0RGF0YShjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgbGV0IGRlcHRocyxcbiAgICAgICAgYmxvY2tQYXJhbXMgPSB0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgPyBbXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVTcGVjLnVzZURlcHRocykge1xuICAgICAgaWYgKG9wdGlvbnMuZGVwdGhzKSB7XG4gICAgICAgIGRlcHRocyA9IGNvbnRleHQgIT0gb3B0aW9ucy5kZXB0aHNbMF0gPyBbY29udGV4dF0uY29uY2F0KG9wdGlvbnMuZGVwdGhzKSA6IG9wdGlvbnMuZGVwdGhzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVwdGhzID0gW2NvbnRleHRdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1haW4oY29udGV4dC8qLCBvcHRpb25zKi8pIHtcbiAgICAgIHJldHVybiAnJyArIHRlbXBsYXRlU3BlYy5tYWluKGNvbnRhaW5lciwgY29udGV4dCwgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscywgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgfVxuICAgIG1haW4gPSBleGVjdXRlRGVjb3JhdG9ycyh0ZW1wbGF0ZVNwZWMubWFpbiwgbWFpbiwgY29udGFpbmVyLCBvcHRpb25zLmRlcHRocyB8fCBbXSwgZGF0YSwgYmxvY2tQYXJhbXMpO1xuICAgIHJldHVybiBtYWluKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG4gIHJldC5pc1RvcCA9IHRydWU7XG5cbiAgcmV0Ll9zZXR1cCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCkge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5oZWxwZXJzLCBlbnYuaGVscGVycyk7XG5cbiAgICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlUGFydGlhbCkge1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5wYXJ0aWFscywgZW52LnBhcnRpYWxzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlUGFydGlhbCB8fCB0ZW1wbGF0ZVNwZWMudXNlRGVjb3JhdG9ycykge1xuICAgICAgICBjb250YWluZXIuZGVjb3JhdG9ycyA9IGNvbnRhaW5lci5tZXJnZShvcHRpb25zLmRlY29yYXRvcnMsIGVudi5kZWNvcmF0b3JzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29udGFpbmVyLmhlbHBlcnMgPSBvcHRpb25zLmhlbHBlcnM7XG4gICAgICBjb250YWluZXIucGFydGlhbHMgPSBvcHRpb25zLnBhcnRpYWxzO1xuICAgICAgY29udGFpbmVyLmRlY29yYXRvcnMgPSBvcHRpb25zLmRlY29yYXRvcnM7XG4gICAgfVxuICB9O1xuXG4gIHJldC5fY2hpbGQgPSBmdW5jdGlvbihpLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKSB7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VCbG9ja1BhcmFtcyAmJiAhYmxvY2tQYXJhbXMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ211c3QgcGFzcyBibG9jayBwYXJhbXMnKTtcbiAgICB9XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMgJiYgIWRlcHRocykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignbXVzdCBwYXNzIHBhcmVudCBkZXB0aHMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCB0ZW1wbGF0ZVNwZWNbaV0sIGRhdGEsIDAsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcFByb2dyYW0oY29udGFpbmVyLCBpLCBmbiwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICBmdW5jdGlvbiBwcm9nKGNvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBjdXJyZW50RGVwdGhzID0gZGVwdGhzO1xuICAgIGlmIChkZXB0aHMgJiYgY29udGV4dCAhPSBkZXB0aHNbMF0gJiYgIShjb250ZXh0ID09PSBjb250YWluZXIubnVsbENvbnRleHQgJiYgZGVwdGhzWzBdID09PSBudWxsKSkge1xuICAgICAgY3VycmVudERlcHRocyA9IFtjb250ZXh0XS5jb25jYXQoZGVwdGhzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZm4oY29udGFpbmVyLFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICBjb250YWluZXIuaGVscGVycywgY29udGFpbmVyLnBhcnRpYWxzLFxuICAgICAgICBvcHRpb25zLmRhdGEgfHwgZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXMgJiYgW29wdGlvbnMuYmxvY2tQYXJhbXNdLmNvbmNhdChibG9ja1BhcmFtcyksXG4gICAgICAgIGN1cnJlbnREZXB0aHMpO1xuICB9XG5cbiAgcHJvZyA9IGV4ZWN1dGVEZWNvcmF0b3JzKGZuLCBwcm9nLCBjb250YWluZXIsIGRlcHRocywgZGF0YSwgYmxvY2tQYXJhbXMpO1xuXG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBkZXB0aHMgPyBkZXB0aHMubGVuZ3RoIDogMDtcbiAgcHJvZy5ibG9ja1BhcmFtcyA9IGRlY2xhcmVkQmxvY2tQYXJhbXMgfHwgMDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUGFydGlhbChwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gIGlmICghcGFydGlhbCkge1xuICAgIGlmIChvcHRpb25zLm5hbWUgPT09ICdAcGFydGlhbC1ibG9jaycpIHtcbiAgICAgIHBhcnRpYWwgPSBvcHRpb25zLmRhdGFbJ3BhcnRpYWwtYmxvY2snXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbb3B0aW9ucy5uYW1lXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIXBhcnRpYWwuY2FsbCAmJiAhb3B0aW9ucy5uYW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcGFydGlhbCB0aGF0IHJldHVybmVkIGEgc3RyaW5nXG4gICAgb3B0aW9ucy5uYW1lID0gcGFydGlhbDtcbiAgICBwYXJ0aWFsID0gb3B0aW9ucy5wYXJ0aWFsc1twYXJ0aWFsXTtcbiAgfVxuICByZXR1cm4gcGFydGlhbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludm9rZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICAvLyBVc2UgdGhlIGN1cnJlbnQgY2xvc3VyZSBjb250ZXh0IHRvIHNhdmUgdGhlIHBhcnRpYWwtYmxvY2sgaWYgdGhpcyBwYXJ0aWFsXG4gIGNvbnN0IGN1cnJlbnRQYXJ0aWFsQmxvY2sgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ107XG4gIG9wdGlvbnMucGFydGlhbCA9IHRydWU7XG4gIGlmIChvcHRpb25zLmlkcykge1xuICAgIG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCA9IG9wdGlvbnMuaWRzWzBdIHx8IG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aDtcbiAgfVxuXG4gIGxldCBwYXJ0aWFsQmxvY2s7XG4gIGlmIChvcHRpb25zLmZuICYmIG9wdGlvbnMuZm4gIT09IG5vb3ApIHtcbiAgICBvcHRpb25zLmRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIC8vIFdyYXBwZXIgZnVuY3Rpb24gdG8gZ2V0IGFjY2VzcyB0byBjdXJyZW50UGFydGlhbEJsb2NrIGZyb20gdGhlIGNsb3N1cmVcbiAgICBsZXQgZm4gPSBvcHRpb25zLmZuO1xuICAgIHBhcnRpYWxCbG9jayA9IG9wdGlvbnMuZGF0YVsncGFydGlhbC1ibG9jayddID0gZnVuY3Rpb24gcGFydGlhbEJsb2NrV3JhcHBlcihjb250ZXh0LCBvcHRpb25zID0ge30pIHtcblxuICAgICAgLy8gUmVzdG9yZSB0aGUgcGFydGlhbC1ibG9jayBmcm9tIHRoZSBjbG9zdXJlIGZvciB0aGUgZXhlY3V0aW9uIG9mIHRoZSBibG9ja1xuICAgICAgLy8gaS5lLiB0aGUgcGFydCBpbnNpZGUgdGhlIGJsb2NrIG9mIHRoZSBwYXJ0aWFsIGNhbGwuXG4gICAgICBvcHRpb25zLmRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgICAgb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ10gPSBjdXJyZW50UGFydGlhbEJsb2NrO1xuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH07XG4gICAgaWYgKGZuLnBhcnRpYWxzKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzID0gVXRpbHMuZXh0ZW5kKHt9LCBvcHRpb25zLnBhcnRpYWxzLCBmbi5wYXJ0aWFscyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCAmJiBwYXJ0aWFsQmxvY2spIHtcbiAgICBwYXJ0aWFsID0gcGFydGlhbEJsb2NrO1xuICB9XG5cbiAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBmb3VuZCcpO1xuICB9IGVsc2UgaWYgKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub29wKCkgeyByZXR1cm4gJyc7IH1cblxuZnVuY3Rpb24gaW5pdERhdGEoY29udGV4dCwgZGF0YSkge1xuICBpZiAoIWRhdGEgfHwgISgncm9vdCcgaW4gZGF0YSkpIHtcbiAgICBkYXRhID0gZGF0YSA/IGNyZWF0ZUZyYW1lKGRhdGEpIDoge307XG4gICAgZGF0YS5yb290ID0gY29udGV4dDtcbiAgfVxuICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gZXhlY3V0ZURlY29yYXRvcnMoZm4sIHByb2csIGNvbnRhaW5lciwgZGVwdGhzLCBkYXRhLCBibG9ja1BhcmFtcykge1xuICBpZiAoZm4uZGVjb3JhdG9yKSB7XG4gICAgbGV0IHByb3BzID0ge307XG4gICAgcHJvZyA9IGZuLmRlY29yYXRvcihwcm9nLCBwcm9wcywgY29udGFpbmVyLCBkZXB0aHMgJiYgZGVwdGhzWzBdLCBkYXRhLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICBVdGlscy5leHRlbmQocHJvZywgcHJvcHMpO1xuICB9XG4gIHJldHVybiBwcm9nO1xufVxuIiwiLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IFNhZmVTdHJpbmcucHJvdG90eXBlLnRvSFRNTCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJycgKyB0aGlzLnN0cmluZztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFNhZmVTdHJpbmc7XG4iLCJjb25zdCBlc2NhcGUgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmI3gyNzsnLFxuICAnYCc6ICcmI3g2MDsnLFxuICAnPSc6ICcmI3gzRDsnXG59O1xuXG5jb25zdCBiYWRDaGFycyA9IC9bJjw+XCInYD1dL2csXG4gICAgICBwb3NzaWJsZSA9IC9bJjw+XCInYD1dLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKG9iai8qICwgLi4uc291cmNlICovKSB7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yIChsZXQga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhcmd1bWVudHNbaV0sIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5leHBvcnQgbGV0IHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxuLyogZXNsaW50LWRpc2FibGUgZnVuYy1zdHlsZSAqL1xubGV0IGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbmV4cG9ydCB7aXNGdW5jdGlvbn07XG4vKiBlc2xpbnQtZW5hYmxlIGZ1bmMtc3R5bGUgKi9cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmV4cG9ydCBjb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07XG5cbi8vIE9sZGVyIElFIHZlcnNpb25zIGRvIG5vdCBkaXJlY3RseSBzdXBwb3J0IGluZGV4T2Ygc28gd2UgbXVzdCBpbXBsZW1lbnQgb3VyIG93biwgc2FkbHkuXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRXhwcmVzc2lvbihzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgJiYgc3RyaW5nLnRvSFRNTCkge1xuICAgICAgcmV0dXJuIHN0cmluZy50b0hUTUwoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nICsgJyc7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmc7XG4gIH1cblxuICBpZiAoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZyYW1lKG9iamVjdCkge1xuICBsZXQgZnJhbWUgPSBleHRlbmQoe30sIG9iamVjdCk7XG4gIGZyYW1lLl9wYXJlbnQgPSBvYmplY3Q7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrUGFyYW1zKHBhcmFtcywgaWRzKSB7XG4gIHBhcmFtcy5wYXRoID0gaWRzO1xuICByZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kQ29udGV4dFBhdGgoY29udGV4dFBhdGgsIGlkKSB7XG4gIHJldHVybiAoY29udGV4dFBhdGggPyBjb250ZXh0UGF0aCArICcuJyA6ICcnKSArIGlkO1xufVxuIiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpWydkZWZhdWx0J107XG4iLCIvKlxyXG4gKiAgQ29weXJpZ2h0IDIwMTQgR2FyeSBHcmVlbi5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XHJcbiAqICB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiAgVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiAgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqICBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICovXHJcblxyXG4oZnVuY3Rpb24od2luZG93LCBmYWN0b3J5KSB7XHJcblxyXG5cdGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXHJcblx0e1xyXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHdpbmRvdyk7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHR3aW5kb3cuTGlnaHRSb3V0ZXIgPSBmYWN0b3J5KHdpbmRvdyk7XHJcblx0fVxyXG5cclxufSh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IHdpbmRvdywgZnVuY3Rpb24od2luZG93KSB7XHJcblxyXG5cdGZ1bmN0aW9uIExpZ2h0Um91dGVyKG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0LyoqXHJcblx0XHQgKiBQYXRoIHJvb3QgKHdpbGwgYmUgc3RyaXBwZWQgb3V0IHdoZW4gdGVzdGluZyBwYXRoLWJhc2VkIHJvdXRlcylcclxuXHRcdCAqIEB0eXBlIHN0cmluZ1xyXG5cdFx0ICovXHJcblx0XHR0aGlzLnBhdGhSb290ID0gJyc7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSb3V0ZXNcclxuXHRcdCAqIEB0eXBlIGFycmF5XHJcblx0XHQgKi9cclxuXHRcdHRoaXMucm91dGVzID0gW107XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBEZWZhdWx0IHJvdXRpbmcgdHlwZSBbaGFzaCBvciBwYXRoXVxyXG5cdFx0ICogQHR5cGUgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHRoaXMudHlwZSA9ICdwYXRoJztcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1c3RvbSBwYXRoIChtYWlubHkgdXNlZCBmb3IgdGVzdGluZylcclxuXHRcdCAqIEB0eXBlIHN0cmluZ1xyXG5cdFx0ICovXHJcblx0XHR0aGlzLnBhdGggPSBudWxsO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VzdG9tIGhhc2ggKG1haW5seSB1c2VkIGZvciB0ZXN0aW5nKVxyXG5cdFx0ICogQHR5cGUgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHRoaXMuaGFzaCA9IG51bGw7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb250ZXh0IHRvIGNhbGwgbWF0Y2hlZCByb3V0ZXMgdW5kZXJcclxuXHRcdCAqIEB0eXBlIHttaXhlZH1cclxuXHRcdCAqL1xyXG5cdFx0dGhpcy5jb250ZXh0ID0gdGhpcztcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEhhbmRsZXIgZm9yIHN0cmluZyBiYXNlZCBjYWxsYmFja3NcclxuXHRcdCAqIEB0eXBlIHtvYmplY3R8ZnVuY3Rpb259XHJcblx0XHQgKi9cclxuXHRcdHRoaXMuaGFuZGxlciA9IHdpbmRvdztcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE5hbWVkIHBhcmFtIHJlcGxhY2UgYW5kIG1hdGNoaW5nIHJlZ2V4XHJcblx0XHQgKiBAdHlwZSB7T2JqZWN0fVxyXG5cdFx0ICovXHJcblx0XHR2YXIgbmFtZWRQYXJhbSA9ICcoW1xcXFx3LV0rKSc7XHJcblx0XHR0aGlzLm5hbWVkUGFyYW0gPSB7XHJcblx0XHRcdG1hdGNoOiBuZXcgUmVnRXhwKCd7KCcgKyBuYW1lZFBhcmFtICsgJyl9JywgJ2cnKSxcclxuXHRcdFx0cmVwbGFjZTogbmFtZWRQYXJhbVxyXG5cdFx0fTtcclxuXHJcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy50eXBlKSAgICAgIHRoaXMuc2V0VHlwZShvcHRpb25zLnR5cGUpO1xyXG5cdFx0aWYgKG9wdGlvbnMucGF0aCkgICAgICB0aGlzLnNldFBhdGgob3B0aW9ucy5wYXRoKTtcclxuXHRcdGlmIChvcHRpb25zLnBhdGhSb290KSAgdGhpcy5zZXRQYXRoUm9vdChvcHRpb25zLnBhdGhSb290KTtcclxuXHRcdGlmIChvcHRpb25zLmhhc2gpICAgICAgdGhpcy5zZXRIYXNoKG9wdGlvbnMuaGFzaCk7XHJcblx0XHRpZiAob3B0aW9ucy5jb250ZXh0KSAgIHRoaXMuc2V0Q29udGV4dChvcHRpb25zLmNvbnRleHQpO1xyXG5cdFx0aWYgKG9wdGlvbnMuaGFuZGxlcikgICB0aGlzLnNldEhhbmRsZXIob3B0aW9ucy5oYW5kbGVyKTtcclxuXHJcblx0XHRpZiAob3B0aW9ucy5yb3V0ZXMpXHJcblx0XHR7XHJcblx0XHRcdHZhciByb3V0ZTtcclxuXHRcdFx0Zm9yIChyb3V0ZSBpbiBvcHRpb25zLnJvdXRlcylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRoaXMuYWRkKHJvdXRlLCBvcHRpb25zLnJvdXRlc1tyb3V0ZV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRMaWdodFJvdXRlci5wcm90b3R5cGUgPSB7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSb3V0ZSBjb25zdHJ1Y3RvclxyXG5cdFx0ICogQHR5cGUge1JvdXRlfVxyXG5cdFx0ICovXHJcblx0XHRSb3V0ZTogUm91dGUsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSByb3V0ZVxyXG5cdFx0ICogQHBhcmFtIHN0cmluZ3xSZWdFeHAgICByb3V0ZVxyXG5cdFx0ICogQHBhcmFtIHN0cmluZ3xmdW5jdGlvbiBjYWxsYmFja1xyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdGFkZDogZnVuY3Rpb24ocm91dGUsIGNhbGxiYWNrKSB7XHJcblx0XHRcdHRoaXMucm91dGVzLnB1c2gobmV3IHRoaXMuUm91dGUocm91dGUsIGNhbGxiYWNrLCB0aGlzKSk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbXB0eS9jbGVhciBhbGwgdGhlIHJvdXRlc1xyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdGVtcHR5OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dGhpcy5yb3V0ZXMgPSBbXTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0J3MgdGhlIHJvdXRpbmcgdHlwZVxyXG5cdFx0ICogQHBhcmFtIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0c2V0VHlwZTogZnVuY3Rpb24odHlwZSkge1xyXG5cdFx0XHR0aGlzLnR5cGUgPSB0eXBlO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgdGhlIHBhdGggcm9vdCB1cmxcclxuXHRcdCAqIEBwYXJhbSBzdHJpbmcgdXJsXHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0c2V0UGF0aFJvb3Q6IGZ1bmN0aW9uKHVybCkge1xyXG5cdFx0XHR0aGlzLnBhdGhSb290ID0gdXJsO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXRzIHRoZSBjdXN0b20gcGF0aCB0byB0ZXN0IHJvdXRlcyBhZ2FpbnN0XHJcblx0XHQgKiBAcGFyYW0gIHN0cmluZyBwYXRoXHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0c2V0UGF0aDogZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXRzIHRoZSBjdXN0b20gaGFzaCB0byB0ZXN0IHJvdXRlcyBhZ2FpbnN0XHJcblx0XHQgKiBAcGFyYW0gIHN0cmluZyBoYXNoXHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0c2V0SGFzaDogZnVuY3Rpb24oaGFzaCkge1xyXG5cdFx0XHR0aGlzLmhhc2ggPSBoYXNoO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXRzIGNvbnRleHQgdG8gY2FsbCBtYXRjaGVkIHJvdXRlcyB1bmRlclxyXG5cdFx0ICogQHBhcmFtICBtaXhlZCBjb250ZXh0XHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0c2V0Q29udGV4dDogZnVuY3Rpb24oY29udGV4dCkge1xyXG5cdFx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXQgaGFuZGxlclxyXG5cdFx0ICogQHBhcmFtICBtaXhlZCBjb250ZXh0XHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0c2V0SGFuZGxlcjogZnVuY3Rpb24oaGFuZGxlcikge1xyXG5cdFx0XHR0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXRzIHRoZSB1cmwgdG8gdGVzdCB0aGUgcm91dGVzIGFnYWluc3RcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRnZXRVcmw6IGZ1bmN0aW9uKHJvdXRlVHlwZSkge1xyXG5cclxuXHRcdFx0dmFyIHVybDtcclxuXHRcdFx0cm91dGVUeXBlID0gcm91dGVUeXBlIHx8IHRoaXMudHlwZTtcclxuXHJcblx0XHRcdGlmIChyb3V0ZVR5cGUgPT0gJ3BhdGgnKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHJvb3RSZWdleCA9IG5ldyBSZWdFeHAoJ14nICsgdGhpcy5wYXRoUm9vdCArICcvPycpO1xyXG5cdFx0XHRcdHVybCA9IHRoaXMucGF0aCB8fCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEpO1xyXG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHJvb3RSZWdleCwgJycpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKHJvdXRlVHlwZSA9PSAnaGFzaCcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR1cmwgPSB0aGlzLmhhc2ggfHwgd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdHJldHVybiBkZWNvZGVVUkkodXJsKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBdHRlbXB0IHRvIG1hdGNoIGEgb25lLXRpbWUgcm91dGUgYW5kIGNhbGxiYWNrXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtICB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcGFyYW0gIHtjbG9zdXJlfHN0cmluZ30gY2FsbGJhY2tcclxuXHRcdCAqIEByZXR1cm4ge21peGVkfVxyXG5cdFx0ICovXHJcblx0XHRtYXRjaDogZnVuY3Rpb24ocGF0aCwgY2FsbGJhY2spIHtcclxuXHRcdFx0dmFyIHJvdXRlID0gbmV3IHRoaXMuUm91dGUocGF0aCwgY2FsbGJhY2ssIHRoaXMpO1xyXG5cdFx0XHRpZiAocm91dGUudGVzdCh0aGlzLmdldFVybCgpKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldHVybiByb3V0ZS5ydW4oKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJ1biB0aGUgcm91dGVyXHJcblx0XHQgKiBAcmV0dXJuIFJvdXRlfHVuZGVmaW5lZFxyXG5cdFx0ICovXHJcblx0XHRydW46IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgdXJsID0gdGhpcy5nZXRVcmwoKSwgcm91dGU7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpIGluIHRoaXMucm91dGVzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gR2V0IHRoZSByb3V0ZVxyXG5cdFx0XHRcdHJvdXRlID0gdGhpcy5yb3V0ZXNbaV07XHJcblxyXG5cdFx0XHRcdC8vIFRlc3QgYW5kIHJ1biB0aGUgcm91dGUgaWYgaXQgbWF0Y2hlc1xyXG5cdFx0XHRcdGlmIChyb3V0ZS50ZXN0KHVybCkpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cm91dGUucnVuKCk7XHJcblx0XHRcdFx0XHRyZXR1cm4gcm91dGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIFJvdXRlIG9iamVjdFxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGNsb3N1cmVcclxuXHQgKiBAcGFyYW0ge0xpZ2h0Um91dGVyfSByb3V0ZXIgIEluc3RhbmNlIG9mIHRoZSBsaWdodCByb3V0ZXIgdGhlIHJvdXRlIGJlbG9uZ3MgdG8uXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gUm91dGUocGF0aCwgY2FsbGJhY2ssIHJvdXRlcilcclxuXHR7XHJcblx0XHR0aGlzLnBhdGggPSBwYXRoO1xyXG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cdFx0dGhpcy5yb3V0ZXIgPSByb3V0ZXI7XHJcblx0XHR0aGlzLnZhbHVlcyA9IFtdO1xyXG5cdH1cclxuXHJcblx0Um91dGUucHJvdG90eXBlID0ge1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udmVydHMgcm91dGUgdG8gYSByZWdleCAoaWYgcmVxdWlyZWQpIHNvIHRoYXQgaXQncyBzdWl0YWJsZSBmb3IgbWF0Y2hpbmcgYWdhaW5zdC5cclxuXHRcdCAqIEBwYXJhbSAgc3RyaW5nIHJvdXRlXHJcblx0XHQgKiBAcmV0dXJuIFJlZ0V4cFxyXG5cdFx0ICovXHJcblx0XHRyZWdleDogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHR2YXIgcGF0aCA9IHRoaXMucGF0aDtcclxuXHJcblx0XHRcdGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyBwYXRoLnJlcGxhY2UoL1xcLy9nLCAnXFxcXC8nKS5yZXBsYWNlKHRoaXMucm91dGVyLm5hbWVkUGFyYW0ubWF0Y2gsIHRoaXMucm91dGVyLm5hbWVkUGFyYW0ucmVwbGFjZSkgKyAnJCcpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBwYXRoO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCB0aGUgbWF0Y2hpbmcgcGFyYW0ga2V5c1xyXG5cdFx0ICogQHJldHVybiBvYmplY3QgIE9iamVjdCBrZXllZCB3aXRoIHBhcmFtIG5hbWUgKG9yIGluZGV4KSB3aXRoIHRoZSB2YWx1ZS5cclxuXHRcdCAqL1xyXG5cdFx0cGFyYW1zOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdHZhciBvYmogPSB7fSwgbmFtZSwgdmFsdWVzID0gdGhpcy52YWx1ZXMsIHBhcmFtcyA9IHZhbHVlcywgaSwgdCA9IDAsIHBhdGggPSB0aGlzLnBhdGg7XHJcblxyXG5cdFx0XHRpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dCA9IDE7XHJcblx0XHRcdFx0cGFyYW1zID0gcGF0aC5tYXRjaCh0aGlzLnJvdXRlci5uYW1lZFBhcmFtLm1hdGNoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yIChpIGluIHBhcmFtcylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWUgPSB0ID8gcGFyYW1zW2ldLnJlcGxhY2UodGhpcy5yb3V0ZXIubmFtZWRQYXJhbS5tYXRjaCwgJyQxJykgOiBpO1xyXG5cdFx0XHRcdG9ialtuYW1lXSA9IHZhbHVlc1tpXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG9iajtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUZXN0IHRoZSByb3V0ZSB0byBzZWUgaWYgaXQgbWF0Y2hlc1xyXG5cdFx0ICogQHBhcmFtICB7c3RyaW5nfSB1cmwgVXJsIHRvIG1hdGNoIGFnYWluc3RcclxuXHRcdCAqIEByZXR1cm4ge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdHRlc3Q6IGZ1bmN0aW9uKHVybCkge1xyXG5cdFx0XHR2YXIgbWF0Y2hlcztcclxuXHRcdFx0aWYgKG1hdGNoZXMgPSB1cmwubWF0Y2godGhpcy5yZWdleCgpKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRoaXMudmFsdWVzID0gbWF0Y2hlcy5zbGljZSgxKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUnVuIHRoZSByb3V0ZSBjYWxsYmFjayB3aXRoIHRoZSBtYXRjaGVkIHBhcmFtc1xyXG5cdFx0ICogQHJldHVybiB7bWl4ZWR9XHJcblx0XHQgKi9cclxuXHRcdHJ1bjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gJ3N0cmluZycpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5yb3V0ZXIuaGFuZGxlclt0aGlzLmNhbGxiYWNrXSh0aGlzLnBhcmFtcygpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpcy5jYWxsYmFjay5hcHBseSh0aGlzLnJvdXRlci5jb250ZXh0LCBbdGhpcy5wYXJhbXMoKV0pO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdHJldHVybiBMaWdodFJvdXRlcjtcclxuXHJcbn0pKTsiLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuMTIuMlxuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWUsIG1vZHVsZUxvYWRUaW1lLCBub2RlTG9hZFRpbWUsIHVwVGltZTtcblxuICBpZiAoKHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwZXJmb3JtYW5jZSAhPT0gbnVsbCkgJiYgcGVyZm9ybWFuY2Uubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsKSAmJiBwcm9jZXNzLmhydGltZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGdldE5hbm9TZWNvbmRzKCkgLSBub2RlTG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIG1vZHVsZUxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgICB1cFRpbWUgPSBwcm9jZXNzLnVwdGltZSgpICogMWU5O1xuICAgIG5vZGVMb2FkVGltZSA9IG1vZHVsZUxvYWRUaW1lIC0gdXBUaW1lO1xuICB9IGVsc2UgaWYgKERhdGUubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IERhdGUubm93KCk7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wZXJmb3JtYW5jZS1ub3cuanMubWFwXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyoqXG4gKiBaZXN0IChodHRwczovL2dpdGh1Yi5jb20vY2hqai96ZXN0KVxuICogQSBjc3Mgc2VsZWN0b3IgZW5naW5lLlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTIsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKi9cblxuLy8gVE9ET1xuLy8gLSBSZWNvZ25pemUgdGhlIFRSIHN1YmplY3Qgc2VsZWN0b3Igd2hlbiBwYXJzaW5nLlxuLy8gLSBQYXNzIGNvbnRleHQgdG8gc2NvcGUuXG4vLyAtIEFkZCA6Y29sdW1uIHBzZXVkby1jbGFzc2VzLlxuXG47KGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIFNoYXJlZFxuICovXG5cbnZhciB3aW5kb3cgPSB0aGlzXG4gICwgZG9jdW1lbnQgPSB0aGlzLmRvY3VtZW50XG4gICwgb2xkID0gdGhpcy56ZXN0O1xuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuXG52YXIgY29tcGFyZURvY3VtZW50UG9zaXRpb24gPSAoZnVuY3Rpb24oKSB7XG4gIGlmIChkb2N1bWVudC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbikge1xuICAgIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihiKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIGVsID0gYS5vd25lckRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCcqJylcbiAgICAgICwgaSA9IGVsLmxlbmd0aDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChlbFtpXSA9PT0gYSkgcmV0dXJuIDI7XG4gICAgICBpZiAoZWxbaV0gPT09IGIpIHJldHVybiA0O1xuICAgIH1cblxuICAgIHJldHVybiAxO1xuICB9O1xufSkoKTtcblxudmFyIG9yZGVyID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gY29tcGFyZURvY3VtZW50UG9zaXRpb24oYSwgYikgJiAyID8gMSA6IC0xO1xufTtcblxudmFyIG5leHQgPSBmdW5jdGlvbihlbCkge1xuICB3aGlsZSAoKGVsID0gZWwubmV4dFNpYmxpbmcpXG4gICAgICAgICAmJiBlbC5ub2RlVHlwZSAhPT0gMSk7XG4gIHJldHVybiBlbDtcbn07XG5cbnZhciBwcmV2ID0gZnVuY3Rpb24oZWwpIHtcbiAgd2hpbGUgKChlbCA9IGVsLnByZXZpb3VzU2libGluZylcbiAgICAgICAgICYmIGVsLm5vZGVUeXBlICE9PSAxKTtcbiAgcmV0dXJuIGVsO1xufTtcblxudmFyIGNoaWxkID0gZnVuY3Rpb24oZWwpIHtcbiAgaWYgKGVsID0gZWwuZmlyc3RDaGlsZCkge1xuICAgIHdoaWxlIChlbC5ub2RlVHlwZSAhPT0gMVxuICAgICAgICAgICAmJiAoZWwgPSBlbC5uZXh0U2libGluZykpO1xuICB9XG4gIHJldHVybiBlbDtcbn07XG5cbnZhciBsYXN0Q2hpbGQgPSBmdW5jdGlvbihlbCkge1xuICBpZiAoZWwgPSBlbC5sYXN0Q2hpbGQpIHtcbiAgICB3aGlsZSAoZWwubm9kZVR5cGUgIT09IDFcbiAgICAgICAgICAgJiYgKGVsID0gZWwucHJldmlvdXNTaWJsaW5nKSk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufTtcblxudmFyIHVucXVvdGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgaWYgKCFzdHIpIHJldHVybiBzdHI7XG4gIHZhciBjaCA9IHN0clswXTtcbiAgcmV0dXJuIGNoID09PSAnXCInIHx8IGNoID09PSAnXFwnJ1xuICAgID8gc3RyLnNsaWNlKDEsIC0xKVxuICAgIDogc3RyO1xufTtcblxudmFyIGluZGV4T2YgPSAoZnVuY3Rpb24oKSB7XG4gIGlmIChBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZjtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVtKSB7XG4gICAgdmFyIGkgPSB0aGlzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAodGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfTtcbn0pKCk7XG5cbnZhciBtYWtlSW5zaWRlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICB2YXIgcmVnZXggPSBydWxlcy5pbnNpZGUuc291cmNlXG4gICAgLnJlcGxhY2UoLzwvZywgc3RhcnQpXG4gICAgLnJlcGxhY2UoLz4vZywgZW5kKTtcblxuICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCk7XG59O1xuXG52YXIgcmVwbGFjZSA9IGZ1bmN0aW9uKHJlZ2V4LCBuYW1lLCB2YWwpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwuc291cmNlIHx8IHZhbCk7XG4gIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4KTtcbn07XG5cbnZhciB0cnVuY2F0ZVVybCA9IGZ1bmN0aW9uKHVybCwgbnVtKSB7XG4gIHJldHVybiB1cmxcbiAgICAucmVwbGFjZSgvXig/Olxcdys6XFwvXFwvfFxcLyspLywgJycpXG4gICAgLnJlcGxhY2UoLyg/OlxcLyt8XFwvKiMuKj8pJC8sICcnKVxuICAgIC5zcGxpdCgnLycsIG51bSlcbiAgICAuam9pbignLycpO1xufTtcblxuLyoqXG4gKiBIYW5kbGUgYG50aGAgU2VsZWN0b3JzXG4gKi9cblxudmFyIHBhcnNlTnRoID0gZnVuY3Rpb24ocGFyYW0sIHRlc3QpIHtcbiAgdmFyIHBhcmFtID0gcGFyYW0ucmVwbGFjZSgvXFxzKy9nLCAnJylcbiAgICAsIGNhcDtcblxuICBpZiAocGFyYW0gPT09ICdldmVuJykge1xuICAgIHBhcmFtID0gJzJuKzAnO1xuICB9IGVsc2UgaWYgKHBhcmFtID09PSAnb2RkJykge1xuICAgIHBhcmFtID0gJzJuKzEnO1xuICB9IGVsc2UgaWYgKCF+cGFyYW0uaW5kZXhPZignbicpKSB7XG4gICAgcGFyYW0gPSAnMG4nICsgcGFyYW07XG4gIH1cblxuICBjYXAgPSAvXihbKy1dKT8oXFxkKyk/bihbKy1dKT8oXFxkKyk/JC8uZXhlYyhwYXJhbSk7XG5cbiAgcmV0dXJuIHtcbiAgICBncm91cDogY2FwWzFdID09PSAnLSdcbiAgICAgID8gLShjYXBbMl0gfHwgMSlcbiAgICAgIDogKyhjYXBbMl0gfHwgMSksXG4gICAgb2Zmc2V0OiBjYXBbNF1cbiAgICAgID8gKGNhcFszXSA9PT0gJy0nID8gLWNhcFs0XSA6ICtjYXBbNF0pXG4gICAgICA6IDBcbiAgfTtcbn07XG5cbnZhciBudGggPSBmdW5jdGlvbihwYXJhbSwgdGVzdCwgbGFzdCkge1xuICB2YXIgcGFyYW0gPSBwYXJzZU50aChwYXJhbSlcbiAgICAsIGdyb3VwID0gcGFyYW0uZ3JvdXBcbiAgICAsIG9mZnNldCA9IHBhcmFtLm9mZnNldFxuICAgICwgZmluZCA9ICFsYXN0ID8gY2hpbGQgOiBsYXN0Q2hpbGRcbiAgICAsIGFkdmFuY2UgPSAhbGFzdCA/IG5leHQgOiBwcmV2O1xuXG4gIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgIGlmIChlbC5wYXJlbnROb2RlLm5vZGVUeXBlICE9PSAxKSByZXR1cm47XG5cbiAgICB2YXIgcmVsID0gZmluZChlbC5wYXJlbnROb2RlKVxuICAgICAgLCBwb3MgPSAwO1xuXG4gICAgd2hpbGUgKHJlbCkge1xuICAgICAgaWYgKHRlc3QocmVsLCBlbCkpIHBvcysrO1xuICAgICAgaWYgKHJlbCA9PT0gZWwpIHtcbiAgICAgICAgcG9zIC09IG9mZnNldDtcbiAgICAgICAgcmV0dXJuIGdyb3VwICYmIHBvc1xuICAgICAgICAgID8gIShwb3MgJSBncm91cCkgJiYgKHBvcyA8IDAgPT09IGdyb3VwIDwgMClcbiAgICAgICAgICA6ICFwb3M7XG4gICAgICB9XG4gICAgICByZWwgPSBhZHZhbmNlKHJlbCk7XG4gICAgfVxuICB9O1xufTtcblxuLyoqXG4gKiBTaW1wbGUgU2VsZWN0b3JzXG4gKi9cblxudmFyIHNlbGVjdG9ycyA9IHtcbiAgJyonOiAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBlbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVDb21tZW50KCcnKSk7XG4gICAgICByZXR1cm4gISFlbC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpWzBdO1xuICAgIH0oKSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGlmIChlbC5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9KSgpLFxuICAndHlwZSc6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuIGVsLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IHR5cGU7XG4gICAgfTtcbiAgfSxcbiAgJ2F0dHInOiBmdW5jdGlvbihrZXksIG9wLCB2YWwsIGkpIHtcbiAgICBvcCA9IG9wZXJhdG9yc1tvcF07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICB2YXIgYXR0cjtcbiAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2Zvcic6XG4gICAgICAgICAgYXR0ciA9IGVsLmh0bWxGb3I7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NsYXNzJzpcbiAgICAgICAgICAvLyBjbGFzc05hbWUgaXMgJycgd2hlbiBub24tZXhpc3RlbnRcbiAgICAgICAgICAvLyBnZXRBdHRyaWJ1dGUoJ2NsYXNzJykgaXMgbnVsbFxuICAgICAgICAgIGF0dHIgPSBlbC5jbGFzc05hbWU7XG4gICAgICAgICAgaWYgKGF0dHIgPT09ICcnICYmIGVsLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSA9PSBudWxsKSB7XG4gICAgICAgICAgICBhdHRyID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2hyZWYnOlxuICAgICAgICAgIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnLCAyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndGl0bGUnOlxuICAgICAgICAgIC8vIGdldEF0dHJpYnV0ZSgndGl0bGUnKSBjYW4gYmUgJycgd2hlbiBub24tZXhpc3RlbnQgc29tZXRpbWVzP1xuICAgICAgICAgIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykgfHwgbnVsbDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaWQnOlxuICAgICAgICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYXR0ciA9IGVsW2tleV0gIT0gbnVsbFxuICAgICAgICAgICAgPyBlbFtrZXldXG4gICAgICAgICAgICA6IGVsLmdldEF0dHJpYnV0ZSAmJiBlbC5nZXRBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChhdHRyID09IG51bGwpIHJldHVybjtcbiAgICAgIGF0dHIgPSBhdHRyICsgJyc7XG4gICAgICBpZiAoaSkge1xuICAgICAgICBhdHRyID0gYXR0ci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB2YWwgPSB2YWwudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvcChhdHRyLCB2YWwpO1xuICAgIH07XG4gIH0sXG4gICc6Zmlyc3QtY2hpbGQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhcHJldihlbCkgJiYgZWwucGFyZW50Tm9kZS5ub2RlVHlwZSA9PT0gMTtcbiAgfSxcbiAgJzpsYXN0LWNoaWxkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIW5leHQoZWwpICYmIGVsLnBhcmVudE5vZGUubm9kZVR5cGUgPT09IDE7XG4gIH0sXG4gICc6b25seS1jaGlsZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFwcmV2KGVsKSAmJiAhbmV4dChlbClcbiAgICAgICYmIGVsLnBhcmVudE5vZGUubm9kZVR5cGUgPT09IDE7XG4gIH0sXG4gICc6bnRoLWNoaWxkJzogZnVuY3Rpb24ocGFyYW0sIGxhc3QpIHtcbiAgICByZXR1cm4gbnRoKHBhcmFtLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sIGxhc3QpO1xuICB9LFxuICAnOm50aC1sYXN0LWNoaWxkJzogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gc2VsZWN0b3JzWyc6bnRoLWNoaWxkJ10ocGFyYW0sIHRydWUpO1xuICB9LFxuICAnOnJvb3QnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA9PT0gZWw7XG4gIH0sXG4gICc6ZW1wdHknOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhZWwuZmlyc3RDaGlsZDtcbiAgfSxcbiAgJzpub3QnOiBmdW5jdGlvbihzZWwpIHtcbiAgICB2YXIgdGVzdCA9IGNvbXBpbGVHcm91cChzZWwpO1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuICF0ZXN0KGVsKTtcbiAgICB9O1xuICB9LFxuICAnOmZpcnN0LW9mLXR5cGUnOiBmdW5jdGlvbihlbCkge1xuICAgIGlmIChlbC5wYXJlbnROb2RlLm5vZGVUeXBlICE9PSAxKSByZXR1cm47XG4gICAgdmFyIHR5cGUgPSBlbC5ub2RlTmFtZTtcbiAgICB3aGlsZSAoZWwgPSBwcmV2KGVsKSkge1xuICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSB0eXBlKSByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICAnOmxhc3Qtb2YtdHlwZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKGVsLnBhcmVudE5vZGUubm9kZVR5cGUgIT09IDEpIHJldHVybjtcbiAgICB2YXIgdHlwZSA9IGVsLm5vZGVOYW1lO1xuICAgIHdoaWxlIChlbCA9IG5leHQoZWwpKSB7XG4gICAgICBpZiAoZWwubm9kZU5hbWUgPT09IHR5cGUpIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gICc6b25seS1vZi10eXBlJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gc2VsZWN0b3JzWyc6Zmlyc3Qtb2YtdHlwZSddKGVsKVxuICAgICAgICAmJiBzZWxlY3RvcnNbJzpsYXN0LW9mLXR5cGUnXShlbCk7XG4gIH0sXG4gICc6bnRoLW9mLXR5cGUnOiBmdW5jdGlvbihwYXJhbSwgbGFzdCkge1xuICAgIHJldHVybiBudGgocGFyYW0sIGZ1bmN0aW9uKHJlbCwgZWwpIHtcbiAgICAgIHJldHVybiByZWwubm9kZU5hbWUgPT09IGVsLm5vZGVOYW1lO1xuICAgIH0sIGxhc3QpO1xuICB9LFxuICAnOm50aC1sYXN0LW9mLXR5cGUnOiBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBzZWxlY3RvcnNbJzpudGgtb2YtdHlwZSddKHBhcmFtLCB0cnVlKTtcbiAgfSxcbiAgJzpjaGVja2VkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gISEoZWwuY2hlY2tlZCB8fCBlbC5zZWxlY3RlZCk7XG4gIH0sXG4gICc6aW5kZXRlcm1pbmF0ZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFzZWxlY3RvcnNbJzpjaGVja2VkJ10oZWwpO1xuICB9LFxuICAnOmVuYWJsZWQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhZWwuZGlzYWJsZWQgJiYgZWwudHlwZSAhPT0gJ2hpZGRlbic7XG4gIH0sXG4gICc6ZGlzYWJsZWQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhIWVsLmRpc2FibGVkO1xuICB9LFxuICAnOnRhcmdldCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsLmlkID09PSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7XG4gIH0sXG4gICc6Zm9jdXMnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbCA9PT0gZWwub3duZXJEb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICB9LFxuICAnOm1hdGNoZXMnOiBmdW5jdGlvbihzZWwpIHtcbiAgICByZXR1cm4gY29tcGlsZUdyb3VwKHNlbCk7XG4gIH0sXG4gICc6bnRoLW1hdGNoJzogZnVuY3Rpb24ocGFyYW0sIGxhc3QpIHtcbiAgICB2YXIgYXJncyA9IHBhcmFtLnNwbGl0KC9cXHMqLFxccyovKVxuICAgICAgLCBhcmcgPSBhcmdzLnNoaWZ0KClcbiAgICAgICwgdGVzdCA9IGNvbXBpbGVHcm91cChhcmdzLmpvaW4oJywnKSk7XG5cbiAgICByZXR1cm4gbnRoKGFyZywgdGVzdCwgbGFzdCk7XG4gIH0sXG4gICc6bnRoLWxhc3QtbWF0Y2gnOiBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBzZWxlY3RvcnNbJzpudGgtbWF0Y2gnXShwYXJhbSwgdHJ1ZSk7XG4gIH0sXG4gICc6bGlua3MtaGVyZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsICsgJycgPT09IHdpbmRvdy5sb2NhdGlvbiArICcnO1xuICB9LFxuICAnOmxhbmcnOiBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgd2hpbGUgKGVsKSB7XG4gICAgICAgIGlmIChlbC5sYW5nKSByZXR1cm4gZWwubGFuZy5pbmRleE9mKHBhcmFtKSA9PT0gMDtcbiAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gICc6ZGlyJzogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHdoaWxlIChlbCkge1xuICAgICAgICBpZiAoZWwuZGlyKSByZXR1cm4gZWwuZGlyID09PSBwYXJhbTtcbiAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gICc6c2NvcGUnOiBmdW5jdGlvbihlbCwgY29uKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjb24gfHwgZWwub3duZXJEb2N1bWVudDtcbiAgICBpZiAoY29udGV4dC5ub2RlVHlwZSA9PT0gOSkge1xuICAgICAgcmV0dXJuIGVsID09PSBjb250ZXh0LmRvY3VtZW50RWxlbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIGVsID09PSBjb250ZXh0O1xuICB9LFxuICAnOmFueS1saW5rJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIGVsLmhyZWYgPT09ICdzdHJpbmcnO1xuICB9LFxuICAnOmxvY2FsLWxpbmsnOiBmdW5jdGlvbihlbCkge1xuICAgIGlmIChlbC5ub2RlTmFtZSkge1xuICAgICAgcmV0dXJuIGVsLmhyZWYgJiYgZWwuaG9zdCA9PT0gd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gICAgfVxuICAgIHZhciBwYXJhbSA9ICtlbCArIDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBpZiAoIWVsLmhyZWYpIHJldHVybjtcblxuICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbiArICcnXG4gICAgICAgICwgaHJlZiA9IGVsICsgJyc7XG5cbiAgICAgIHJldHVybiB0cnVuY2F0ZVVybCh1cmwsIHBhcmFtKSA9PT0gdHJ1bmNhdGVVcmwoaHJlZiwgcGFyYW0pO1xuICAgIH07XG4gIH0sXG4gICc6ZGVmYXVsdCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICEhZWwuZGVmYXVsdFNlbGVjdGVkO1xuICB9LFxuICAnOnZhbGlkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gZWwud2lsbFZhbGlkYXRlIHx8IChlbC52YWxpZGl0eSAmJiBlbC52YWxpZGl0eS52YWxpZCk7XG4gIH0sXG4gICc6aW52YWxpZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFzZWxlY3RvcnNbJzp2YWxpZCddKGVsKTtcbiAgfSxcbiAgJzppbi1yYW5nZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsLnZhbHVlID4gZWwubWluICYmIGVsLnZhbHVlIDw9IGVsLm1heDtcbiAgfSxcbiAgJzpvdXQtb2YtcmFuZ2UnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhc2VsZWN0b3JzWyc6aW4tcmFuZ2UnXShlbCk7XG4gIH0sXG4gICc6cmVxdWlyZWQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhIWVsLnJlcXVpcmVkO1xuICB9LFxuICAnOm9wdGlvbmFsJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIWVsLnJlcXVpcmVkO1xuICB9LFxuICAnOnJlYWQtb25seSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKGVsLnJlYWRPbmx5KSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnKVxuICAgICAgLCBwcm9wID0gZWwuY29udGVudEVkaXRhYmxlXG4gICAgICAsIG5hbWUgPSBlbC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgbmFtZSA9IG5hbWUgIT09ICdpbnB1dCcgJiYgbmFtZSAhPT0gJ3RleHRhcmVhJztcblxuICAgIHJldHVybiAobmFtZSB8fCBlbC5kaXNhYmxlZCkgJiYgYXR0ciA9PSBudWxsICYmIHByb3AgIT09ICd0cnVlJztcbiAgfSxcbiAgJzpyZWFkLXdyaXRlJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIXNlbGVjdG9yc1snOnJlYWQtb25seSddKGVsKTtcbiAgfSxcbiAgJzpob3Zlcic6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOmhvdmVyIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6YWN0aXZlJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6YWN0aXZlIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6bGluayc6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOmxpbmsgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzp2aXNpdGVkJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6dmlzaXRlZCBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOmNvbHVtbic6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOmNvbHVtbiBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOm50aC1jb2x1bW4nOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpudGgtY29sdW1uIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6bnRoLWxhc3QtY29sdW1uJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6bnRoLWxhc3QtY29sdW1uIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6Y3VycmVudCc6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOmN1cnJlbnQgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzpwYXN0JzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6cGFzdCBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOmZ1dHVyZSc6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOmZ1dHVyZSBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAvLyBOb24tc3RhbmRhcmQsIGZvciBjb21wYXRpYmlsaXR5IHB1cnBvc2VzLlxuICAnOmNvbnRhaW5zJzogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciB0ZXh0ID0gZWwuaW5uZXJUZXh0IHx8IGVsLnRleHRDb250ZW50IHx8IGVsLnZhbHVlIHx8ICcnO1xuICAgICAgcmV0dXJuICEhfnRleHQuaW5kZXhPZihwYXJhbSk7XG4gICAgfTtcbiAgfSxcbiAgJzpoYXMnOiBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuIHplc3QocGFyYW0sIGVsKS5sZW5ndGggPiAwO1xuICAgIH07XG4gIH1cbiAgLy8gUG90ZW50aWFsbHkgYWRkIG1vcmUgcHNldWRvIHNlbGVjdG9ycyBmb3JcbiAgLy8gY29tcGF0aWJpbGl0eSB3aXRoIHNpenpsZSBhbmQgbW9zdCBvdGhlclxuICAvLyBzZWxlY3RvciBlbmdpbmVzICg/KS5cbn07XG5cbi8qKlxuICogQXR0cmlidXRlIE9wZXJhdG9yc1xuICovXG5cbnZhciBvcGVyYXRvcnMgPSB7XG4gICctJzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gICc9JzogZnVuY3Rpb24oYXR0ciwgdmFsKSB7XG4gICAgcmV0dXJuIGF0dHIgPT09IHZhbDtcbiAgfSxcbiAgJyo9JzogZnVuY3Rpb24oYXR0ciwgdmFsKSB7XG4gICAgcmV0dXJuIGF0dHIuaW5kZXhPZih2YWwpICE9PSAtMTtcbiAgfSxcbiAgJ349JzogZnVuY3Rpb24oYXR0ciwgdmFsKSB7XG4gICAgdmFyIGkgPSBhdHRyLmluZGV4T2YodmFsKVxuICAgICAgLCBmXG4gICAgICAsIGw7XG5cbiAgICBpZiAoaSA9PT0gLTEpIHJldHVybjtcbiAgICBmID0gYXR0cltpIC0gMV07XG4gICAgbCA9IGF0dHJbaSArIHZhbC5sZW5ndGhdO1xuXG4gICAgcmV0dXJuICghZiB8fCBmID09PSAnICcpICYmICghbCB8fCBsID09PSAnICcpO1xuICB9LFxuICAnfD0nOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcbiAgICB2YXIgaSA9IGF0dHIuaW5kZXhPZih2YWwpXG4gICAgICAsIGw7XG5cbiAgICBpZiAoaSAhPT0gMCkgcmV0dXJuO1xuICAgIGwgPSBhdHRyW2kgKyB2YWwubGVuZ3RoXTtcblxuICAgIHJldHVybiBsID09PSAnLScgfHwgIWw7XG4gIH0sXG4gICdePSc6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuICAgIHJldHVybiBhdHRyLmluZGV4T2YodmFsKSA9PT0gMDtcbiAgfSxcbiAgJyQ9JzogZnVuY3Rpb24oYXR0ciwgdmFsKSB7XG4gICAgcmV0dXJuIGF0dHIuaW5kZXhPZih2YWwpICsgdmFsLmxlbmd0aCA9PT0gYXR0ci5sZW5ndGg7XG4gIH0sXG4gIC8vIG5vbi1zdGFuZGFyZFxuICAnIT0nOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcbiAgICByZXR1cm4gYXR0ciAhPT0gdmFsO1xuICB9XG59O1xuXG4vKipcbiAqIENvbWJpbmF0b3IgTG9naWNcbiAqL1xuXG52YXIgY29tYmluYXRvcnMgPSB7XG4gICcgJzogZnVuY3Rpb24odGVzdCkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgd2hpbGUgKGVsID0gZWwucGFyZW50Tm9kZSkge1xuICAgICAgICBpZiAodGVzdChlbCkpIHJldHVybiBlbDtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICAnPic6IGZ1bmN0aW9uKHRlc3QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiB0ZXN0KGVsID0gZWwucGFyZW50Tm9kZSkgJiYgZWw7XG4gICAgfTtcbiAgfSxcbiAgJysnOiBmdW5jdGlvbih0ZXN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gdGVzdChlbCA9IHByZXYoZWwpKSAmJiBlbDtcbiAgICB9O1xuICB9LFxuICAnfic6IGZ1bmN0aW9uKHRlc3QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHdoaWxlIChlbCA9IHByZXYoZWwpKSB7XG4gICAgICAgIGlmICh0ZXN0KGVsKSkgcmV0dXJuIGVsO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gICdub29wJzogZnVuY3Rpb24odGVzdCkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuIHRlc3QoZWwpICYmIGVsO1xuICAgIH07XG4gIH0sXG4gICdyZWYnOiBmdW5jdGlvbih0ZXN0LCBuYW1lKSB7XG4gICAgdmFyIG5vZGU7XG5cbiAgICBmdW5jdGlvbiByZWYoZWwpIHtcbiAgICAgIHZhciBkb2MgPSBlbC5vd25lckRvY3VtZW50XG4gICAgICAgICwgbm9kZXMgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKVxuICAgICAgICAsIGkgPSBub2Rlcy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAocmVmLnRlc3QoZWwpKSB7XG4gICAgICAgICAgbm9kZSA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbm9kZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmVmLmNvbWJpbmF0b3IgPSBmdW5jdGlvbihlbCkge1xuICAgICAgaWYgKCFub2RlIHx8ICFub2RlLmdldEF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgICB2YXIgYXR0ciA9IG5vZGUuZ2V0QXR0cmlidXRlKG5hbWUpIHx8ICcnO1xuICAgICAgaWYgKGF0dHJbMF0gPT09ICcjJykgYXR0ciA9IGF0dHIuc3Vic3RyaW5nKDEpO1xuXG4gICAgICBpZiAoYXR0ciA9PT0gZWwuaWQgJiYgdGVzdChub2RlKSkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlZjtcbiAgfVxufTtcblxuLyoqXG4gKiBHcmFtbWFyXG4gKi9cblxudmFyIHJ1bGVzID0ge1xuICBxbmFtZTogL14gKihbXFx3XFwtXSt8XFwqKS8sXG4gIHNpbXBsZTogL14oPzooWy4jXVtcXHdcXC1dKyl8cHNldWRvfGF0dHIpLyxcbiAgcmVmOiAvXiAqXFwvKFtcXHdcXC1dKylcXC8gKi8sXG4gIGNvbWJpbmF0b3I6IC9eKD86ICsoW14gXFx3Kl0pICt8KCApK3woW14gXFx3Kl0pKSg/ISAqJCkvLFxuICBhdHRyOiAvXlxcWyhbXFx3XFwtXSspKD86KFteXFx3XT89KShpbnNpZGUpKT9cXF0vLFxuICBwc2V1ZG86IC9eKDpbXFx3XFwtXSspKD86XFwoKGluc2lkZSlcXCkpPy8sXG4gIGluc2lkZTogLyg/OlwiKD86XFxcXFwifFteXCJdKSpcInwnKD86XFxcXCd8W14nXSkqJ3w8W15cIic+XSo+fFxcXFxbXCInPl18W15cIic+XSkqL1xufTtcblxucnVsZXMuaW5zaWRlID0gcmVwbGFjZShydWxlcy5pbnNpZGUsICdbXlwiXFwnPl0qJywgcnVsZXMuaW5zaWRlKTtcbnJ1bGVzLmF0dHIgPSByZXBsYWNlKHJ1bGVzLmF0dHIsICdpbnNpZGUnLCBtYWtlSW5zaWRlKCdcXFxcWycsICdcXFxcXScpKTtcbnJ1bGVzLnBzZXVkbyA9IHJlcGxhY2UocnVsZXMucHNldWRvLCAnaW5zaWRlJywgbWFrZUluc2lkZSgnXFxcXCgnLCAnXFxcXCknKSk7XG5ydWxlcy5zaW1wbGUgPSByZXBsYWNlKHJ1bGVzLnNpbXBsZSwgJ3BzZXVkbycsIHJ1bGVzLnBzZXVkbyk7XG5ydWxlcy5zaW1wbGUgPSByZXBsYWNlKHJ1bGVzLnNpbXBsZSwgJ2F0dHInLCBydWxlcy5hdHRyKTtcblxuLyoqXG4gKiBDb21waWxpbmdcbiAqL1xuXG52YXIgY29tcGlsZSA9IGZ1bmN0aW9uKHNlbCkge1xuICB2YXIgc2VsID0gc2VsLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxuICAgICwgdGVzdFxuICAgICwgZmlsdGVyID0gW11cbiAgICAsIGJ1ZmYgPSBbXVxuICAgICwgc3ViamVjdFxuICAgICwgcW5hbWVcbiAgICAsIGNhcFxuICAgICwgb3BcbiAgICAsIHJlZjtcblxuICB3aGlsZSAoc2VsKSB7XG4gICAgaWYgKGNhcCA9IHJ1bGVzLnFuYW1lLmV4ZWMoc2VsKSkge1xuICAgICAgc2VsID0gc2VsLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHFuYW1lID0gY2FwWzFdO1xuICAgICAgYnVmZi5wdXNoKHRvayhxbmFtZSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSBpZiAoY2FwID0gcnVsZXMuc2ltcGxlLmV4ZWMoc2VsKSkge1xuICAgICAgc2VsID0gc2VsLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHFuYW1lID0gJyonO1xuICAgICAgYnVmZi5wdXNoKHRvayhxbmFtZSwgdHJ1ZSkpO1xuICAgICAgYnVmZi5wdXNoKHRvayhjYXApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHNlbGVjdG9yLicpO1xuICAgIH1cblxuICAgIHdoaWxlIChjYXAgPSBydWxlcy5zaW1wbGUuZXhlYyhzZWwpKSB7XG4gICAgICBzZWwgPSBzZWwuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVmZi5wdXNoKHRvayhjYXApKTtcbiAgICB9XG5cbiAgICBpZiAoc2VsWzBdID09PSAnIScpIHtcbiAgICAgIHNlbCA9IHNlbC5zdWJzdHJpbmcoMSk7XG4gICAgICBzdWJqZWN0ID0gbWFrZVN1YmplY3QoKTtcbiAgICAgIHN1YmplY3QucW5hbWUgPSBxbmFtZTtcbiAgICAgIGJ1ZmYucHVzaChzdWJqZWN0LnNpbXBsZSk7XG4gICAgfVxuXG4gICAgaWYgKGNhcCA9IHJ1bGVzLnJlZi5leGVjKHNlbCkpIHtcbiAgICAgIHNlbCA9IHNlbC5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICByZWYgPSBjb21iaW5hdG9ycy5yZWYobWFrZVNpbXBsZShidWZmKSwgY2FwWzFdKTtcbiAgICAgIGZpbHRlci5wdXNoKHJlZi5jb21iaW5hdG9yKTtcbiAgICAgIGJ1ZmYgPSBbXTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChjYXAgPSBydWxlcy5jb21iaW5hdG9yLmV4ZWMoc2VsKSkge1xuICAgICAgc2VsID0gc2VsLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG9wID0gY2FwWzFdIHx8IGNhcFsyXSB8fCBjYXBbM107XG4gICAgICBpZiAob3AgPT09ICcsJykge1xuICAgICAgICBmaWx0ZXIucHVzaChjb21iaW5hdG9ycy5ub29wKG1ha2VTaW1wbGUoYnVmZikpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wID0gJ25vb3AnO1xuICAgIH1cblxuICAgIGZpbHRlci5wdXNoKGNvbWJpbmF0b3JzW29wXShtYWtlU2ltcGxlKGJ1ZmYpKSk7XG4gICAgYnVmZiA9IFtdO1xuICB9XG5cbiAgdGVzdCA9IG1ha2VUZXN0KGZpbHRlcik7XG4gIHRlc3QucW5hbWUgPSBxbmFtZTtcbiAgdGVzdC5zZWwgPSBzZWw7XG5cbiAgaWYgKHN1YmplY3QpIHtcbiAgICBzdWJqZWN0LmxuYW1lID0gdGVzdC5xbmFtZTtcblxuICAgIHN1YmplY3QudGVzdCA9IHRlc3Q7XG4gICAgc3ViamVjdC5xbmFtZSA9IHN1YmplY3QucW5hbWU7XG4gICAgc3ViamVjdC5zZWwgPSB0ZXN0LnNlbDtcbiAgICB0ZXN0ID0gc3ViamVjdDtcbiAgfVxuXG4gIGlmIChyZWYpIHtcbiAgICByZWYudGVzdCA9IHRlc3Q7XG4gICAgcmVmLnFuYW1lID0gdGVzdC5xbmFtZTtcbiAgICByZWYuc2VsID0gdGVzdC5zZWw7XG4gICAgdGVzdCA9IHJlZjtcbiAgfVxuXG4gIHJldHVybiB0ZXN0O1xufTtcblxudmFyIHRvayA9IGZ1bmN0aW9uKGNhcCwgcW5hbWUpIHtcbiAgLy8gcW5hbWVcbiAgaWYgKHFuYW1lKSB7XG4gICAgcmV0dXJuIGNhcCA9PT0gJyonXG4gICAgICA/IHNlbGVjdG9yc1snKiddXG4gICAgICA6IHNlbGVjdG9ycy50eXBlKGNhcCk7XG4gIH1cblxuICAvLyBjbGFzcy9pZFxuICBpZiAoY2FwWzFdKSB7XG4gICAgcmV0dXJuIGNhcFsxXVswXSA9PT0gJy4nXG4gICAgICA/IHNlbGVjdG9ycy5hdHRyKCdjbGFzcycsICd+PScsIGNhcFsxXS5zdWJzdHJpbmcoMSkpXG4gICAgICA6IHNlbGVjdG9ycy5hdHRyKCdpZCcsICc9JywgY2FwWzFdLnN1YnN0cmluZygxKSk7XG4gIH1cblxuICAvLyBwc2V1ZG8tbmFtZVxuICAvLyBpbnNpZGUtcHNldWRvXG4gIGlmIChjYXBbMl0pIHtcbiAgICByZXR1cm4gY2FwWzNdXG4gICAgICA/IHNlbGVjdG9yc1tjYXBbMl1dKHVucXVvdGUoY2FwWzNdKSlcbiAgICAgIDogc2VsZWN0b3JzW2NhcFsyXV07XG4gIH1cblxuICAvLyBhdHRyIG5hbWVcbiAgLy8gYXR0ciBvcFxuICAvLyBhdHRyIHZhbHVlXG4gIGlmIChjYXBbNF0pIHtcbiAgICB2YXIgaTtcbiAgICBpZiAoY2FwWzZdKSB7XG4gICAgICBpID0gY2FwWzZdLmxlbmd0aDtcbiAgICAgIGNhcFs2XSA9IGNhcFs2XS5yZXBsYWNlKC8gK2kkLywgJycpO1xuICAgICAgaSA9IGkgPiBjYXBbNl0ubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0b3JzLmF0dHIoY2FwWzRdLCBjYXBbNV0gfHwgJy0nLCB1bnF1b3RlKGNhcFs2XSksIGkpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIFNlbGVjdG9yLicpO1xufTtcblxudmFyIG1ha2VTaW1wbGUgPSBmdW5jdGlvbihmdW5jKSB7XG4gIHZhciBsID0gZnVuYy5sZW5ndGhcbiAgICAsIGk7XG5cbiAgLy8gUG90ZW50aWFsbHkgbWFrZSBzdXJlXG4gIC8vIGBlbGAgaXMgdHJ1dGh5LlxuICBpZiAobCA8IDIpIHJldHVybiBmdW5jWzBdO1xuXG4gIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgIGlmICghZWwpIHJldHVybjtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoIWZ1bmNbaV0oZWwpKSByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufTtcblxudmFyIG1ha2VUZXN0ID0gZnVuY3Rpb24oZnVuYykge1xuICBpZiAoZnVuYy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gISFmdW5jWzBdKGVsKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgIHZhciBpID0gZnVuYy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKCEoZWwgPSBmdW5jW2ldKGVsKSkpIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG59O1xuXG52YXIgbWFrZVN1YmplY3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHRhcmdldDtcblxuICBmdW5jdGlvbiBzdWJqZWN0KGVsKSB7XG4gICAgdmFyIG5vZGUgPSBlbC5vd25lckRvY3VtZW50XG4gICAgICAsIHNjb3BlID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShzdWJqZWN0LmxuYW1lKVxuICAgICAgLCBpID0gc2NvcGUubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKHN1YmplY3QudGVzdChzY29wZVtpXSkgJiYgdGFyZ2V0ID09PSBlbCkge1xuICAgICAgICB0YXJnZXQgPSBudWxsO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0YXJnZXQgPSBudWxsO1xuICB9XG5cbiAgc3ViamVjdC5zaW1wbGUgPSBmdW5jdGlvbihlbCkge1xuICAgIHRhcmdldCA9IGVsO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHJldHVybiBzdWJqZWN0O1xufTtcblxudmFyIGNvbXBpbGVHcm91cCA9IGZ1bmN0aW9uKHNlbCkge1xuICB2YXIgdGVzdCA9IGNvbXBpbGUoc2VsKVxuICAgICwgdGVzdHMgPSBbIHRlc3QgXTtcblxuICB3aGlsZSAodGVzdC5zZWwpIHtcbiAgICB0ZXN0ID0gY29tcGlsZSh0ZXN0LnNlbCk7XG4gICAgdGVzdHMucHVzaCh0ZXN0KTtcbiAgfVxuXG4gIGlmICh0ZXN0cy5sZW5ndGggPCAyKSByZXR1cm4gdGVzdDtcblxuICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgbCA9IHRlc3RzLmxlbmd0aFxuICAgICAgLCBpID0gMDtcblxuICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAodGVzdHNbaV0oZWwpKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG59O1xuXG4vKipcbiAqIFNlbGVjdGlvblxuICovXG5cbnZhciBmaW5kID0gZnVuY3Rpb24oc2VsLCBub2RlKSB7XG4gIHZhciByZXN1bHRzID0gW11cbiAgICAsIHRlc3QgPSBjb21waWxlKHNlbClcbiAgICAsIHNjb3BlID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0ZXN0LnFuYW1lKVxuICAgICwgaSA9IDBcbiAgICAsIGVsO1xuXG4gIHdoaWxlIChlbCA9IHNjb3BlW2krK10pIHtcbiAgICBpZiAodGVzdChlbCkpIHJlc3VsdHMucHVzaChlbCk7XG4gIH1cblxuICBpZiAodGVzdC5zZWwpIHtcbiAgICB3aGlsZSAodGVzdC5zZWwpIHtcbiAgICAgIHRlc3QgPSBjb21waWxlKHRlc3Quc2VsKTtcbiAgICAgIHNjb3BlID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0ZXN0LnFuYW1lKTtcbiAgICAgIGkgPSAwO1xuICAgICAgd2hpbGUgKGVsID0gc2NvcGVbaSsrXSkge1xuICAgICAgICBpZiAodGVzdChlbCkgJiYgIX5pbmRleE9mLmNhbGwocmVzdWx0cywgZWwpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHRzLnNvcnQob3JkZXIpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vKipcbiAqIE5hdGl2ZVxuICovXG5cbnZhciBzZWxlY3QgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBzbGljZSA9IChmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3plc3QnKSk7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZSA9IG51bGw7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhID0gW10sIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSBhLnB1c2godGhpc1tpXSk7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfTtcbiAgICB9XG4gIH0pKCk7XG5cbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc2VsLCBub2RlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gc2xpY2UuY2FsbChub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsKSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZpbmQoc2VsLCBub2RlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHNlbCwgbm9kZSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoc2VsWzBdID09PSAnIycgJiYgL14jW1xcd1xcLV0rJC8udGVzdChzZWwpKSB7XG4gICAgICAgIHJldHVybiBbbm9kZS5nZXRFbGVtZW50QnlJZChzZWwuc3Vic3RyaW5nKDEpKV07XG4gICAgICB9XG4gICAgICBpZiAoc2VsWzBdID09PSAnLicgJiYgL15cXC5bXFx3XFwtXSskLy50ZXN0KHNlbCkpIHtcbiAgICAgICAgc2VsID0gbm9kZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNlbC5zdWJzdHJpbmcoMSkpO1xuICAgICAgICByZXR1cm4gc2xpY2UuY2FsbChzZWwpO1xuICAgICAgfVxuICAgICAgaWYgKC9eW1xcd1xcLV0rJC8udGVzdChzZWwpKSB7XG4gICAgICAgIHJldHVybiBzbGljZS5jYWxsKG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsKSk7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICA7XG4gICAgfVxuICAgIHJldHVybiBmaW5kKHNlbCwgbm9kZSk7XG4gIH07XG59KSgpO1xuXG4vKipcbiAqIFplc3RcbiAqL1xuXG52YXIgemVzdCA9IGZ1bmN0aW9uKHNlbCwgbm9kZSkge1xuICB0cnkge1xuICAgIHNlbCA9IHNlbGVjdChzZWwsIG5vZGUgfHwgZG9jdW1lbnQpO1xuICB9IGNhdGNoKGUpIHtcbiAgICBpZiAod2luZG93LlpFU1RfREVCVUcpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2sgfHwgZSArICcnKTtcbiAgICB9XG4gICAgc2VsID0gW107XG4gIH1cbiAgcmV0dXJuIHNlbDtcbn07XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cblxuemVzdC5zZWxlY3RvcnMgPSBzZWxlY3RvcnM7XG56ZXN0Lm9wZXJhdG9ycyA9IG9wZXJhdG9ycztcbnplc3QuY29tYmluYXRvcnMgPSBjb21iaW5hdG9ycztcbnplc3QuY29tcGlsZSA9IGNvbXBpbGVHcm91cDtcblxuemVzdC5tYXRjaGVzID0gZnVuY3Rpb24oZWwsIHNlbCkge1xuICByZXR1cm4gISFjb21waWxlR3JvdXAoc2VsKShlbCk7XG59O1xuXG56ZXN0LmNhY2hlID0gZnVuY3Rpb24oKSB7XG4gIGlmIChjb21waWxlLnJhdykgcmV0dXJuO1xuXG4gIHZhciByYXcgPSBjb21waWxlXG4gICAgLCBjYWNoZSA9IHt9O1xuXG4gIGNvbXBpbGUgPSBmdW5jdGlvbihzZWwpIHtcbiAgICByZXR1cm4gY2FjaGVbc2VsXVxuICAgICAgfHwgKGNhY2hlW3NlbF0gPSByYXcoc2VsKSk7XG4gIH07XG5cbiAgY29tcGlsZS5yYXcgPSByYXc7XG4gIHplc3QuX2NhY2hlID0gY2FjaGU7XG59O1xuXG56ZXN0Lm5vQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFjb21waWxlLnJhdykgcmV0dXJuO1xuICBjb21waWxlID0gY29tcGlsZS5yYXc7XG4gIGRlbGV0ZSB6ZXN0Ll9jYWNoZTtcbn07XG5cbnplc3Qubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICB3aW5kb3cuemVzdCA9IG9sZDtcbiAgcmV0dXJuIHplc3Q7XG59O1xuXG56ZXN0Lm5vTmF0aXZlID0gZnVuY3Rpb24oKSB7XG4gIHNlbGVjdCA9IGZpbmQ7XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB6ZXN0O1xufSBlbHNlIHtcbiAgdGhpcy56ZXN0ID0gemVzdDtcbn1cblxuaWYgKHdpbmRvdy5aRVNUX0RFQlVHKSB7XG4gIHplc3Qubm9OYXRpdmUoKTtcbn0gZWxzZSB7XG4gIHplc3QuY2FjaGUoKTtcbn1cblxufSkuY2FsbChmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogZ2xvYmFsKTtcbn0oKSk7XG4iLCJ2YXIgcGVyZm5vdyAgICAgPSByZXF1aXJlKFwidXRpbC9wZXJmbm93XCIpLFxuICAgIFBhZ2VWaWV3ICAgID0gcmVxdWlyZShcIi4uL3ZpZXcvcGFnZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYWdlKGNvbnRhaW5lcikge1xuICBjb25zb2xlLmxvZyhcIkluaXRpYWxpemluZyBwYWdlRmFjdG9yeVwiLFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpXG4gIFxuICByZXR1cm4ge1xuICAgIHZpZXc6bnVsbCxcbiAgICBzdGFydDpmdW5jdGlvbigpe1xuICAgICAgdGhpcy52aWV3ID0gbmV3IFBhZ2VWaWV3KHtcbiAgICAgICAgZWw6IFwiI3BhZ2VcIixcbiAgICAgICAgdGVtcGxhdGU6IGNvbnRhaW5lci50ZW1wbGF0ZSxcbiAgICAgICAgbW9kZWw6IGNvbnRhaW5lci5jb25maWcuYWJvdXRcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbG9hZFBhZ2U6IGZ1bmN0aW9uKHBhZ2Usc3VicGFnZSkge1xuICAgICAgdGhpcy52aWV3LnJlbmRlcihwYWdlLHN1YnBhZ2UpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlxcdFwiLCBcInBhZ2VGYWN0b3J5IERlc3Ryb3llZFwiKTtcbiAgICB9XG4gIH1cbn07XG4iLCJ2YXIgaGFuZGxlYmFycyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIiksXG4gICAgbGF5b3V0cyAgICA9IHJlcXVpcmUoXCJoYW5kbGViYXJzLWxheW91dHNcIiksXG4gICAgX3RlbXBsYXRlcyA9IHJlcXVpcmUoXCIuLi90ZW1wbGF0ZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb250YWluZXIpe1xuICAgIC8vSW5zdGFudGlhdGUgdGVtcGxhdGVzIGJ5IGluamVjdGluZyBoYW5kbGViYXJzXG4gICAgdmFyIHRlbXBsYXRlcyA9IF90ZW1wbGF0ZXMoaGFuZGxlYmFycyk7XG5cbiAgICAvL1JlZ2lzdGVyIGxheW91dHMgaGVscGVyXG4gICAgaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihsYXlvdXRzKGhhbmRsZWJhcnMpKTtcblxuICAgIC8vUmVnaXN0ZXIgbGF5b3V0IHBhcnRpYWxcbiAgICBoYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCgnbGF5b3V0JywgdGVtcGxhdGVzWydsYXlvdXQnXSk7XG5cbiAgICAvL3JldHVybiB0ZW1wbGF0ZXM7XG4gICAgcmV0dXJuIHRlbXBsYXRlcztcbn1cbiIsIndpbmRvdy4kICAgICAgICAgID0gcmVxdWlyZShcInplc3RcIik7XG5cbnZhciBwZXJmbm93ID0gcmVxdWlyZSgndXRpbC9wZXJmbm93JyksXG4gICAgc3dhcENTUyA9IHJlcXVpcmUoJ3V0aWwvc3dhcGNzcycpLFxuICAgIGZsdXhib3R0bGUgPSByZXF1aXJlKCdmbHV4Ym90dGxlJyksXG4gICAgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnL2FwcCcpLFxuICAgIGNvbnRlbnQgPSAoe1wic2VydmljZVwiOih7XCJjb25maWdcIjpyZXF1aXJlKFwiLi9zZXJ2aWNlL2NvbmZpZy5qc1wiKSxcInJvdXRlclwiOnJlcXVpcmUoXCIuL3NlcnZpY2Uvcm91dGVyLmpzXCIpfSksXCJmYWN0b3J5XCI6KHtcInBhZ2VcIjpyZXF1aXJlKFwiLi9mYWN0b3J5L3BhZ2UuanNcIiksXCJ0ZW1wbGF0ZVwiOnJlcXVpcmUoXCIuL2ZhY3RvcnkvdGVtcGxhdGUuanNcIil9KX0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuLyoqXG4gKiBDb3JlIGZvciB5b3VyIGFwcGxpY2F0aW9uIHRoYXQgZ2V0cyBib3R0bGVkIGludG8gYSBmYWN0b3J5LlxuICogQWxsIHlvdXIgc2VydmljZXMsIGZhY3RvcmllcyBhbmQgc3VjaCB3aWxsIGJlIGJvdHRsZWQgYmVmb3JlaGFuZCBhbmRcbiAqIGFyZSBhY2Nlc2libGUgZnJvbSBgY29udGFpbmVyYC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250YWluZXIgQSBCb3R0bGVKUyBjb250YWluZXJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHNlcnZpY2UgQSBzZXJ2aWNlIHRvIGV4cG9zZVxuICovXG52YXIgQXBwbGljYXRpb24gPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgXG4gIGxldCByb3V0ZUhhbmRsZXIgPSAob3B0aW9ucykgPT5cbiAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucGFnZS5sb2FkUGFnZShvcHRpb25zLnBhZ2Usb3B0aW9ucy5zdWJwYWdlKTtcbiAgICBcbiAgY29udGFpbmVyLnJvdXRlci5hZGQoXCJ7cGFnZX0ve3N1YnBhZ2V9XCIsIHJvdXRlSGFuZGxlciApO1xuICBjb250YWluZXIucm91dGVyLmFkZChcIntwYWdlfVwiLCAgICAgICAgICAgcm91dGVIYW5kbGVyICk7XG4gIFxuICBcbiAgcmV0dXJuIHtcbiAgICBmYWRlSW46IGZ1bmN0aW9uKGR1cmF0aW9uLHN0ZXBzKXtcbiAgICAgIFxuICAgIGxldCBodG1sID0gJChcImh0bWxcIilbMF0sXG4gICAgICAgIG9wYWNpdHkgPSAwLFxuICAgICAgICBsaWZ0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBvcGFjaXR5ICs9IDEvc3RlcHM7XG4gICAgICAgICAgXG4gICAgICAgICAgaHRtbC5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eS50b1N0cmluZygpO1xuICAgICAgXG4gICAgICAgICAgaWYgKG9wYWNpdHkgPCAxKVxuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQobGlmdCwxMClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZpbmlzaFwiKVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICBodG1sLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgIGh0bWwuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBcbiAgICBcbiAgICB3aW5kb3cuc2V0VGltZW91dChsaWZ0LGR1cmF0aW9uL3N0ZXBzKVxuICAgIH0sXG4gICAgc3RhcnQ6ICAgIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiXFx0XCIsXCJBcHBsaWNhdGlvbiBTdGFydGVkXCIsIFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpO1xuICAgIFxuICAgIGNvbnRhaW5lci5zdHlsZSA9IHN3YXBDU1MoJChcIiN0aGVtZVwiKVswXSk7XG4gICAgXG4gICAgJChcIiN0aGVtZXNlbGVjdFwiKVswXS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsKGUpID0+IHtcbiAgICAgIGxldCB1cmkgPSBcImh0dHBzOi8vamVuaWwuZ2l0aHViLmlvL2J1bG1hc3dhdGNoL1wiK2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNyY0VsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbHVlK1wiL2J1bG1hc3dhdGNoLm1pbi5jc3NcIjtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5zd2FwKHVyaSk7XG4gICAgfSlcbiAgXG4gICAgY29udGFpbmVyLnBhZ2Uuc3RhcnQoKTtcbiAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGUpID0+IGNvbnRhaW5lci5yb3V0ZXIucnVuKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSBcIlwiKVxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBcImhvbWVcIlxuICAgIFxuICAgIGNvbnRhaW5lci5yb3V0ZXIucnVuKCk7XG4gICAgXG4gICAgdGhpcy5mYWRlSW4oNzUwLDEwKTtcbiAgICBcbiAgICB9XG4gIH1cbn07XG5cbndpbmRvdy5hcHAgPSBmbHV4Ym90dGxlLnNldHVwKEFwcGxpY2F0aW9uLGNvbmZpZyxjb250ZW50KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjtcbiIsInZhciBhcHBjb25maWcgPSByZXF1aXJlKFwiLi4vLi4vY29uZmlnL2FwcFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb25maWcoKXtcbiAgcmV0dXJuIGFwcGNvbmZpZztcbn07XG4iLCJ2YXIgcGVyZm5vdyAgPSByZXF1aXJlKFwidXRpbC9wZXJmbm93XCIpLFxuICAgIExpZ2h0cm91dGVyID0gcmVxdWlyZShcImxpZ2h0cm91dGVyXCIpO1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByb3V0ZXIoKSB7XG5cbiAgY29uc29sZS5sb2coXCJJbml0aWFsaXppbmcgUm91dGVyTW9kdWxlXCIsIFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpXG4gIFxuICB2YXIgcm91dGVyID0gbmV3IExpZ2h0cm91dGVyKHtcblx0ICB0eXBlOiAnaGFzaCcsICAgICAgICAgICAgIC8vIERlZmF1bHQgcm91dGluZyB0eXBlXG5cdCAgcGF0aFJvb3Q6ICdmbHV4YnVpbGQnLCAgLy8gQmFzZSBwYXRoIGZvciB5b3VyIGFwcFxuICB9KTtcbiBcbiAgcmV0dXJuIHJvdXRlcjtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChIYW5kbGViYXJzKXt2YXIgY29udGFpbmVyID0ge307IGNvbnRhaW5lcltcImFib3V0XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5BYm91dDwvaDI+XFxuIFxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICAgICAgPGgyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+QXV0aG9yPC9oMj5cXG4gICAgICA8cCBjbGFzcz1cXFwiYm94XFxcIj5cXG4gICAgICAgIEZsdXhidWlsZCBpcyB3cml0dGVuIGJ5IDxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9GbHViYmV4XFxcIj5GbHViYmV4LjwvYT5cXG4gICAgICA8L3A+XFxuICAgIDwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkaXNjXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICA8aDEgY2xhc3M9XFxcInRpdGxlXFxcIj5EaXNjPC9oMT5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGVtYmVkIHNyYz1cXFwiY29udGVudC9kaXNjL2luZGV4Lmh0bWxcXFwiIFxcbiAgICAgICAgICAgY2xhc3M9XFxcIm5vLW1hcmdpblxcXCIgXFxuICAgICAgICAgICBzdHlsZT1cXFwiaGVpZ2h0OjkwJTt3aWR0aDoxMDAlXFxcIj48L2VtYmVkPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcImhvbWVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiPGgxIGNsYXNzPVxcXCJ0aXRsZVxcXCI+Rmx1eGJ1aWxkPC9oMT5cXG48aDEgY2xhc3M9XFxcInN1YnRpdGxlXFxcIj5cXG4gICAgICAgIEVtYmVyLWluc3BpcmVkIGJ1aWxkIHRvb2wgd3JpdHRlbiBpbiBOb2RlLmpzXFxuICA8c3BhbiBjbGFzcz1cXFwiZmFkZS1pbi1mcm9tLXRvcCBhbmltLWRlbGF5LS0xMFxcXCI+XFxuICAgICAgICAgIGZvciBjcmVhdGluZyBmYXN0LFxcbiAgPC9zcGFuPlxcbiAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMTVcXFwiPmxpZ2h0d2VpZ2h0LDwvc3Bhbj5cXG4gIDxzcGFuIGNsYXNzPVxcXCJmYWRlLWluLWZyb20tdG9wIGFuaW0tZGVsYXktLTIwXFxcIj51bmNvdXBsZWQsPC9zcGFuPlxcbiAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMjVcXFwiPmZ1bGwtc2NhbGUgYXBwbGljYXRpb25zIC0gPC9zcGFuPlxcbiAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMzVcXFwiPnRoYXQgd29yayBhbnl3aGVyZSA8L3NwYW4+XFxuPC9oMT5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCI8c2VjdGlvbiBjbGFzcz1cXFwic2VjdGlvblxcXCI+XFxuICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWFuY2VzdG9yXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwidGlsZSBpcy1wYXJlbnQgaXMtdmVydGljYWxcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcInRpbGUgaXMtY2hpbGQgYm94XFxcIj5cXG4gICAgPGgyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+R3VscCA0PC9oMiBjbGFzcz1cXFwidGl0bGVcXFwiPlxcbiAgICA8cD5cXG4gICAgICAgICAgZ3VscCBpcyBhIHRvb2xraXQgZm9yIGF1dG9tYXRpbmcgcGFpbmZ1bCBvciB0aW1lLWNvbnN1bWluZyB0YXNrcyBpbiB5b3VyIGRldmVsb3BtZW50IHdvcmtmbG93LCBzbyB5b3UgY2FuIHN0b3AgbWVzc2luZyBhcm91bmQgYW5kIGJ1aWxkIHNvbWV0aGluZy5cXG4gICAgICA8L3A+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwidGlsZSBpcy1jaGlsZCBib3hcXFwiPlxcbiAgICAgICAgPGgyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+QnJvd3NlcmlmeTwvaDIgY2xhc3M9XFxcInRpdGxlXFxcIj5cXG4gICAgICAgIDxwPlxcbiAgICAgICAgICBCcm93c2VycyBkb24ndCBoYXZlIHRoZSByZXF1aXJlIG1ldGhvZCBkZWZpbmVkLCBidXQgTm9kZS5qcyBkb2VzLiBXaXRoIEJyb3dzZXJpZnkgeW91IGNhbiB3cml0ZSBjb2RlIHRoYXQgdXNlcyByZXF1aXJlIGluIHRoZSBzYW1lIHdheSB0aGF0IHlvdSB3b3VsZCB1c2UgaXQgaW4gTm9kZS5cXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWNoaWxkIGJveFxcXCI+XFxuICAgICAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5Cb3R0bGUuanM8L2gyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICBCb3R0bGVKUyBpcyBhIHRpbnksIHBvd2VyZnVsIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGNvbnRhaW5lci4gSXQgZmVhdHVyZXMgbGF6eSBsb2FkaW5nLCBtaWRkbGV3YXJlIGhvb2tzLCBkZWNvcmF0b3JzIGFuZCBhIGNsZWFuIGFwaSBpbnNwaXJlZCBieSB0aGUgQW5ndWxhckpTIE1vZHVsZSBBUEkgYW5kIHRoZSBzaW1wbGUgUEhQIGxpYnJhcnkgUGltcGxlLiBcXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIDxkaXYgY2xhc3M9XFxcInRpbGUgaXMtcGFyZW50IGlzLXZlcnRpY2FsXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWNoaWxkIGJveFxcXCI+XFxuICAgICAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5IYW5kbGViYXJzPC9oMiBjbGFzcz1cXFwidGl0bGVcXFwiPlxcbiAgICAgICAgPHA+XFxuICAgICAgICAgIEhhbmRsZWJhcnMgcHJvdmlkZXMgdGhlIHBvd2VyIG5lY2Vzc2FyeSB0byBsZXQgeW91IGJ1aWxkIHNlbWFudGljIHRlbXBsYXRlcyBlZmZlY3RpdmVseSB3aXRoIG5vIGZydXN0cmF0aW9uLlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcInRpbGUgaXMtY2hpbGQgYm94XFxcIj5cXG4gICAgICAgIDxoMiBjbGFzcz1cXFwidGl0bGVcXFwiPkJ1bG1hIENTUzwvaDIgY2xhc3M9XFxcInRpdGxlXFxcIj5cXG4gICAgICAgIDxwPlxcbiAgICAgICAgICBCdWxtYSBpcyBhIGZyZWUgYW5kIG9wZW4gc291cmNlIENTUyBmcmFtZXdvcmsgYmFzZWQgb24gRmxleGJveC5cXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJ0aWxlIGlzLWNoaWxkIGJveFxcXCI+XFxuICAgICAgICA8aDIgY2xhc3M9XFxcInRpdGxlXFxcIj5GbHV4YnVpbGQ8L2gyIGNsYXNzPVxcXCJ0aXRsZVxcXCI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICAgQnVpbGQgYmxhemluZ2x5LWZhc3QgYXBwbGljYXRpb25zIHVzaW5nIGFsbCBvZiB0aGUgYWJvdmUsIHdpdGggcHJlbWFkZSBndWxwIHRhc2tzIGZvciBhdXRvbWF0ZWQgdGVzdGluZywgZG9jdW1lbnRhdGlvbix0ZW1wbGF0aW5nIGFuZCBtb3JlLiBDb25maWd1cmFibGUgdG8gZml0IHlvdXIgZmF2b3JpdGUgd29ya2Zsb3cgd2l0aG91dCBnZXR0aW5nIGluIHlvdXIgd2F5LlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2Plxcbjwvc2VjdGlvbj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgICBcIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuY29udGFpbmVyW1wibGF5b3V0XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCIgIDxzZWN0aW9uIGNsYXNzPVxcXCJoZXJvIGlzLXByaW1hcnlcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJoZXJvLWJvZHlcXFwiPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmJsb2NrIHx8IChkZXB0aDAgJiYgZGVwdGgwLmJsb2NrKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwiaGVhZGVyXCIse1wibmFtZVwiOlwiYmxvY2tcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICAgIDwvZGl2PlxcbiAgPC9zZWN0aW9uPlxcblxcbiAgPGRpdiBjbGFzcz1cXFwiY29udGFpbmVyXFxcIiBpZD1cXFwicGFnZVxcXCI+XFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuYmxvY2sgfHwgKGRlcHRoMCAmJiBkZXB0aDAuYmxvY2spIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJwYWdlXCIse1wibmFtZVwiOlwiYmxvY2tcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiICA8L2Rpdj5cXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCJcIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgICBDb250ZW50XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5ibG9jayB8fCAoZGVwdGgwICYmIGRlcHRoMC5ibG9jaykgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJmdWxscGFnZVwiLHtcIm5hbWVcIjpcImJsb2NrXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIiAgXCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcInNpZGViYXJcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIjxhc2lkZSBjbGFzcz1cXFwibWVudVxcXCI+XFxuICA8c2VjdGlvbiBjbGFzcz1cXFwiaGVybyBpcy1pbmZvXFxcIj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiaGVyby1ib2R5XFxcIj5cXG4gICAgICA8aW1nIHNyYz1cXFwiaW1hZ2VzL2xvZ28ucG5nXFxcIiBzdHlsZT1cXFwid2lkdGg6NzVweDtoZWlnaHQ6YXV0bztcXFwiLz5cXG4gICAgPC9kaXY+XFxuICA8L3NlY3Rpb24+XFxuICBcXG4gIDxwIGNsYXNzPVxcXCJtZW51LWxhYmVsXFxcIj5cXG4gICAgR2VuZXJhbFxcbiAgPC9wPlxcbiAgPHVsIGNsYXNzPVxcXCJtZW51LWxpc3RcXFwiPlxcbiAgICA8bGk+PGE+SG9tZTwvYT48L2xpPlxcbiAgICA8bGk+PGE+QWJvdXQ8L2E+PC9saT5cXG4gICAgPGxpPjxhPkRpc2M8L2E+PC9saT5cXG4gIDwvdWw+XFxuICA8cCBjbGFzcz1cXFwibWVudS1sYWJlbFxcXCI+XFxuICAgIERvY3VtZW50YXRpb25cXG4gIDwvcD5cXG4gIDx1bCBjbGFzcz1cXFwibWVudS1saXN0XFxcIj5cXG4gICAgPGxpPjxhPlByb2plY3QgU3RydWN0dXJlPC9hPjwvbGk+XFxuICAgIDxsaT48YT5HdWxwIFRhc2tzPC9hPjwvbGk+XFxuICAgIDxsaT48YT5IYW5kbGViYXJzPC9hPjwvbGk+XFxuICAgIDxsaT48YT5Xb3JrZmxvdzwvYT48L2xpPlxcbiAgICA8bGk+PGE+QnVsbWEgQ1NTPC9hPjwvbGk+XFxuICAgIDxsaT48YT5FeHRlcm5hbCBEb2N1bWVudGF0aW9uPC9hPjwvbGk+XFxuICA8L3VsPlxcbjwvYXNpZGU+XCI7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl0gPSBjb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdIHx8IHt9O1xuY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXVtcImJ1bG1hXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8ZGl2IGNsYXNzPVxcXCJnLS0xMCBtLS0xIG5vLW1hcmdpblxcXCI+XFxuICAgICAgPGgyIGNsYXNzPVxcXCJtLS0xIGZhZGUtaW4tZnJvbS10b3AgY29sb3ItLXBhcGVyXFxcIj5TdXJmYWNlIENTUyBSZWZlcmVuY2U8L2gyPlxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGgyPkNvbWluZyBTb29uPC9oMj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJkb2N1bWVudGF0aW9uXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8ZGl2IGNsYXNzPVxcXCJnLS0xMCBtLS0xIG5vLW1hcmdpblxcXCI+XFxuICAgICAgPGgyIGNsYXNzPVxcXCJtLS0xIGZhZGUtaW4tZnJvbS10b3AgY29sb3ItLXBhcGVyXFxcIj5HZW5lcmF0aW5nIERvY3VtZW50YXRpb248L2gyPlxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGgyPkNvbWluZyBTb29uPC9oMj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJleHRlcm5hbFwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbiAgcmV0dXJuIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwiaGVhZGVyXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJwYWdlXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGRpdiBjbGFzcz1cXFwiZy0tMTAgbS0tMSBuby1tYXJnaW5cXFwiPlxcbiAgICAgIDxoMiBjbGFzcz1cXFwibS0tMSBmYWRlLWluLWZyb20tdG9wIGNvbG9yLS1wYXBlclxcXCI+RXh0ZXJuYWwgSW5mb3JtYXRpb248L2gyPlxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGRpdiBjbGFzcz1cXFwiY29udGFpbmVyIGNvbnRhaW5lci0td3JhcFxcXCI+XFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+QmFja2JvbmU8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2JhY2tib25lanMub3JnL1xcXCI+T2ZmaWNpYWwgd2Vic2l0ZTwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkIG5vLW1hcmdpbi12ZXJ0aWNhbCBnLS0zIGctbS0tNCBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5kb2MuanM8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2RvY3VtZW50YXRpb24uanMub3JnL1xcXCI+b2ZmaWNpYWwgd2Vic2l0ZTwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly9naXRodWIuY29tL2RvY3VtZW50YXRpb25qcy9kb2N1bWVudGF0aW9uL2Jsb2IvbWFzdGVyL2RvY3MvR0VUVElOR19TVEFSVEVELm1kXFxcIj5Eb2N1bWVudGF0aW9uPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPnNjYWxlQXBwPC9oMj5cXG4gICAgICAgIDx1bD5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHA6Ly9zY2FsZWFwcC5vcmcvXFxcIj5vZmZpY2lhbCB3ZWJzaXRlPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTIgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+WmVzdDwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL2dpdGh1Yi5jb20vY2hqai96ZXN0XFxcIj5HaXRodWI8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3plc3RcXFwiPk5QTSBQYWNrYWdlPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPkJyb3dzZXJpZnk8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2Jyb3dzZXJpZnkub3JnL1xcXCI+T2ZmaWNpYWwgU2l0ZTwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly9naXRodWIuY29tL3N1YnN0YWNrL25vZGUtYnJvd3NlcmlmeSN1c2FnZVxcXCI+RG9jdW1lbnRhdGlvbjwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkIG5vLW1hcmdpbi12ZXJ0aWNhbCBnLS0zIGctbS0tNCBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5BdG9tLmpzPC9oMj5cXG4gICAgICAgIDx1bD5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2F0b20tanNcXFwiPk5QTSBQYWNrYWdlPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPkd1bHA8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2d1bHBqcy5jb20vXFxcIj5PZmZpY2lhbCB3ZWJzaXRlPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL2dpdGh1Yi5jb20vZ3VscGpzL2d1bHAvdHJlZS9tYXN0ZXIvZG9jc1xcXCI+RG9jdW1lbnRhdGlvbiAoR2l0aHViKTwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2d1bHBqcy5vcmcvcmVjaXBlcy9cXFwiPlJlY2lwZXMgKEd1bHAuanMpPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL2dpdGh1Yi5jb20vZ3VscGpzL2d1bHAvdHJlZS9tYXN0ZXIvZG9jcy9yZWNpcGVzXFxcIj5SZWNpcGVzIChHaXRodWIpPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPkhhbmRsZWJhcnM8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL2hhbmRsZWJhcnNqcy5jb20vXFxcIj5PZmZpY2lhbCB3ZWJzaXRlPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPk1vY2hhPC9oMj5cXG4gICAgICAgIDx1bD5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vbW9jaGFqcy5vcmcvXFxcIj5PZmZpY2lhbCB3ZWJzaXRlPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL21vY2hhamwucmVhZHRoZWRvY3MuaW8vZW4vbGF0ZXN0L1xcXCI+RG9jdW1lbnRhdGlvbjwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkIG5vLW1hcmdpbi12ZXJ0aWNhbCBnLS0zIGctbS0tNCBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5TdXJmYWNlIENTUzwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vbWlsZHJlbmJlbi5naXRodWIuaW8vc3VyZmFjZS9cXFwiPk9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+R3VscCBQbHVnaW5zPC9oMj5cXG4gICAgICAgIDx1bD5cXG4gICAgICAgICAgPGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC1jb25jYXRcXFwiPlxcbiAgICAgICAgICBndWxwLWNvbmNhdFxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLWRlY2xhcmVcXFwiPlxcbiAgICAgICAgICBndWxwLWRlY2xhcmVcXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC1kb2N1bWVudGF0aW9uXFxcIj5cXG4gICAgICAgICAgZ3VscC1kb2N1bWVudGF0aW9uXFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtaGFuZGxlYmFyc1xcXCI+XFxuICAgICAgICAgIGd1bHAtaGFuZGxlYmFyc1xcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLWh1YlxcXCI+XFxuICAgICAgICAgIGd1bHAtaHViXFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtanNoaW50XFxcIj5cXG4gICAgICAgICAgZ3VscC1qc2hpbnRcXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC1vcGVuXFxcIj5cXG4gICAgICAgICAgZ3VscC1vcGVuXFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtdGFwXFxcIj5cXG4gICAgICAgICAgZ3VscC10YXBcXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC11Z2xpZnlcXFwiPlxcbiAgICAgICAgICBndWxwLXVnbGlmeVxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJndWxwXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8ZGl2IGNsYXNzPVxcXCJnLS0xMCBtLS0xIG5vLW1hcmdpblxcXCI+XFxuICAgICAgPGgyIGNsYXNzPVxcXCJtLS0xIGZhZGUtaW4tZnJvbS10b3AgY29sb3ItLXBhcGVyXFxcIj5HdWxwIFRhc2tzPC9oMj5cXG4gICAgPC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxoMj5Db21pbmcgU29vbjwvaDI+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5leHRlbmQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuZXh0ZW5kKSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSxcImxheW91dFwiLHtcIm5hbWVcIjpcImV4dGVuZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSA9IGNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl0gfHwge307XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdW1wiaGFuZGxlYmFyc1wiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbiAgcmV0dXJuIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwiaGVhZGVyXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJwYWdlXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGRpdiBjbGFzcz1cXFwiZy0tMTAgbS0tMSBuby1tYXJnaW5cXFwiPlxcbiAgICAgIDxoMiBjbGFzcz1cXFwibS0tMSBmYWRlLWluLWZyb20tdG9wIGNvbG9yLS1wYXBlclxcXCI+SGFuZGxlYmFycyBSZWZlcmVuY2U8L2gyPlxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGgyPkNvbWluZyBTb29uPC9oMj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdID0gY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSB8fCB7fTtcbmNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl1bXCJzdHJ1Y3R1cmVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImctLTEwIG0tLTEgbm8tbWFyZ2luXFxcIj5cXG4gICAgICA8aDIgY2xhc3M9XFxcIm0tLTEgZmFkZS1pbi1mcm9tLXRvcCBjb2xvci0tcGFwZXJcXFwiPlByb2plY3QgU3RydWN0dXJlPC9oMj5cXG4gICAgPC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxoMj5Db21pbmcgU29vbjwvaDI+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5leHRlbmQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuZXh0ZW5kKSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSxcImxheW91dFwiLHtcIm5hbWVcIjpcImV4dGVuZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuY29udGFpbmVyW1wiZG9jdW1lbnRhdGlvblwiXSA9IGNvbnRhaW5lcltcImRvY3VtZW50YXRpb25cIl0gfHwge307XG5jb250YWluZXJbXCJkb2N1bWVudGF0aW9uXCJdW1wid29ya2Zsb3dcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImctLTEwIG0tLTEgbm8tbWFyZ2luXFxcIj5cXG4gICAgICA8aDIgY2xhc3M9XFxcIm0tLTEgZmFkZS1pbi1mcm9tLXRvcCBjb2xvci0tcGFwZXJcXFwiPldvcmtmbG93PC9oMj5cXG4gICAgPC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxoMj5Db21pbmcgU29vbjwvaDI+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5leHRlbmQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuZXh0ZW5kKSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSxcImxheW91dFwiLHtcIm5hbWVcIjpcImV4dGVuZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pOzsgcmV0dXJuIGNvbnRhaW5lcjt9IiwidmFyIFNpZGViYXJWaWV3ID0gcmVxdWlyZShcIi4vc2lkZWJhclwiKTtcblxudmFyIFBhZ2VWaWV3ID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5lbCAgICAgICA9ICQoZGF0YS5lbClbMF07XG4gICAgdGhpcy50ZW1wbGF0ZSA9IGRhdGEudGVtcGxhdGU7XG4gICAgdGhpcy5tb2RlbCAgICA9IGRhdGEubW9kZWw7XG59OyAgXG5cblBhZ2VWaWV3LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihwYWdlLHN1YnBhZ2UpIHtcbiAgbGV0IHRlbXBsYXRlcGFnZSA9IHN1YnBhZ2UgPyB0aGlzLnRlbXBsYXRlW3BhZ2VdW3N1YnBhZ2VdIDogdGhpcy50ZW1wbGF0ZVtwYWdlXTtcbiAgdGhpcy5lbC5pbm5lckhUTUwgPSB0ZW1wbGF0ZXBhZ2UodGhpcy5tb2RlbCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlVmlldztcbiIsIlxudmFyIFNpZGViYXJWaWV3ID0gZnVuY3Rpb24oZGF0YSl7XG5cbiAgICB0aGlzLmVsID0gJChkYXRhLmVsKVswXTtcbiAgICB0aGlzLnRlbXBsYXRlID0gZGF0YS50ZW1wbGF0ZTtcbiAgICB0aGlzLm1vZGVsID0gZGF0YS5tb2RlbDtcbiAgICB0aGlzLm5hdiA9IGRhdGEubmF2O1xuICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2sgYVwiLHRoaXMuaGlkZSx0aGlzKVxuICBcbiAgdGhpcy5yZW5kZXIoKTtcbn07XG5cblNpZGViYXJWaWV3LnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5uYXYuY2hlY2tlZCA9IGZhbHNlO1xufVxuXG5TaWRlYmFyVmlldy5wcm90b3R5cGUucmVuZGVyID0gIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gdGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsKTtcbn1cbiAgXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGViYXJWaWV3O1xuIl19
