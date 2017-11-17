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

},{"performance-now":"/home/flubber/projects/js/fluxbuild/node_modules/performance-now/lib/performance-now.js"}],"/home/flubber/projects/js/fluxbuild/node_modules/bottlejs/dist/bottle.js":[function(require,module,exports){
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
    PageView    = require("../view/page"),
    SidebarView = require("../view/sidebar");

module.exports = function page(container) {
  console.log("Initializing pageFactory","[~" + perfnow() + "ms]")
  return {
    start: function() {
      console.log("\t", "Starting pageFactory", "[~" + perfnow() + "ms]");

      this.sidebar = new SidebarView({
        el: "sidebar",
        template: container.template.sidebar,
        model: container.config.about,
        nav: container.$("#nav--super-vertical-responsive")[0]
      });

      this.view = new PageView({
        el: "page",
        template: container.template.page,
        model: container.config.about
      });
    },
    loadPage: function(name) {
      this.view.render(name);
    },
    destroy: function() {
      console.log("\t", "pageFactory Destroyed");
    }
  }
};

},{"../view/page":"/home/flubber/projects/js/fluxbuild/source/view/page.js","../view/sidebar":"/home/flubber/projects/js/fluxbuild/source/view/sidebar.js","util/perfnow":"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js"}],"/home/flubber/projects/js/fluxbuild/source/factory/template.js":[function(require,module,exports){
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
var perfnow = require('util/perfnow'),
    fluxbottle = require('fluxbottle'),
    config = require('../config/app'),
    content = ({"service":({"config":require("./service/config.js"),"router":require("./service/router.js"),"zest":require("./service/zest.js")}),"factory":({"page":require("./factory/page.js"),"template":require("./factory/template.js")})});
                                                                  
/**
 * Core for your application that gets bottled into a factory.
 * All your services, factories and such will be bottled beforehand and
 * are accesible from `container`.
 * @param {object} container A BottleJS container
 * @returns {object} service A service to expose
 */
var Application = function(container) {
  container.$ = container.zest;

  container.router.add("{query}", (options) =>
    container.page.loadPage(options.query)
  );

  return {
    start:    function() {
      console.log("\t","Application Started", "[~" + perfnow() + "ms]");
      container.page.start();
   
    window.addEventListener("hashchange",
                                (e) => container.router.run()
                              );
    
    if (window.location.hash === "")
      window.location.hash = "#home";
    
    container.router.run();
    
    }
  }
};

window.app = fluxbottle.setup(Application,config,content);

module.exports = Application;

},{"../config/app":"/home/flubber/projects/js/fluxbuild/config/app/index.js","./factory/page.js":"/home/flubber/projects/js/fluxbuild/source/factory/page.js","./factory/template.js":"/home/flubber/projects/js/fluxbuild/source/factory/template.js","./service/config.js":"/home/flubber/projects/js/fluxbuild/source/service/config.js","./service/router.js":"/home/flubber/projects/js/fluxbuild/source/service/router.js","./service/zest.js":"/home/flubber/projects/js/fluxbuild/source/service/zest.js","fluxbottle":"/home/flubber/projects/js/fluxbuild/lib/fluxbottle/index.js","util/perfnow":"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js"}],"/home/flubber/projects/js/fluxbuild/source/service/config.js":[function(require,module,exports){
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
	  pathRoot: '',  // Base path for your app
  });
 
  return router;
};

},{"lightrouter":"/home/flubber/projects/js/fluxbuild/node_modules/lightrouter/src/lightrouter.js","util/perfnow":"/home/flubber/projects/js/fluxbuild/lib/util/perfnow.js"}],"/home/flubber/projects/js/fluxbuild/source/service/zest.js":[function(require,module,exports){
var zest = require("zest");

module.exports = function(){
  return zest;
}

},{"zest":"/home/flubber/projects/js/fluxbuild/node_modules/zest/lib/zest.js"}],"/home/flubber/projects/js/fluxbuild/source/template.js":[function(require,module,exports){
module.exports = function (Handlebars){var container = {}; container["layout"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "<header class=\"container--wrap no-margin-vertical\">\n    <h1 class=\"m--1 g--12 no-margin-vertical\">\n      "
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n    </h1>\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"header",{"name":"block","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</header>\n  <div class=\"g--10 m--1\">\n"
    + ((stack1 = (helpers.block || (depth0 && depth0.block) || alias2).call(alias1,"page",{"name":"block","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n</div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "";
},"4":function(container,depth0,helpers,partials,data) {
    return "    Content\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.block || (depth0 && depth0.block) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"fullpage",{"name":"block","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
container["sidebar"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"logo-area no-margin-vertical fade-in-from-top\">\n  <img class=\"g--2 no-margin-vertical\" src=\"images/logo.png\">\n  <h4 class=\"g--6 m--1 no-margin-vertical\">"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data}) : helper)))
    + "</h4>\n</div>\n<nav class=\"g--12 no-margin-vertical fade-in-from-left\"\n     role=\"navigation\">\n\n  <a href=\"#home\">\n    <i class=\"fa fa-home fa-2x\"></i>\n      <span class=\"m--1\">Home</span>\n  </a>\n\n  <div class=\"nav-collapsible no-margin-vertical\">\n    <input type=\"checkbox\" id=\"nav-documentation\">\n    <label for=\"nav-documentation\">\n        <i class=\"fa fa-book\"></i>\n        <span class=\"m--1\">Documentation<span>\n      </label>\n    <div class=\"nav-collapsible-links\">\n      <a href=\"#structure\">Project Structure</a>\n      <a href=\"#workflow\">Workflow</a>\n      <a href=\"#gulp\">Gulp Tasks</a>\n      <a href=\"#documentation\">Generating Documentation</a>\n      <a href=\"#handlebars\">Handlebars Reference</a>\n      <a href=\"#surface\">Surface CSS Reference</a>\n      <a href=\"#external\">External Information</a>\n    </div>\n  </div>\n\n  <a href=\"#about\">\n      <i class='fa fa-user fa-2x'></i>\n      <span class=\"m--1\">About</span>\n  </a>\n  \n  <a href=\"#disc\">\n      <i class='fa fa-bar-chart fa-2x'></i>\n      <span class=\"m--1\">Disc</span>\n  </a>\n  \n</nav>\n";
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
container["page"]["disc"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "\n"
    + ((stack1 = (helpers.content || (depth0 && depth0.content) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),"fullpage",{"name":"content","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "  <embed src=\"content/disc/index.html\" \n         class=\"no-margin\" \n         style=\"height:90%;width:100%\"></embed>\n";
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
    return "    <div class=\"container container--wrap no-margin\">\n      <div class=\"card no-margin-vertical g--4 g-m--6 g-t--12\">\n        <h2>Gulp 4</h2>\n        <p>\n          gulp is a toolkit for automating painful or time-consuming tasks in your development workflow, so you can stop messing around and build something.\n          <p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--4 g-m--6 g-t--12\">\n        <h2>Browserify</h2>\n        <p>\n          Browsers don't have the require method defined, but Node.js does. With Browserify you can write code that uses require in the same way that you would use it in Node.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--4 g-m--6 g-t--12\">\n        <h2>Backbone</h2>\n        <p>\n          Backbone.js gives structure to web applications by providing models with key-value binding and custom events, collections with a rich API of enumerable functions, views with declarative event handling, and connects it all to your existing API over a RESTful\n          JSON interface.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--4 g-m--6 g-t--12\">\n        <h2>Zest</h2>\n\n        <p>\n          zest is a fast, lightweight, and extensible CSS selector engine. Zest was designed to be very concise while still supporting CSS3/CSS4 selectors and remaining fast.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--4 g-m--6 g-t--12\">\n        <h2>Handlebars</h2>\n        <p>\n          Handlebars provides the power necessary to let you build semantic templates effectively with no frustration.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--4 g-m--6 g-t--12\">\n        <h2>Surface CSS</h2>\n        <p>\n          Design philosophy and aesthetics inspired by Google's Material Design.\n        </p>\n      </div>\n\n      <div class=\"card no-margin-vertical g--12\" style=\"text-align:center;\">\n        <h2>Fluxbuild</h2>\n        <p>\n          Build blazingly-fast applications using all of the above, with premade gulp tasks for automated testing, documentation,templating and more. Configurable to fit your favorite workflow without getting in your way.\n        </p>\n      </div>\n\n    </div>\n";
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
},{}],"/home/flubber/projects/js/fluxbuild/source/view/page.js":[function(require,module,exports){
var SidebarView = require("./sidebar");

var PageView = function(data){
    this.el = document.getElementById(data.el);
    this.template = data.template;
    this.model    = data.model;
};  

PageView.prototype.render = function(page) {
  this.el.innerHTML = this.template[page](this.model);
}


module.exports = PageView;

},{"./sidebar":"/home/flubber/projects/js/fluxbuild/source/view/sidebar.js"}],"/home/flubber/projects/js/fluxbuild/source/view/sidebar.js":[function(require,module,exports){

var SidebarView = function(data){

    this.el = document.getElementById(data.el);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcvYXBwL2Fib3V0LmpzIiwiY29uZmlnL2FwcC9jb3JlLmpzIiwiY29uZmlnL2FwcC9pbmRleC5qcyIsImxpYi9mbHV4Ym90dGxlL2luZGV4LmpzIiwibGliL3V0aWwvcGVyZm5vdy5qcyIsIm5vZGVfbW9kdWxlcy9ib3R0bGVqcy9kaXN0L2JvdHRsZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzLWxheW91dHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy5ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2RlY29yYXRvcnMuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9kZWNvcmF0b3JzL2lubGluZS5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2Jsb2NrLWhlbHBlci1taXNzaW5nLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9lYWNoLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy9oZWxwZXItbWlzc2luZy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvaWYuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9oZWxwZXJzL2xvZy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2hlbHBlcnMvbG9va3VwLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvaGVscGVycy93aXRoLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvbG9nZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9uby1jb25mbGljdC5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9zYWZlLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9saWdodHJvdXRlci9zcmMvbGlnaHRyb3V0ZXIuanMiLCJub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utbm93L2xpYi9wZXJmb3JtYW5jZS1ub3cuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3plc3QvbGliL3plc3QuanMiLCJzb3VyY2UvZmFjdG9yeS9wYWdlLmpzIiwic291cmNlL2ZhY3RvcnkvdGVtcGxhdGUuanMiLCJzb3VyY2UvaW5kZXguanMiLCJzb3VyY2Uvc2VydmljZS9jb25maWcuanMiLCJzb3VyY2Uvc2VydmljZS9yb3V0ZXIuanMiLCJzb3VyY2Uvc2VydmljZS96ZXN0LmpzIiwic291cmNlL3RlbXBsYXRlLmpzIiwic291cmNlL3ZpZXcvcGFnZS5qcyIsInNvdXJjZS92aWV3L3NpZGViYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDL1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3A3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICAgICAgIFwiRmx1eGJ1aWxkXCIsXG4gIGZpbGVuYW1lOiAgIFwiZmx1eGJ1aWxkXCIsXG4gIHZlcnNpb246ICAgIFwiMS4wLjBcIlxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFib3V0OiAgICAgIHJlcXVpcmUoXCIuL2Fib3V0XCIpLFxuICBtb2R1bGU6ICAgICByZXF1aXJlKFwiLi9tb2R1bGVcIiksXG4gIGNvcmU6ICAgICAgIHJlcXVpcmUoXCIuL2NvcmVcIilcbn1cbiIsInZhciBwZXJmbm93ICAgPSByZXF1aXJlKFwidXRpbC9wZXJmbm93XCIpO1xuY29uc29sZS5sb2coXCJGbHV4Ym90dGxlIEAgXCIsbmV3IERhdGUoKS50b1N0cmluZygpLnNsaWNlKDE2LCAyNCksXCJbflwiK3BlcmZub3coKStcIm1zXVwiKTtcblxudmFyIEJvdHRsZSA9IHJlcXVpcmUoXCJib3R0bGVqc1wiKTtcblxuLyoqXG4gIFVzZWQgaW50ZXJuYWxseSB0byBpbnN0YW50aWF0ZSBhbiBhcHBsaWNhdGlvbiB1c2luZyBwcm92aWRlZCBhcmd1bWVudHMgYW5kIHJldHVybnMgaXQuXG4gKlxuICAgQHBhcmFtIHtvYmplY3R9IGFwcGxpY2F0aW9uIFRoZSBvYmplY3Qgb24gd2hpY2ggdG8gY2FsbCB0aGUgZnVuY3Rpb24uXG4gICBAcGFyYW0ge29iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gZmlsZVxuICAgQHBhcmFtIHtvYmplY3R9IGluY2x1ZGUgSGFzaG1hcCBvZiBpbmNsdWRhYmxlcyAoIGxpYnJhcmllcyBlLmcuICkuXG4gICBAcGFyYW0ge29iamVjdH0gbW9kdWxlcyBIYXNobWFwIG9mIG1vZHVsZXMuXG4gICBAcmV0dXJucyB7b2JqZWN0fSBBbiBpbnN0YW50aWF0ZWQgYXBwbGljYXRpb25cbiovXG5mdW5jdGlvbiBpbml0aWFsaXplKGFwcCxjb25maWcsY29udGVudCkge1xuICB2YXIgYm90dGxlID0gQm90dGxlKGNvbmZpZy5hYm91dC5maWxlbmFtZSk7XG4gIHZhciBkZXBlbmRlbmNpZXMgPSBbXTtcblxuICBPYmplY3Qua2V5cyhjb250ZW50KS5tYXAoZnVuY3Rpb24odHlwZSl7XG4gICAgdmFyIHN1YnNldCA9IGNvbnRlbnRbdHlwZV07XG4gICAgT2JqZWN0LmtleXMoc3Vic2V0KS5tYXAoZnVuY3Rpb24obmFtZSl7XG4gICAgICB2YXIgcmVhbG5hbWUgPSBuYW1lO1xuICAgICAgdmFyIG5hbWUgICAgID0gc3Vic2V0W25hbWVdLm5hbWV8fG5hbWU7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiXFx0XCIsXCJCb3R0bGluZ1wiLHR5cGUsbmFtZSxcIlt+XCIgKyBwZXJmbm93KCkgKyBcIm1zXVwiKTtcblxuICAgICAgYm90dGxlW3R5cGVdKG5hbWUsc3Vic2V0W3JlYWxuYW1lXSk7XG4gICAgICBkZXBlbmRlbmNpZXMucHVzaChuYW1lKTtcbiAgICB9KVxuICB9KVxuXG4gIHZhciBhcHBkYXRhID0gW2NvbmZpZy5hYm91dC5maWxlbmFtZSxhcHBdLy8uY29uY2F0KGRlcGVuZGVuY2llcyk7XG5cbiAgYm90dGxlLmZhY3RvcnkuYXBwbHkoYm90dGxlLGFwcGRhdGEpO1xuXG4gIHJldHVybiBib3R0bGU7XG59O1xuXG4vKipcbiAgSW5pdGlhbGl6ZXMgYW4gYXBwbGljYXRpb24gdXNpbmcgc3VwcGxpZWQgYXJndW1lbnRzLlxuICBVc3VhbGx5IGNhbGxlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAgIEBwYXJhbSB7b2JqZWN0fSBhcHBsaWNhdGlvbiBUaGUgb2JqZWN0IG9uIHdoaWNoIHRvIGNhbGwgdGhlIGZ1bmN0aW9uLlxuICAgQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBDb25maWd1cmF0aW9uIGZpbGVcbiAgIEBwYXJhbSB7b2JqZWN0fSBpbmNsdWRlIEhhc2htYXAgb2YgaW5jbHVkYWJsZXMgKCBsaWJyYXJpZXMgZS5nLiApLlxuICAgQHBhcmFtIHtvYmplY3R9IG1vZHVsZXMgSGFzaG1hcCBvZiBtb2R1bGVzLlxuICAgQHJldHVybnMge29iamVjdH0gQW4gaW5zdGFudGlhdGVkIGFwcGxpY2F0aW9uXG4qL1xuZnVuY3Rpb24gc2V0dXAoYXBwbGljYXRpb24sIGNvbmZpZywgY29udGVudCkge1xuICBpZiAodGhpcy5zdGFydGVkKVxuICAgIGNvbnNvbGUud2FybihcIldhcm5pbmc6IEFwcCBzZXR1cCBjYWxsZWQgd2hpbGUgYWxyZWFkeSBzdGFydGVkXCIpXG5cbiAgY29uc29sZS5sb2coXCJJbml0aWFsaXppbmcgQXBwbGljYXRpb25cIixcIlt+XCIgKyBwZXJmbm93KCkgKyBcIm1zXVwiKTtcblxuICB0aGlzLmFwcCA9IHRoaXMuaW5pdGlhbGl6ZShhcHBsaWNhdGlvbiwgY29uZmlnLCBjb250ZW50KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpe1xuICAgIHRoaXMuYXBwLmNvbnRhaW5lci5mbHV4YnVpbGQuc3RhcnQoKTtcbiAgfSk7XG5cbiAgY29uc29sZS5sb2coXCJGaW5pc2hlZCBBcHBsaWNhdGlvbiBJbml0aWFsaXphdGlvbiBbflwiICsgcGVyZm5vdygpICsgXCJtc11cIik7XG5cbiAgcmV0dXJuIHRoaXMuYXBwO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFwcDogICAgICAgIG51bGwsXG4gIHN0YXJ0ZWQ6ICAgIGZhbHNlLFxuICBpbml0aWFsaXplOiBpbml0aWFsaXplLFxuICBzZXR1cDogICAgICBzZXR1cFxufTtcbiIsInZhciBub3cgICAgICAgID0gcmVxdWlyZShcInBlcmZvcm1hbmNlLW5vd1wiKSxcbiAgICBfdGltZSAgICAgID0gbm93KCk7XG5cbmZ1bmN0aW9uIGVsYXBzZWQocGFzc2VkKXtcbiAgcmV0dXJuIG5vdygpLXBhc3NlZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvdmVycmlkZSl7XG4gIF90aW1lID0gb3ZlcnJpZGUgPyBfdGltZSA9IG5vdygpIDogX3RpbWU7XG4gIHZhciBvdXQgPSBlbGFwc2VkKF90aW1lKS50b1N0cmluZygpO1xuICByZXR1cm4gb3V0LnNsaWNlKDAsb3V0LmluZGV4T2YoXCIuXCIpKzIpO1xufVxuIiwiOyhmdW5jdGlvbih1bmRlZmluZWQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLyoqXG4gICAgICogQm90dGxlSlMgdjEuNi4xIC0gMjAxNy0wNS0xN1xuICAgICAqIEEgcG93ZXJmdWwgZGVwZW5kZW5jeSBpbmplY3Rpb24gbWljcm8gY29udGFpbmVyXG4gICAgICpcbiAgICAgKiBDb3B5cmlnaHQgKGMpIDIwMTcgU3RlcGhlbiBZb3VuZ1xuICAgICAqIExpY2Vuc2VkIE1JVFxuICAgICAqL1xuICAgIFxuICAgIC8qKlxuICAgICAqIFVuaXF1ZSBpZCBjb3VudGVyO1xuICAgICAqXG4gICAgICogQHR5cGUgTnVtYmVyXG4gICAgICovXG4gICAgdmFyIGlkID0gMDtcbiAgICBcbiAgICAvKipcbiAgICAgKiBMb2NhbCBzbGljZSBhbGlhc1xuICAgICAqXG4gICAgICogQHR5cGUgRnVuY3Rpb25zXG4gICAgICovXG4gICAgdmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuICAgIFxuICAgIC8qKlxuICAgICAqIEl0ZXJhdG9yIHVzZWQgdG8gd2FsayBkb3duIGEgbmVzdGVkIG9iamVjdC5cbiAgICAgKlxuICAgICAqIElmIEJvdHRsZS5jb25maWcuc3RyaWN0IGlzIHRydWUsIHRoaXMgbWV0aG9kIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGl0IGVuY291bnRlcnMgYW5cbiAgICAgKiB1bmRlZmluZWQgcGF0aFxuICAgICAqXG4gICAgICogQHBhcmFtIE9iamVjdCBvYmpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIHByb3BcbiAgICAgKiBAcmV0dXJuIG1peGVkXG4gICAgICogQHRocm93cyBFcnJvciBpZiBCb3R0bGUgaXMgdW5hYmxlIHRvIHJlc29sdmUgdGhlIHJlcXVlc3RlZCBzZXJ2aWNlLlxuICAgICAqL1xuICAgIHZhciBnZXROZXN0ZWQgPSBmdW5jdGlvbiBnZXROZXN0ZWQob2JqLCBwcm9wKSB7XG4gICAgICAgIHZhciBzZXJ2aWNlID0gb2JqW3Byb3BdO1xuICAgICAgICBpZiAoc2VydmljZSA9PT0gdW5kZWZpbmVkICYmIGdsb2JhbENvbmZpZy5zdHJpY3QpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm90dGxlIHdhcyB1bmFibGUgdG8gcmVzb2x2ZSBhIHNlcnZpY2UuICBgJyArIHByb3AgKyAnYCBpcyB1bmRlZmluZWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlcnZpY2U7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBHZXQgYSBuZXN0ZWQgYm90dGxlLiBXaWxsIHNldCBhbmQgcmV0dXJuIGlmIG5vdCBzZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBnZXROZXN0ZWRCb3R0bGUgPSBmdW5jdGlvbiBnZXROZXN0ZWRCb3R0bGUobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZXN0ZWRbbmFtZV0gfHwgKHRoaXMubmVzdGVkW25hbWVdID0gQm90dGxlLnBvcCgpKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEdldCBhIHNlcnZpY2Ugc3RvcmVkIHVuZGVyIGEgbmVzdGVkIGtleVxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBmdWxsbmFtZVxuICAgICAqIEByZXR1cm4gU2VydmljZVxuICAgICAqL1xuICAgIHZhciBnZXROZXN0ZWRTZXJ2aWNlID0gZnVuY3Rpb24gZ2V0TmVzdGVkU2VydmljZShmdWxsbmFtZSkge1xuICAgICAgICByZXR1cm4gZnVsbG5hbWUuc3BsaXQoJy4nKS5yZWR1Y2UoZ2V0TmVzdGVkLCB0aGlzKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgY29uc3RhbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBtaXhlZCB2YWx1ZVxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIGNvbnN0YW50ID0gZnVuY3Rpb24gY29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICBuYW1lID0gcGFydHMucG9wKCk7XG4gICAgICAgIGRlZmluZUNvbnN0YW50LmNhbGwocGFydHMucmVkdWNlKHNldFZhbHVlT2JqZWN0LCB0aGlzLmNvbnRhaW5lciksIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICB2YXIgZGVmaW5lQ29uc3RhbnQgPSBmdW5jdGlvbiBkZWZpbmVDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlIDogZmFsc2UsXG4gICAgICAgICAgICBlbnVtZXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlIDogdmFsdWUsXG4gICAgICAgICAgICB3cml0YWJsZSA6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgZGVjb3JhdG9yLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBmdWxsbmFtZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBmdW5jXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgZGVjb3JhdG9yID0gZnVuY3Rpb24gZGVjb3JhdG9yKGZ1bGxuYW1lLCBmdW5jKSB7XG4gICAgICAgIHZhciBwYXJ0cywgbmFtZTtcbiAgICAgICAgaWYgKHR5cGVvZiBmdWxsbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZnVuYyA9IGZ1bGxuYW1lO1xuICAgICAgICAgICAgZnVsbG5hbWUgPSAnX19nbG9iYWxfXyc7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcGFydHMgPSBmdWxsbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgZ2V0TmVzdGVkQm90dGxlLmNhbGwodGhpcywgbmFtZSkuZGVjb3JhdG9yKHBhcnRzLmpvaW4oJy4nKSwgZnVuYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGVjb3JhdG9yc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yc1tuYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3JzW25hbWVdLnB1c2goZnVuYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCB3aGVuIEJvdHRsZSNyZXNvbHZlIGlzIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBmdW5jXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgZGVmZXIgPSBmdW5jdGlvbiBkZWZlcihmdW5jKSB7XG4gICAgICAgIHRoaXMuZGVmZXJyZWQucHVzaChmdW5jKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBJbW1lZGlhdGVseSBpbnN0YW50aWF0ZXMgdGhlIHByb3ZpZGVkIGxpc3Qgb2Ygc2VydmljZXMgYW5kIHJldHVybnMgdGhlbS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBBcnJheSBzZXJ2aWNlc1xuICAgICAqIEByZXR1cm4gQXJyYXkgQXJyYXkgb2YgaW5zdGFuY2VzIChpbiB0aGUgb3JkZXIgdGhleSB3ZXJlIHByb3ZpZGVkKVxuICAgICAqL1xuICAgIHZhciBkaWdlc3QgPSBmdW5jdGlvbiBkaWdlc3Qoc2VydmljZXMpIHtcbiAgICAgICAgcmV0dXJuIChzZXJ2aWNlcyB8fCBbXSkubWFwKGdldE5lc3RlZFNlcnZpY2UsIHRoaXMuY29udGFpbmVyKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgZmFjdG9yeSBpbnNpZGUgYSBnZW5lcmljIHByb3ZpZGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIEZhY3RvcnlcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBmYWN0b3J5ID0gZnVuY3Rpb24gZmFjdG9yeShuYW1lLCBGYWN0b3J5KSB7XG4gICAgICAgIHJldHVybiBwcm92aWRlci5jYWxsKHRoaXMsIG5hbWUsIGZ1bmN0aW9uIEdlbmVyaWNQcm92aWRlcigpIHtcbiAgICAgICAgICAgIHRoaXMuJGdldCA9IEZhY3Rvcnk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYW4gaW5zdGFuY2UgZmFjdG9yeSBpbnNpZGUgYSBnZW5lcmljIGZhY3RvcnkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBzZXJ2aWNlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gRmFjdG9yeSAtIFRoZSBmYWN0b3J5IGZ1bmN0aW9uLCBtYXRjaGVzIHRoZSBzaWduYXR1cmUgcmVxdWlyZWQgZm9yIHRoZVxuICAgICAqIGBmYWN0b3J5YCBtZXRob2RcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBpbnN0YW5jZUZhY3RvcnkgPSBmdW5jdGlvbiBpbnN0YW5jZUZhY3RvcnkobmFtZSwgRmFjdG9yeSkge1xuICAgICAgICByZXR1cm4gZmFjdG9yeS5jYWxsKHRoaXMsIG5hbWUsIGZ1bmN0aW9uIEdlbmVyaWNJbnN0YW5jZUZhY3RvcnkoY29udGFpbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlIDogRmFjdG9yeS5iaW5kKEZhY3RvcnksIGNvbnRhaW5lcilcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIHJlbW92aW5nIGJvdHRsZSBjb250YWluZXIgbWV0aG9kcyBhbmQgcHJvdmlkZXJzIGZyb20gYSBsaXN0IG9mIGtleXNcbiAgICAgKi9cbiAgICB2YXIgYnlNZXRob2QgPSBmdW5jdGlvbiBieU1ldGhvZChuYW1lKSB7XG4gICAgICAgIHJldHVybiAhL15cXCQoPzpkZWNvcmF0b3J8cmVnaXN0ZXJ8bGlzdCkkfFByb3ZpZGVyJC8udGVzdChuYW1lKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIExpc3QgdGhlIHNlcnZpY2VzIHJlZ2lzdGVyZWQgb24gdGhlIGNvbnRhaW5lci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBPYmplY3QgY29udGFpbmVyXG4gICAgICogQHJldHVybiBBcnJheVxuICAgICAqL1xuICAgIHZhciBsaXN0ID0gZnVuY3Rpb24gbGlzdChjb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbnRhaW5lciB8fCB0aGlzLmNvbnRhaW5lciB8fCB7fSkuZmlsdGVyKGJ5TWV0aG9kKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHVzZWQgYnkgcHJvdmlkZXIgdG8gc2V0IHVwIG1pZGRsZXdhcmUgZm9yIGVhY2ggcmVxdWVzdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBOdW1iZXIgaWRcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGluc3RhbmNlXG4gICAgICogQHBhcmFtIE9iamVjdCBjb250YWluZXJcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICB2YXIgYXBwbHlNaWRkbGV3YXJlID0gZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKG1pZGRsZXdhcmUsIG5hbWUsIGluc3RhbmNlLCBjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSB7XG4gICAgICAgICAgICBjb25maWd1cmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZSA6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG1pZGRsZXdhcmUubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uIGdldFdpdGhNaWRkbGV3ZWFyKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIG5leHQgPSBmdW5jdGlvbiBuZXh0TWlkZGxld2FyZShlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtaWRkbGV3YXJlW2luZGV4XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWlkZGxld2FyZVtpbmRleCsrXShpbnN0YW5jZSwgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IGluc3RhbmNlO1xuICAgICAgICAgICAgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnRhaW5lciwgbmFtZSwgZGVzY3JpcHRvcik7XG4gICAgXG4gICAgICAgIHJldHVybiBjb250YWluZXJbbmFtZV07XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBtaWRkbGV3YXJlLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIEZ1bmN0aW9uIGZ1bmNcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBtaWRkbGV3YXJlID0gZnVuY3Rpb24gbWlkZGxld2FyZShmdWxsbmFtZSwgZnVuYykge1xuICAgICAgICB2YXIgcGFydHMsIG5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgZnVsbG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGZ1bmMgPSBmdWxsbmFtZTtcbiAgICAgICAgICAgIGZ1bGxuYW1lID0gJ19fZ2xvYmFsX18nO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHBhcnRzID0gZnVsbG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGdldE5lc3RlZEJvdHRsZS5jYWxsKHRoaXMsIG5hbWUpLm1pZGRsZXdhcmUocGFydHMuam9pbignLicpLCBmdW5jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5taWRkbGV3YXJlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWlkZGxld2FyZXNbbmFtZV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubWlkZGxld2FyZXNbbmFtZV0ucHVzaChmdW5jKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIE5hbWVkIGJvdHRsZSBpbnN0YW5jZXNcbiAgICAgKlxuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIHZhciBib3R0bGVzID0ge307XG4gICAgXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGluc3RhbmNlIG9mIGJvdHRsZS5cbiAgICAgKlxuICAgICAqIElmIGEgbmFtZSBpcyBwcm92aWRlZCB0aGUgaW5zdGFuY2Ugd2lsbCBiZSBzdG9yZWQgaW4gYSBsb2NhbCBoYXNoLiAgQ2FsbGluZyBCb3R0bGUucG9wIG11bHRpcGxlXG4gICAgICogdGltZXMgd2l0aCB0aGUgc2FtZSBuYW1lIHdpbGwgcmV0dXJuIHRoZSBzYW1lIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgcG9wID0gZnVuY3Rpb24gcG9wKG5hbWUpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IGJvdHRsZXNbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgYm90dGxlc1tuYW1lXSA9IGluc3RhbmNlID0gbmV3IEJvdHRsZSgpO1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLmNvbnN0YW50KCdCT1RUTEVfTkFNRScsIG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQm90dGxlKCk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgbmFtZWQgYm90dGxlcy5cbiAgICAgKi9cbiAgICB2YXIgY2xlYXIgPSBmdW5jdGlvbiBjbGVhcihuYW1lKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBib3R0bGVzW25hbWVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm90dGxlcyA9IHt9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIHByb2Nlc3MgZGVjb3JhdG9ycyBpbiB0aGUgcHJvdmlkZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBPYmplY3QgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gZnVuY1xuICAgICAqIEByZXR1cm4gTWl4ZWRcbiAgICAgKi9cbiAgICB2YXIgcmVkdWNlciA9IGZ1bmN0aW9uIHJlZHVjZXIoaW5zdGFuY2UsIGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMoaW5zdGFuY2UpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBwcm92aWRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgZnVsbG5hbWVcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gUHJvdmlkZXJcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBwcm92aWRlciA9IGZ1bmN0aW9uIHByb3ZpZGVyKGZ1bGxuYW1lLCBQcm92aWRlcikge1xuICAgICAgICB2YXIgcGFydHMsIG5hbWU7XG4gICAgICAgIHBhcnRzID0gZnVsbG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgaWYgKHRoaXMucHJvdmlkZXJNYXBbZnVsbG5hbWVdICYmIHBhcnRzLmxlbmd0aCA9PT0gMSAmJiAhdGhpcy5jb250YWluZXJbZnVsbG5hbWUgKyAnUHJvdmlkZXInXSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZnVsbG5hbWUgKyAnIHByb3ZpZGVyIGFscmVhZHkgaW5zdGFudGlhdGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3JpZ2luYWxQcm92aWRlcnNbZnVsbG5hbWVdID0gUHJvdmlkZXI7XG4gICAgICAgIHRoaXMucHJvdmlkZXJNYXBbZnVsbG5hbWVdID0gdHJ1ZTtcbiAgICBcbiAgICAgICAgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgXG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNyZWF0ZVN1YlByb3ZpZGVyLmNhbGwodGhpcywgbmFtZSwgUHJvdmlkZXIsIHBhcnRzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVhdGVQcm92aWRlci5jYWxsKHRoaXMsIG5hbWUsIFByb3ZpZGVyKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEdldCBkZWNvcmF0b3JzIGFuZCBtaWRkbGV3YXJlIGluY2x1ZGluZyBnbG9iYWxzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIGFycmF5XG4gICAgICovXG4gICAgdmFyIGdldFdpdGhHbG9iYWwgPSBmdW5jdGlvbiBnZXRXaXRoR2xvYmFsKGNvbGxlY3Rpb24sIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIChjb2xsZWN0aW9uW25hbWVdIHx8IFtdKS5jb25jYXQoY29sbGVjdGlvbi5fX2dsb2JhbF9fIHx8IFtdKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgcHJvdmlkZXIgcHJvcGVydGllcyBvbiB0aGUgY29udGFpbmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gUHJvdmlkZXJcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBjcmVhdGVQcm92aWRlciA9IGZ1bmN0aW9uIGNyZWF0ZVByb3ZpZGVyKG5hbWUsIFByb3ZpZGVyKSB7XG4gICAgICAgIHZhciBwcm92aWRlck5hbWUsIHByb3BlcnRpZXMsIGNvbnRhaW5lciwgaWQsIGRlY29yYXRvcnMsIG1pZGRsZXdhcmVzO1xuICAgIFxuICAgICAgICBpZCA9IHRoaXMuaWQ7XG4gICAgICAgIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xuICAgICAgICBkZWNvcmF0b3JzID0gdGhpcy5kZWNvcmF0b3JzO1xuICAgICAgICBtaWRkbGV3YXJlcyA9IHRoaXMubWlkZGxld2FyZXM7XG4gICAgICAgIHByb3ZpZGVyTmFtZSA9IG5hbWUgKyAnUHJvdmlkZXInO1xuICAgIFxuICAgICAgICBwcm9wZXJ0aWVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgcHJvcGVydGllc1twcm92aWRlck5hbWVdID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgZ2V0IDogZnVuY3Rpb24gZ2V0UHJvdmlkZXIoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gbmV3IFByb3ZpZGVyKCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbnRhaW5lcltwcm92aWRlck5hbWVdO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lcltwcm92aWRlck5hbWVdID0gaW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIFxuICAgICAgICBwcm9wZXJ0aWVzW25hbWVdID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGUgOiB0cnVlLFxuICAgICAgICAgICAgZ2V0IDogZnVuY3Rpb24gZ2V0U2VydmljZSgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBjb250YWluZXJbcHJvdmlkZXJOYW1lXTtcbiAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgaWYgKHByb3ZpZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbHRlciB0aHJvdWdoIGRlY29yYXRvcnNcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBnZXRXaXRoR2xvYmFsKGRlY29yYXRvcnMsIG5hbWUpLnJlZHVjZShyZWR1Y2VyLCBwcm92aWRlci4kZ2V0KGNvbnRhaW5lcikpO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29udGFpbmVyW3Byb3ZpZGVyTmFtZV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb250YWluZXJbbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZSA9PT0gdW5kZWZpbmVkID8gaW5zdGFuY2UgOiBhcHBseU1pZGRsZXdhcmUoZ2V0V2l0aEdsb2JhbChtaWRkbGV3YXJlcywgbmFtZSksXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsIGluc3RhbmNlLCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhjb250YWluZXIsIHByb3BlcnRpZXMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBib3R0bGUgY29udGFpbmVyIG9uIHRoZSBjdXJyZW50IGJvdHRsZSBjb250YWluZXIsIGFuZCByZWdpc3RlcnNcbiAgICAgKiB0aGUgcHJvdmlkZXIgdW5kZXIgdGhlIHN1YiBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gUHJvdmlkZXJcbiAgICAgKiBAcGFyYW0gQXJyYXkgcGFydHNcbiAgICAgKiBAcmV0dXJuIEJvdHRsZVxuICAgICAqL1xuICAgIHZhciBjcmVhdGVTdWJQcm92aWRlciA9IGZ1bmN0aW9uIGNyZWF0ZVN1YlByb3ZpZGVyKG5hbWUsIFByb3ZpZGVyLCBwYXJ0cykge1xuICAgICAgICB2YXIgYm90dGxlO1xuICAgICAgICBib3R0bGUgPSBnZXROZXN0ZWRCb3R0bGUuY2FsbCh0aGlzLCBuYW1lKTtcbiAgICAgICAgdGhpcy5mYWN0b3J5KG5hbWUsIGZ1bmN0aW9uIFN1YlByb3ZpZGVyRmFjdG9yeSgpIHtcbiAgICAgICAgICAgIHJldHVybiBib3R0bGUuY29udGFpbmVyO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGJvdHRsZS5wcm92aWRlcihwYXJ0cy5qb2luKCcuJyksIFByb3ZpZGVyKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgc2VydmljZSwgZmFjdG9yeSwgcHJvdmlkZXIsIG9yIHZhbHVlIGJhc2VkIG9uIHByb3BlcnRpZXMgb24gdGhlIG9iamVjdC5cbiAgICAgKlxuICAgICAqIHByb3BlcnRpZXM6XG4gICAgICogICogT2JqLiRuYW1lICAgU3RyaW5nIHJlcXVpcmVkIGV4OiBgJ1RoaW5nJ2BcbiAgICAgKiAgKiBPYmouJHR5cGUgICBTdHJpbmcgb3B0aW9uYWwgJ3NlcnZpY2UnLCAnZmFjdG9yeScsICdwcm92aWRlcicsICd2YWx1ZScuICBEZWZhdWx0OiAnc2VydmljZSdcbiAgICAgKiAgKiBPYmouJGluamVjdCBNaXhlZCAgb3B0aW9uYWwgb25seSB1c2VmdWwgd2l0aCAkdHlwZSAnc2VydmljZScgbmFtZSBvciBhcnJheSBvZiBuYW1lc1xuICAgICAqICAqIE9iai4kdmFsdWUgIE1peGVkICBvcHRpb25hbCBOb3JtYWxseSBPYmogaXMgcmVnaXN0ZXJlZCBvbiB0aGUgY29udGFpbmVyLiAgSG93ZXZlciwgaWYgdGhpc1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eSBpcyBpbmNsdWRlZCwgaXQncyB2YWx1ZSB3aWxsIGJlIHJlZ2lzdGVyZWQgb24gdGhlIGNvbnRhaW5lclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICBpbnN0ZWFkIG9mIHRoZSBvYmplY3QgaXRzc2VsZi4gIFVzZWZ1bCBmb3IgcmVnaXN0ZXJpbmcgb2JqZWN0cyBvbiB0aGVcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgYm90dGxlIGNvbnRhaW5lciB3aXRob3V0IG1vZGlmeWluZyB0aG9zZSBvYmplY3RzIHdpdGggYm90dGxlIHNwZWNpZmljIGtleXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24gT2JqXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgcmVnaXN0ZXIgPSBmdW5jdGlvbiByZWdpc3RlcihPYmopIHtcbiAgICAgICAgdmFyIHZhbHVlID0gT2JqLiR2YWx1ZSA9PT0gdW5kZWZpbmVkID8gT2JqIDogT2JqLiR2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXNbT2JqLiR0eXBlIHx8ICdzZXJ2aWNlJ10uYXBwbHkodGhpcywgW09iai4kbmFtZSwgdmFsdWVdLmNvbmNhdChPYmouJGluamVjdCB8fCBbXSkpO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBwcm92aWRlcnMgZnJvbSB0aGUgbWFwIGFuZCBjb250YWluZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcmV0dXJuIHZvaWRcbiAgICAgKi9cbiAgICB2YXIgcmVtb3ZlUHJvdmlkZXJNYXAgPSBmdW5jdGlvbiByZXNldFByb3ZpZGVyKG5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMucHJvdmlkZXJNYXBbbmFtZV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbnRhaW5lcltuYW1lXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuY29udGFpbmVyW25hbWUgKyAnUHJvdmlkZXInXTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlc2V0cyBhbGwgcHJvdmlkZXJzIG9uIGEgYm90dGxlIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHJldHVybiB2b2lkXG4gICAgICovXG4gICAgdmFyIHJlc2V0UHJvdmlkZXJzID0gZnVuY3Rpb24gcmVzZXRQcm92aWRlcnMoKSB7XG4gICAgICAgIHZhciBwcm92aWRlcnMgPSB0aGlzLm9yaWdpbmFsUHJvdmlkZXJzO1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLm9yaWdpbmFsUHJvdmlkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIHJlc2V0UHJ2aWRlcihwcm92aWRlcikge1xuICAgICAgICAgICAgdmFyIHBhcnRzID0gcHJvdmlkZXIuc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlUHJvdmlkZXJNYXAuY2FsbCh0aGlzLCBwYXJ0c1swXSk7XG4gICAgICAgICAgICAgICAgcGFydHMuZm9yRWFjaChyZW1vdmVQcm92aWRlck1hcCwgZ2V0TmVzdGVkQm90dGxlLmNhbGwodGhpcywgcGFydHNbMF0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlbW92ZVByb3ZpZGVyTWFwLmNhbGwodGhpcywgcHJvdmlkZXIpO1xuICAgICAgICAgICAgdGhpcy5wcm92aWRlcihwcm92aWRlciwgcHJvdmlkZXJzW3Byb3ZpZGVyXSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH07XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhbnkgZGVmZXJyZWQgZnVuY3Rpb25zXG4gICAgICpcbiAgICAgKiBAcGFyYW0gTWl4ZWQgZGF0YVxuICAgICAqIEByZXR1cm4gQm90dGxlXG4gICAgICovXG4gICAgdmFyIHJlc29sdmUgPSBmdW5jdGlvbiByZXNvbHZlKGRhdGEpIHtcbiAgICAgICAgdGhpcy5kZWZlcnJlZC5mb3JFYWNoKGZ1bmN0aW9uIGRlZmVycmVkSXRlcmF0b3IoZnVuYykge1xuICAgICAgICAgICAgZnVuYyhkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBzZXJ2aWNlIGluc2lkZSBhIGdlbmVyaWMgZmFjdG9yeS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBTdHJpbmcgbmFtZVxuICAgICAqIEBwYXJhbSBGdW5jdGlvbiBTZXJ2aWNlXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgc2VydmljZSA9IGZ1bmN0aW9uIHNlcnZpY2UobmFtZSwgU2VydmljZSkge1xuICAgICAgICB2YXIgZGVwcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogbnVsbDtcbiAgICAgICAgdmFyIGJvdHRsZSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBmYWN0b3J5LmNhbGwodGhpcywgbmFtZSwgZnVuY3Rpb24gR2VuZXJpY0ZhY3RvcnkoKSB7XG4gICAgICAgICAgICB2YXIgU2VydmljZUNvcHkgPSBTZXJ2aWNlO1xuICAgICAgICAgICAgaWYgKGRlcHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGRlcHMubWFwKGdldE5lc3RlZFNlcnZpY2UsIGJvdHRsZS5jb250YWluZXIpO1xuICAgICAgICAgICAgICAgIGFyZ3MudW5zaGlmdChTZXJ2aWNlKTtcbiAgICAgICAgICAgICAgICBTZXJ2aWNlQ29weSA9IFNlcnZpY2UuYmluZC5hcHBseShTZXJ2aWNlLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VydmljZUNvcHkoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhIHZhbHVlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWVcbiAgICAgKiBAcGFyYW0gbWl4ZWQgdmFsXG4gICAgICogQHJldHVybiBCb3R0bGVcbiAgICAgKi9cbiAgICB2YXIgdmFsdWUgPSBmdW5jdGlvbiB2YWx1ZShuYW1lLCB2YWwpIHtcbiAgICAgICAgdmFyIHBhcnRzO1xuICAgICAgICBwYXJ0cyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgbmFtZSA9IHBhcnRzLnBvcCgpO1xuICAgICAgICBkZWZpbmVWYWx1ZS5jYWxsKHBhcnRzLnJlZHVjZShzZXRWYWx1ZU9iamVjdCwgdGhpcy5jb250YWluZXIpLCBuYW1lLCB2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEl0ZXJhdG9yIGZvciBzZXR0aW5nIGEgcGxhaW4gb2JqZWN0IGxpdGVyYWwgdmlhIGRlZmluZVZhbHVlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gT2JqZWN0IGNvbnRhaW5lclxuICAgICAqIEBwYXJhbSBzdHJpbmcgbmFtZVxuICAgICAqL1xuICAgIHZhciBzZXRWYWx1ZU9iamVjdCA9IGZ1bmN0aW9uIHNldFZhbHVlT2JqZWN0KGNvbnRhaW5lciwgbmFtZSkge1xuICAgICAgICB2YXIgbmVzdGVkQ29udGFpbmVyID0gY29udGFpbmVyW25hbWVdO1xuICAgICAgICBpZiAoIW5lc3RlZENvbnRhaW5lcikge1xuICAgICAgICAgICAgbmVzdGVkQ29udGFpbmVyID0ge307XG4gICAgICAgICAgICBkZWZpbmVWYWx1ZS5jYWxsKGNvbnRhaW5lciwgbmFtZSwgbmVzdGVkQ29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmVzdGVkQ29udGFpbmVyO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRGVmaW5lIGEgbXV0YWJsZSBwcm9wZXJ0eSBvbiB0aGUgY29udGFpbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIFN0cmluZyBuYW1lXG4gICAgICogQHBhcmFtIG1peGVkIHZhbFxuICAgICAqIEByZXR1cm4gdm9pZFxuICAgICAqIEBzY29wZSBjb250YWluZXJcbiAgICAgKi9cbiAgICB2YXIgZGVmaW5lVmFsdWUgPSBmdW5jdGlvbiBkZWZpbmVWYWx1ZShuYW1lLCB2YWwpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZSA6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlIDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlIDogdmFsLFxuICAgICAgICAgICAgd3JpdGFibGUgOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQm90dGxlIGNvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0gU3RyaW5nIG5hbWUgT3B0aW9uYWwgbmFtZSBmb3IgZnVuY3Rpb25hbCBjb25zdHJ1Y3Rpb25cbiAgICAgKi9cbiAgICB2YXIgQm90dGxlID0gZnVuY3Rpb24gQm90dGxlKG5hbWUpIHtcbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJvdHRsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBCb3R0bGUucG9wKG5hbWUpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHRoaXMuaWQgPSBpZCsrO1xuICAgIFxuICAgICAgICB0aGlzLmRlY29yYXRvcnMgPSB7fTtcbiAgICAgICAgdGhpcy5taWRkbGV3YXJlcyA9IHt9O1xuICAgICAgICB0aGlzLm5lc3RlZCA9IHt9O1xuICAgICAgICB0aGlzLnByb3ZpZGVyTWFwID0ge307XG4gICAgICAgIHRoaXMub3JpZ2luYWxQcm92aWRlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5kZWZlcnJlZCA9IFtdO1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHtcbiAgICAgICAgICAgICRkZWNvcmF0b3IgOiBkZWNvcmF0b3IuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICRyZWdpc3RlciA6IHJlZ2lzdGVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICAkbGlzdCA6IGxpc3QuYmluZCh0aGlzKVxuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQm90dGxlIHByb3RvdHlwZVxuICAgICAqL1xuICAgIEJvdHRsZS5wcm90b3R5cGUgPSB7XG4gICAgICAgIGNvbnN0YW50IDogY29uc3RhbnQsXG4gICAgICAgIGRlY29yYXRvciA6IGRlY29yYXRvcixcbiAgICAgICAgZGVmZXIgOiBkZWZlcixcbiAgICAgICAgZGlnZXN0IDogZGlnZXN0LFxuICAgICAgICBmYWN0b3J5IDogZmFjdG9yeSxcbiAgICAgICAgaW5zdGFuY2VGYWN0b3J5OiBpbnN0YW5jZUZhY3RvcnksXG4gICAgICAgIGxpc3QgOiBsaXN0LFxuICAgICAgICBtaWRkbGV3YXJlIDogbWlkZGxld2FyZSxcbiAgICAgICAgcHJvdmlkZXIgOiBwcm92aWRlcixcbiAgICAgICAgcmVzZXRQcm92aWRlcnMgOiByZXNldFByb3ZpZGVycyxcbiAgICAgICAgcmVnaXN0ZXIgOiByZWdpc3RlcixcbiAgICAgICAgcmVzb2x2ZSA6IHJlc29sdmUsXG4gICAgICAgIHNlcnZpY2UgOiBzZXJ2aWNlLFxuICAgICAgICB2YWx1ZSA6IHZhbHVlXG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBCb3R0bGUgc3RhdGljXG4gICAgICovXG4gICAgQm90dGxlLnBvcCA9IHBvcDtcbiAgICBCb3R0bGUuY2xlYXIgPSBjbGVhcjtcbiAgICBCb3R0bGUubGlzdCA9IGxpc3Q7XG4gICAgXG4gICAgLyoqXG4gICAgICogR2xvYmFsIGNvbmZpZ1xuICAgICAqL1xuICAgIHZhciBnbG9iYWxDb25maWcgPSBCb3R0bGUuY29uZmlnID0ge1xuICAgICAgICBzdHJpY3QgOiBmYWxzZVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhwb3J0cyBzY3JpcHQgYWRhcHRlZCBmcm9tIGxvZGFzaCB2Mi40LjEgTW9kZXJuIEJ1aWxkXG4gICAgICpcbiAgICAgKiBAc2VlIGh0dHA6Ly9sb2Rhc2guY29tL1xuICAgICAqL1xuICAgIFxuICAgIC8qKlxuICAgICAqIFZhbGlkIG9iamVjdCB0eXBlIG1hcFxuICAgICAqXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgdmFyIG9iamVjdFR5cGVzID0ge1xuICAgICAgICAnZnVuY3Rpb24nIDogdHJ1ZSxcbiAgICAgICAgJ29iamVjdCcgOiB0cnVlXG4gICAgfTtcbiAgICBcbiAgICAoZnVuY3Rpb24gZXhwb3J0Qm90dGxlKHJvb3QpIHtcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZyZWUgdmFyaWFibGUgZXhwb3J0c1xuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGZyZWVFeHBvcnRzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGV4cG9ydHNdICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcbiAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZyZWUgdmFyaWFibGUgbW9kdWxlXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGZyZWVNb2R1bGUgPSBvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21tb25KUyBtb2R1bGUuZXhwb3J0c1xuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHMgJiYgZnJlZUV4cG9ydHM7XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGcmVlIHZhcmlhYmxlIGBnbG9iYWxgXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGZyZWVHbG9iYWwgPSBvYmplY3RUeXBlc1t0eXBlb2YgZ2xvYmFsXSAmJiBnbG9iYWw7XG4gICAgICAgIGlmIChmcmVlR2xvYmFsICYmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkpIHtcbiAgICAgICAgICAgIHJvb3QgPSBmcmVlR2xvYmFsO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeHBvcnRcbiAgICAgICAgICovXG4gICAgICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgICAgICByb290LkJvdHRsZSA9IEJvdHRsZTtcbiAgICAgICAgICAgIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIEJvdHRsZTsgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuICAgICAgICAgICAgaWYgKG1vZHVsZUV4cG9ydHMpIHtcbiAgICAgICAgICAgICAgICAoZnJlZU1vZHVsZS5leHBvcnRzID0gQm90dGxlKS5Cb3R0bGUgPSBCb3R0bGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZyZWVFeHBvcnRzLkJvdHRsZSA9IEJvdHRsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvb3QuQm90dGxlID0gQm90dGxlO1xuICAgICAgICB9XG4gICAgfSgob2JqZWN0VHlwZXNbdHlwZW9mIHdpbmRvd10gJiYgd2luZG93KSB8fCB0aGlzKSk7XG4gICAgXG59LmNhbGwodGhpcykpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7XG5cdHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gZ2V0U3RhY2soY29udGV4dCkge1xuXHRyZXR1cm4gY29udGV4dC4kJGxheW91dFN0YWNrIHx8IChcblx0XHRjb250ZXh0LiQkbGF5b3V0U3RhY2sgPSBbXVxuXHQpO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0YWNrKGNvbnRleHQpIHtcblx0dmFyIHN0YWNrID0gZ2V0U3RhY2soY29udGV4dCk7XG5cblx0d2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuXHRcdHN0YWNrLnNoaWZ0KCkoY29udGV4dCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9ucyhjb250ZXh0KSB7XG5cdHJldHVybiBjb250ZXh0LiQkbGF5b3V0QWN0aW9ucyB8fCAoXG5cdFx0Y29udGV4dC4kJGxheW91dEFjdGlvbnMgPSB7fVxuXHQpO1xufVxuXG5mdW5jdGlvbiBnZXRBY3Rpb25zQnlOYW1lKGNvbnRleHQsIG5hbWUpIHtcblx0dmFyIGFjdGlvbnMgPSBnZXRBY3Rpb25zKGNvbnRleHQpO1xuXG5cdHJldHVybiBhY3Rpb25zW25hbWVdIHx8IChcblx0XHRhY3Rpb25zW25hbWVdID0gW11cblx0KTtcbn1cblxuZnVuY3Rpb24gYXBwbHlBY3Rpb24odmFsLCBhY3Rpb24pIHtcblx0dmFyIGNvbnRleHQgPSB0aGlzO1xuXG5cdGZ1bmN0aW9uIGZuKCkge1xuXHRcdHJldHVybiBhY3Rpb24uZm4oY29udGV4dCwgYWN0aW9uLm9wdGlvbnMpO1xuXHR9XG5cblx0c3dpdGNoIChhY3Rpb24ubW9kZSkge1xuXHRcdGNhc2UgJ2FwcGVuZCc6IHtcblx0XHRcdHJldHVybiB2YWwgKyBmbigpO1xuXHRcdH1cblxuXHRcdGNhc2UgJ3ByZXBlbmQnOiB7XG5cdFx0XHRyZXR1cm4gZm4oKSArIHZhbDtcblx0XHR9XG5cblx0XHRjYXNlICdyZXBsYWNlJzoge1xuXHRcdFx0cmV0dXJuIGZuKCk7XG5cdFx0fVxuXG5cdFx0ZGVmYXVsdDoge1xuXHRcdFx0cmV0dXJuIHZhbDtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbWl4aW4odGFyZ2V0KSB7XG5cdHZhciBhcmcsIGtleSxcblx0XHRsZW4gPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGkgPSAxO1xuXG5cdGZvciAoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRhcmcgPSBhcmd1bWVudHNbaV07XG5cblx0XHRpZiAoIWFyZykge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Zm9yIChrZXkgaW4gYXJnKSB7XG5cdFx0XHQvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuXHRcdFx0aWYgKGhhc093bi5jYWxsKGFyZywga2V5KSkge1xuXHRcdFx0XHR0YXJnZXRba2V5XSA9IGFyZ1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGFuIG9iamVjdCBvZiBsYXlvdXQgaGVscGVycy5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKiBAcGFyYW0ge09iamVjdH0gaGFuZGxlYmFycyBIYW5kbGViYXJzIGluc3RhbmNlLlxuICogQHJldHVybiB7T2JqZWN0fSBPYmplY3Qgb2YgaGVscGVycy5cbiAqL1xuZnVuY3Rpb24gbGF5b3V0cyhoYW5kbGViYXJzKSB7XG5cdHZhciBoZWxwZXJzID0ge1xuXHRcdC8qKlxuXHRcdCAqIEBtZXRob2QgZXh0ZW5kXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcblx0XHQgKiBAcGFyYW0gez9PYmplY3R9IGN1c3RvbUNvbnRleHRcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb24oT2JqZWN0KX0gb3B0aW9ucy5mblxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLmhhc2hcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IFJlbmRlcmVkIHBhcnRpYWwuXG5cdFx0ICovXG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiAobmFtZSwgY3VzdG9tQ29udGV4dCwgb3B0aW9ucykge1xuXHRcdFx0Ly8gTWFrZSBgY3VzdG9tQ29udGV4dGAgb3B0aW9uYWxcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuXHRcdFx0XHRvcHRpb25zID0gY3VzdG9tQ29udGV4dDtcblx0XHRcdFx0Y3VzdG9tQ29udGV4dCA9IG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0XHR2YXIgZm4gPSBvcHRpb25zLmZuIHx8IG5vb3AsXG5cdFx0XHRcdGNvbnRleHQgPSBtaXhpbih7fSwgdGhpcywgY3VzdG9tQ29udGV4dCwgb3B0aW9ucy5oYXNoKSxcblx0XHRcdFx0ZGF0YSA9IGhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKSxcblx0XHRcdFx0dGVtcGxhdGUgPSBoYW5kbGViYXJzLnBhcnRpYWxzW25hbWVdO1xuXG5cdFx0XHQvLyBQYXJ0aWFsIHRlbXBsYXRlIHJlcXVpcmVkXG5cdFx0XHRpZiAodGVtcGxhdGUgPT0gbnVsbCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcGFydGlhbDogXFwnJyArIG5hbWUgKyAnXFwnJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvbXBpbGUgcGFydGlhbCwgaWYgbmVlZGVkXG5cdFx0XHRpZiAodHlwZW9mIHRlbXBsYXRlICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHRlbXBsYXRlID0gaGFuZGxlYmFycy5jb21waWxlKHRlbXBsYXRlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWRkIG92ZXJyaWRlcyB0byBzdGFja1xuXHRcdFx0Z2V0U3RhY2soY29udGV4dCkucHVzaChmbik7XG5cblx0XHRcdC8vIFJlbmRlciBwYXJ0aWFsXG5cdFx0XHRyZXR1cm4gdGVtcGxhdGUoY29udGV4dCwgeyBkYXRhOiBkYXRhIH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBAbWV0aG9kIGVtYmVkXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcblx0XHQgKiBAcGFyYW0gez9PYmplY3R9IGN1c3RvbUNvbnRleHRcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb24oT2JqZWN0KX0gb3B0aW9ucy5mblxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLmhhc2hcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IFJlbmRlcmVkIHBhcnRpYWwuXG5cdFx0ICovXG5cdFx0ZW1iZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBjb250ZXh0ID0gbWl4aW4oe30sIHRoaXMgfHwge30pO1xuXG5cdFx0XHQvLyBSZXNldCBjb250ZXh0XG5cdFx0XHRjb250ZXh0LiQkbGF5b3V0U3RhY2sgPSBudWxsO1xuXHRcdFx0Y29udGV4dC4kJGxheW91dEFjdGlvbnMgPSBudWxsO1xuXG5cdFx0XHQvLyBFeHRlbmRcblx0XHRcdHJldHVybiBoZWxwZXJzLmV4dGVuZC5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBAbWV0aG9kIGJsb2NrXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb24oT2JqZWN0KX0gb3B0aW9ucy5mblxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gTW9kaWZpZWQgYmxvY2sgY29udGVudC5cblx0XHQgKi9cblx0XHRibG9jazogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0XHR2YXIgZm4gPSBvcHRpb25zLmZuIHx8IG5vb3AsXG5cdFx0XHRcdGRhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSksXG5cdFx0XHRcdGNvbnRleHQgPSB0aGlzIHx8IHt9O1xuXG5cdFx0XHRhcHBseVN0YWNrKGNvbnRleHQpO1xuXG5cdFx0XHRyZXR1cm4gZ2V0QWN0aW9uc0J5TmFtZShjb250ZXh0LCBuYW1lKS5yZWR1Y2UoXG5cdFx0XHRcdGFwcGx5QWN0aW9uLmJpbmQoY29udGV4dCksXG5cdFx0XHRcdGZuKGNvbnRleHQsIHsgZGF0YTogZGF0YSB9KVxuXHRcdFx0KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQG1ldGhvZCBjb250ZW50XG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb24oT2JqZWN0KX0gb3B0aW9ucy5mblxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLmhhc2hcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5oYXNoLm1vZGVcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IEFsd2F5cyBlbXB0eS5cblx0XHQgKi9cblx0XHRjb250ZW50OiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRcdHZhciBmbiA9IG9wdGlvbnMuZm4sXG5cdFx0XHRcdGRhdGEgPSBoYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSksXG5cdFx0XHRcdGhhc2ggPSBvcHRpb25zLmhhc2ggfHwge30sXG5cdFx0XHRcdG1vZGUgPSBoYXNoLm1vZGUgfHwgJ3JlcGxhY2UnLFxuXHRcdFx0XHRjb250ZXh0ID0gdGhpcyB8fCB7fTtcblxuXHRcdFx0YXBwbHlTdGFjayhjb250ZXh0KTtcblxuXHRcdFx0Ly8gR2V0dGVyXG5cdFx0XHRpZiAoIWZuKSB7XG5cdFx0XHRcdHJldHVybiBuYW1lIGluIGdldEFjdGlvbnMoY29udGV4dCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldHRlclxuXHRcdFx0Z2V0QWN0aW9uc0J5TmFtZShjb250ZXh0LCBuYW1lKS5wdXNoKHtcblx0XHRcdFx0b3B0aW9uczogeyBkYXRhOiBkYXRhIH0sXG5cdFx0XHRcdG1vZGU6IG1vZGUudG9Mb3dlckNhc2UoKSxcblx0XHRcdFx0Zm46IGZuXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIGhlbHBlcnM7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGxheW91dCBoZWxwZXJzIG9uIGEgSGFuZGxlYmFycyBpbnN0YW5jZS5cbiAqXG4gKiBAbWV0aG9kIHJlZ2lzdGVyXG4gKiBAcGFyYW0ge09iamVjdH0gaGFuZGxlYmFycyBIYW5kbGViYXJzIGluc3RhbmNlLlxuICogQHJldHVybiB7T2JqZWN0fSBPYmplY3Qgb2YgaGVscGVycy5cbiAqIEBzdGF0aWNcbiAqL1xubGF5b3V0cy5yZWdpc3RlciA9IGZ1bmN0aW9uIChoYW5kbGViYXJzKSB7XG5cdHZhciBoZWxwZXJzID0gbGF5b3V0cyhoYW5kbGViYXJzKTtcblxuXHRoYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKGhlbHBlcnMpO1xuXG5cdHJldHVybiBoZWxwZXJzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsYXlvdXRzO1xuIiwiaW1wb3J0ICogYXMgYmFzZSBmcm9tICcuL2hhbmRsZWJhcnMvYmFzZSc7XG5cbi8vIEVhY2ggb2YgdGhlc2UgYXVnbWVudCB0aGUgSGFuZGxlYmFycyBvYmplY3QuIE5vIG5lZWQgdG8gc2V0dXAgaGVyZS5cbi8vIChUaGlzIGlzIGRvbmUgdG8gZWFzaWx5IHNoYXJlIGNvZGUgYmV0d2VlbiBjb21tb25qcyBhbmQgYnJvd3NlIGVudnMpXG5pbXBvcnQgU2FmZVN0cmluZyBmcm9tICcuL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2hhbmRsZWJhcnMvZXhjZXB0aW9uJztcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gJy4vaGFuZGxlYmFycy91dGlscyc7XG5pbXBvcnQgKiBhcyBydW50aW1lIGZyb20gJy4vaGFuZGxlYmFycy9ydW50aW1lJztcblxuaW1wb3J0IG5vQ29uZmxpY3QgZnJvbSAnLi9oYW5kbGViYXJzL25vLWNvbmZsaWN0JztcblxuLy8gRm9yIGNvbXBhdGliaWxpdHkgYW5kIHVzYWdlIG91dHNpZGUgb2YgbW9kdWxlIHN5c3RlbXMsIG1ha2UgdGhlIEhhbmRsZWJhcnMgb2JqZWN0IGEgbmFtZXNwYWNlXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBoYiA9IG5ldyBiYXNlLkhhbmRsZWJhcnNFbnZpcm9ubWVudCgpO1xuXG4gIFV0aWxzLmV4dGVuZChoYiwgYmFzZSk7XG4gIGhiLlNhZmVTdHJpbmcgPSBTYWZlU3RyaW5nO1xuICBoYi5FeGNlcHRpb24gPSBFeGNlcHRpb247XG4gIGhiLlV0aWxzID0gVXRpbHM7XG4gIGhiLmVzY2FwZUV4cHJlc3Npb24gPSBVdGlscy5lc2NhcGVFeHByZXNzaW9uO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn1cblxubGV0IGluc3QgPSBjcmVhdGUoKTtcbmluc3QuY3JlYXRlID0gY3JlYXRlO1xuXG5ub0NvbmZsaWN0KGluc3QpO1xuXG5pbnN0WydkZWZhdWx0J10gPSBpbnN0O1xuXG5leHBvcnQgZGVmYXVsdCBpbnN0O1xuIiwiaW1wb3J0IHtjcmVhdGVGcmFtZSwgZXh0ZW5kLCB0b1N0cmluZ30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4vZXhjZXB0aW9uJztcbmltcG9ydCB7cmVnaXN0ZXJEZWZhdWx0SGVscGVyc30gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCB7cmVnaXN0ZXJEZWZhdWx0RGVjb3JhdG9yc30gZnJvbSAnLi9kZWNvcmF0b3JzJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuXG5leHBvcnQgY29uc3QgVkVSU0lPTiA9ICc0LjAuMTEnO1xuZXhwb3J0IGNvbnN0IENPTVBJTEVSX1JFVklTSU9OID0gNztcblxuZXhwb3J0IGNvbnN0IFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPT0gMS54LngnLFxuICA1OiAnPT0gMi4wLjAtYWxwaGEueCcsXG4gIDY6ICc+PSAyLjAuMC1iZXRhLjEnLFxuICA3OiAnPj0gNC4wLjAnXG59O1xuXG5jb25zdCBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBIYW5kbGViYXJzRW52aXJvbm1lbnQoaGVscGVycywgcGFydGlhbHMsIGRlY29yYXRvcnMpIHtcbiAgdGhpcy5oZWxwZXJzID0gaGVscGVycyB8fCB7fTtcbiAgdGhpcy5wYXJ0aWFscyA9IHBhcnRpYWxzIHx8IHt9O1xuICB0aGlzLmRlY29yYXRvcnMgPSBkZWNvcmF0b3JzIHx8IHt9O1xuXG4gIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnModGhpcyk7XG4gIHJlZ2lzdGVyRGVmYXVsdERlY29yYXRvcnModGhpcyk7XG59XG5cbkhhbmRsZWJhcnNFbnZpcm9ubWVudC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBIYW5kbGViYXJzRW52aXJvbm1lbnQsXG5cbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIGxvZzogbG9nZ2VyLmxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7IHRocm93IG5ldyBFeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgICBleHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMuaGVscGVyc1tuYW1lXTtcbiAgfSxcblxuICByZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUsIHBhcnRpYWwpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgZXh0ZW5kKHRoaXMucGFydGlhbHMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHBhcnRpYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oYEF0dGVtcHRpbmcgdG8gcmVnaXN0ZXIgYSBwYXJ0aWFsIGNhbGxlZCBcIiR7bmFtZX1cIiBhcyB1bmRlZmluZWRgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBwYXJ0aWFsO1xuICAgIH1cbiAgfSxcbiAgdW5yZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5wYXJ0aWFsc1tuYW1lXTtcbiAgfSxcblxuICByZWdpc3RlckRlY29yYXRvcjogZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGZuKSB7IHRocm93IG5ldyBFeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgZGVjb3JhdG9ycycpOyB9XG4gICAgICBleHRlbmQodGhpcy5kZWNvcmF0b3JzLCBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWNvcmF0b3JzW25hbWVdID0gZm47XG4gICAgfVxuICB9LFxuICB1bnJlZ2lzdGVyRGVjb3JhdG9yOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMuZGVjb3JhdG9yc1tuYW1lXTtcbiAgfVxufTtcblxuZXhwb3J0IGxldCBsb2cgPSBsb2dnZXIubG9nO1xuXG5leHBvcnQge2NyZWF0ZUZyYW1lLCBsb2dnZXJ9O1xuIiwiaW1wb3J0IHJlZ2lzdGVySW5saW5lIGZyb20gJy4vZGVjb3JhdG9ycy9pbmxpbmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0RGVjb3JhdG9ycyhpbnN0YW5jZSkge1xuICByZWdpc3RlcklubGluZShpbnN0YW5jZSk7XG59XG5cbiIsImltcG9ydCB7ZXh0ZW5kfSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVyRGVjb3JhdG9yKCdpbmxpbmUnLCBmdW5jdGlvbihmbiwgcHJvcHMsIGNvbnRhaW5lciwgb3B0aW9ucykge1xuICAgIGxldCByZXQgPSBmbjtcbiAgICBpZiAoIXByb3BzLnBhcnRpYWxzKSB7XG4gICAgICBwcm9wcy5wYXJ0aWFscyA9IHt9O1xuICAgICAgcmV0ID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgICAvLyBDcmVhdGUgYSBuZXcgcGFydGlhbHMgc3RhY2sgZnJhbWUgcHJpb3IgdG8gZXhlYy5cbiAgICAgICAgbGV0IG9yaWdpbmFsID0gY29udGFpbmVyLnBhcnRpYWxzO1xuICAgICAgICBjb250YWluZXIucGFydGlhbHMgPSBleHRlbmQoe30sIG9yaWdpbmFsLCBwcm9wcy5wYXJ0aWFscyk7XG4gICAgICAgIGxldCByZXQgPSBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3JpZ2luYWw7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHByb3BzLnBhcnRpYWxzW29wdGlvbnMuYXJnc1swXV0gPSBvcHRpb25zLmZuO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG4iLCJcbmNvbnN0IGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5mdW5jdGlvbiBFeGNlcHRpb24obWVzc2FnZSwgbm9kZSkge1xuICBsZXQgbG9jID0gbm9kZSAmJiBub2RlLmxvYyxcbiAgICAgIGxpbmUsXG4gICAgICBjb2x1bW47XG4gIGlmIChsb2MpIHtcbiAgICBsaW5lID0gbG9jLnN0YXJ0LmxpbmU7XG4gICAgY29sdW1uID0gbG9jLnN0YXJ0LmNvbHVtbjtcblxuICAgIG1lc3NhZ2UgKz0gJyAtICcgKyBsaW5lICsgJzonICsgY29sdW1uO1xuICB9XG5cbiAgbGV0IHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG1lc3NhZ2UpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIEV4Y2VwdGlvbik7XG4gIH1cblxuICB0cnkge1xuICAgIGlmIChsb2MpIHtcbiAgICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG5cbiAgICAgIC8vIFdvcmsgYXJvdW5kIGlzc3VlIHVuZGVyIHNhZmFyaSB3aGVyZSB3ZSBjYW4ndCBkaXJlY3RseSBzZXQgdGhlIGNvbHVtbiB2YWx1ZVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjb2x1bW4nLCB7XG4gICAgICAgICAgdmFsdWU6IGNvbHVtbixcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChub3ApIHtcbiAgICAvKiBJZ25vcmUgaWYgdGhlIGJyb3dzZXIgaXMgdmVyeSBwYXJ0aWN1bGFyICovXG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnQgZGVmYXVsdCBFeGNlcHRpb247XG4iLCJpbXBvcnQgcmVnaXN0ZXJCbG9ja0hlbHBlck1pc3NpbmcgZnJvbSAnLi9oZWxwZXJzL2Jsb2NrLWhlbHBlci1taXNzaW5nJztcbmltcG9ydCByZWdpc3RlckVhY2ggZnJvbSAnLi9oZWxwZXJzL2VhY2gnO1xuaW1wb3J0IHJlZ2lzdGVySGVscGVyTWlzc2luZyBmcm9tICcuL2hlbHBlcnMvaGVscGVyLW1pc3NpbmcnO1xuaW1wb3J0IHJlZ2lzdGVySWYgZnJvbSAnLi9oZWxwZXJzL2lmJztcbmltcG9ydCByZWdpc3RlckxvZyBmcm9tICcuL2hlbHBlcnMvbG9nJztcbmltcG9ydCByZWdpc3Rlckxvb2t1cCBmcm9tICcuL2hlbHBlcnMvbG9va3VwJztcbmltcG9ydCByZWdpc3RlcldpdGggZnJvbSAnLi9oZWxwZXJzL3dpdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICByZWdpc3RlckJsb2NrSGVscGVyTWlzc2luZyhpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyRWFjaChpbnN0YW5jZSk7XG4gIHJlZ2lzdGVySGVscGVyTWlzc2luZyhpbnN0YW5jZSk7XG4gIHJlZ2lzdGVySWYoaW5zdGFuY2UpO1xuICByZWdpc3RlckxvZyhpbnN0YW5jZSk7XG4gIHJlZ2lzdGVyTG9va3VwKGluc3RhbmNlKTtcbiAgcmVnaXN0ZXJXaXRoKGluc3RhbmNlKTtcbn1cbiIsImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGNyZWF0ZUZyYW1lLCBpc0FycmF5fSBmcm9tICcuLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgbGV0IGludmVyc2UgPSBvcHRpb25zLmludmVyc2UsXG4gICAgICAgIGZuID0gb3B0aW9ucy5mbjtcblxuICAgIGlmIChjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmIChjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYgKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICAgICAgICBvcHRpb25zLmlkcyA9IFtvcHRpb25zLm5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuaWRzKSB7XG4gICAgICAgIGxldCBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgICAgZGF0YS5jb250ZXh0UGF0aCA9IGFwcGVuZENvbnRleHRQYXRoKG9wdGlvbnMuZGF0YS5jb250ZXh0UGF0aCwgb3B0aW9ucy5uYW1lKTtcbiAgICAgICAgb3B0aW9ucyA9IHtkYXRhOiBkYXRhfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSk7XG59XG4iLCJpbXBvcnQge2FwcGVuZENvbnRleHRQYXRoLCBibG9ja1BhcmFtcywgY3JlYXRlRnJhbWUsIGlzQXJyYXksIGlzRnVuY3Rpb259IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBFeGNlcHRpb24gZnJvbSAnLi4vZXhjZXB0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdNdXN0IHBhc3MgaXRlcmF0b3IgdG8gI2VhY2gnKTtcbiAgICB9XG5cbiAgICBsZXQgZm4gPSBvcHRpb25zLmZuLFxuICAgICAgICBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgcmV0ID0gJycsXG4gICAgICAgIGRhdGEsXG4gICAgICAgIGNvbnRleHRQYXRoO1xuXG4gICAgaWYgKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmlkcykge1xuICAgICAgY29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKSArICcuJztcbiAgICB9XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjSXRlcmF0aW9uKGZpZWxkLCBpbmRleCwgbGFzdCkge1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgZGF0YS5rZXkgPSBmaWVsZDtcbiAgICAgICAgZGF0YS5pbmRleCA9IGluZGV4O1xuICAgICAgICBkYXRhLmZpcnN0ID0gaW5kZXggPT09IDA7XG4gICAgICAgIGRhdGEubGFzdCA9ICEhbGFzdDtcblxuICAgICAgICBpZiAoY29udGV4dFBhdGgpIHtcbiAgICAgICAgICBkYXRhLmNvbnRleHRQYXRoID0gY29udGV4dFBhdGggKyBmaWVsZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ZpZWxkXSwge1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMoW2NvbnRleHRbZmllbGRdLCBmaWVsZF0sIFtjb250ZXh0UGF0aCArIGZpZWxkLCBudWxsXSlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IGNvbnRleHQubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgaW4gY29udGV4dCkge1xuICAgICAgICAgICAgZXhlY0l0ZXJhdGlvbihpLCBpLCBpID09PSBjb250ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHByaW9yS2V5O1xuXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYgKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgLy8gV2UncmUgcnVubmluZyB0aGUgaXRlcmF0aW9ucyBvbmUgc3RlcCBvdXQgb2Ygc3luYyBzbyB3ZSBjYW4gZGV0ZWN0XG4gICAgICAgICAgICAvLyB0aGUgbGFzdCBpdGVyYXRpb24gd2l0aG91dCBoYXZlIHRvIHNjYW4gdGhlIG9iamVjdCB0d2ljZSBhbmQgY3JlYXRlXG4gICAgICAgICAgICAvLyBhbiBpdGVybWVkaWF0ZSBrZXlzIGFycmF5LlxuICAgICAgICAgICAgaWYgKHByaW9yS2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJpb3JLZXkgPSBrZXk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwcmlvcktleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZXhlY0l0ZXJhdGlvbihwcmlvcktleSwgaSAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG4iLCJpbXBvcnQgRXhjZXB0aW9uIGZyb20gJy4uL2V4Y2VwdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oLyogW2FyZ3MsIF1vcHRpb25zICovKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vIEEgbWlzc2luZyBmaWVsZCBpbiBhIHt7Zm9vfX0gY29uc3RydWN0LlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU29tZW9uZSBpcyBhY3R1YWxseSB0cnlpbmcgdG8gY2FsbCBzb21ldGhpbmcsIGJsb3cgdXAuXG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdNaXNzaW5nIGhlbHBlcjogXCInICsgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXS5uYW1lICsgJ1wiJyk7XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCB7aXNFbXB0eSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCkgfHwgaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaH0pO1xuICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbigvKiBtZXNzYWdlLCBvcHRpb25zICovKSB7XG4gICAgbGV0IGFyZ3MgPSBbdW5kZWZpbmVkXSxcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICB9XG5cbiAgICBsZXQgbGV2ZWwgPSAxO1xuICAgIGlmIChvcHRpb25zLmhhc2gubGV2ZWwgIT0gbnVsbCkge1xuICAgICAgbGV2ZWwgPSBvcHRpb25zLmhhc2gubGV2ZWw7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwpIHtcbiAgICAgIGxldmVsID0gb3B0aW9ucy5kYXRhLmxldmVsO1xuICAgIH1cbiAgICBhcmdzWzBdID0gbGV2ZWw7XG5cbiAgICBpbnN0YW5jZS5sb2coLi4uIGFyZ3MpO1xuICB9KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb29rdXAnLCBmdW5jdGlvbihvYmosIGZpZWxkKSB7XG4gICAgcmV0dXJuIG9iaiAmJiBvYmpbZmllbGRdO1xuICB9KTtcbn1cbiIsImltcG9ydCB7YXBwZW5kQ29udGV4dFBhdGgsIGJsb2NrUGFyYW1zLCBjcmVhdGVGcmFtZSwgaXNFbXB0eSwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBsZXQgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKCFpc0VtcHR5KGNvbnRleHQpKSB7XG4gICAgICBsZXQgZGF0YSA9IG9wdGlvbnMuZGF0YTtcbiAgICAgIGlmIChvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5pZHMpIHtcbiAgICAgICAgZGF0YSA9IGNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gICAgICAgIGRhdGEuY29udGV4dFBhdGggPSBhcHBlbmRDb250ZXh0UGF0aChvcHRpb25zLmRhdGEuY29udGV4dFBhdGgsIG9wdGlvbnMuaWRzWzBdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zKFtjb250ZXh0XSwgW2RhdGEgJiYgZGF0YS5jb250ZXh0UGF0aF0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0pO1xufVxuIiwiaW1wb3J0IHtpbmRleE9mfSBmcm9tICcuL3V0aWxzJztcblxubGV0IGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiBbJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddLFxuICBsZXZlbDogJ2luZm8nLFxuXG4gIC8vIE1hcHMgYSBnaXZlbiBsZXZlbCB2YWx1ZSB0byB0aGUgYG1ldGhvZE1hcGAgaW5kZXhlcyBhYm92ZS5cbiAgbG9va3VwTGV2ZWw6IGZ1bmN0aW9uKGxldmVsKSB7XG4gICAgaWYgKHR5cGVvZiBsZXZlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBsZXZlbE1hcCA9IGluZGV4T2YobG9nZ2VyLm1ldGhvZE1hcCwgbGV2ZWwudG9Mb3dlckNhc2UoKSk7XG4gICAgICBpZiAobGV2ZWxNYXAgPj0gMCkge1xuICAgICAgICBsZXZlbCA9IGxldmVsTWFwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV2ZWwgPSBwYXJzZUludChsZXZlbCwgMTApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsZXZlbDtcbiAgfSxcblxuICAvLyBDYW4gYmUgb3ZlcnJpZGRlbiBpbiB0aGUgaG9zdCBlbnZpcm9ubWVudFxuICBsb2c6IGZ1bmN0aW9uKGxldmVsLCAuLi5tZXNzYWdlKSB7XG4gICAgbGV2ZWwgPSBsb2dnZXIubG9va3VwTGV2ZWwobGV2ZWwpO1xuXG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBsb2dnZXIubG9va3VwTGV2ZWwobG9nZ2VyLmxldmVsKSA8PSBsZXZlbCkge1xuICAgICAgbGV0IG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKCFjb25zb2xlW21ldGhvZF0pIHsgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgbWV0aG9kID0gJ2xvZyc7XG4gICAgICB9XG4gICAgICBjb25zb2xlW21ldGhvZF0oLi4ubWVzc2FnZSk7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgbG9nZ2VyO1xuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oSGFuZGxlYmFycykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBsZXQgcm9vdCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93LFxuICAgICAgJEhhbmRsZWJhcnMgPSByb290LkhhbmRsZWJhcnM7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIEhhbmRsZWJhcnMubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyb290LkhhbmRsZWJhcnMgPT09IEhhbmRsZWJhcnMpIHtcbiAgICAgIHJvb3QuSGFuZGxlYmFycyA9ICRIYW5kbGViYXJzO1xuICAgIH1cbiAgICByZXR1cm4gSGFuZGxlYmFycztcbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIFV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2V4Y2VwdGlvbic7XG5pbXBvcnQgeyBDT01QSUxFUl9SRVZJU0lPTiwgUkVWSVNJT05fQ0hBTkdFUywgY3JlYXRlRnJhbWUgfSBmcm9tICcuL2Jhc2UnO1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tSZXZpc2lvbihjb21waWxlckluZm8pIHtcbiAgY29uc3QgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mbyAmJiBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgICAgY3VycmVudFJldmlzaW9uID0gQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICBjb25zdCBydW50aW1lVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuICcgK1xuICAgICAgICAgICAgJ1BsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBydW50aW1lVmVyc2lvbnMgKyAnKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKCcgKyBjb21waWxlclZlcnNpb25zICsgJykuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiAnICtcbiAgICAgICAgICAgICdQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKCcgKyBjb21waWxlckluZm9bMV0gKyAnKS4nKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignTm8gZW52aXJvbm1lbnQgcGFzc2VkIHRvIHRlbXBsYXRlJyk7XG4gIH1cbiAgaWYgKCF0ZW1wbGF0ZVNwZWMgfHwgIXRlbXBsYXRlU3BlYy5tYWluKSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignVW5rbm93biB0ZW1wbGF0ZSBvYmplY3Q6ICcgKyB0eXBlb2YgdGVtcGxhdGVTcGVjKTtcbiAgfVxuXG4gIHRlbXBsYXRlU3BlYy5tYWluLmRlY29yYXRvciA9IHRlbXBsYXRlU3BlYy5tYWluX2Q7XG5cbiAgLy8gTm90ZTogVXNpbmcgZW52LlZNIHJlZmVyZW5jZXMgcmF0aGVyIHRoYW4gbG9jYWwgdmFyIHJlZmVyZW5jZXMgdGhyb3VnaG91dCB0aGlzIHNlY3Rpb24gdG8gYWxsb3dcbiAgLy8gZm9yIGV4dGVybmFsIHVzZXJzIHRvIG92ZXJyaWRlIHRoZXNlIGFzIHBzdWVkby1zdXBwb3J0ZWQgQVBJcy5cbiAgZW52LlZNLmNoZWNrUmV2aXNpb24odGVtcGxhdGVTcGVjLmNvbXBpbGVyKTtcblxuICBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsV3JhcHBlcihwYXJ0aWFsLCBjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgICAgY29udGV4dCA9IFV0aWxzLmV4dGVuZCh7fSwgY29udGV4dCwgb3B0aW9ucy5oYXNoKTtcbiAgICAgIGlmIChvcHRpb25zLmlkcykge1xuICAgICAgICBvcHRpb25zLmlkc1swXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFydGlhbCA9IGVudi5WTS5yZXNvbHZlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIGxldCByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5jYWxsKHRoaXMsIHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsICYmIGVudi5jb21waWxlKSB7XG4gICAgICBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJPcHRpb25zLCBlbnYpO1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5wYXJ0aWFsc1tvcHRpb25zLm5hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgIGlmIChvcHRpb25zLmluZGVudCkge1xuICAgICAgICBsZXQgbGluZXMgPSByZXN1bHQuc3BsaXQoJ1xcbicpO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGxpbmVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghbGluZXNbaV0gJiYgaSArIDEgPT09IGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpbmVzW2ldID0gb3B0aW9ucy5pbmRlbnQgKyBsaW5lc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ1RoZSBwYXJ0aWFsICcgKyBvcHRpb25zLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGUnKTtcbiAgICB9XG4gIH1cblxuICAvLyBKdXN0IGFkZCB3YXRlclxuICBsZXQgY29udGFpbmVyID0ge1xuICAgIHN0cmljdDogZnVuY3Rpb24ob2JqLCBuYW1lKSB7XG4gICAgICBpZiAoIShuYW1lIGluIG9iaikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbignXCInICsgbmFtZSArICdcIiBub3QgZGVmaW5lZCBpbiAnICsgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpbbmFtZV07XG4gICAgfSxcbiAgICBsb29rdXA6IGZ1bmN0aW9uKGRlcHRocywgbmFtZSkge1xuICAgICAgY29uc3QgbGVuID0gZGVwdGhzLmxlbmd0aDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGRlcHRoc1tpXSAmJiBkZXB0aHNbaV1bbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBkZXB0aHNbaV1bbmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGxhbWJkYTogZnVuY3Rpb24oY3VycmVudCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBjdXJyZW50ID09PSAnZnVuY3Rpb24nID8gY3VycmVudC5jYWxsKGNvbnRleHQpIDogY3VycmVudDtcbiAgICB9LFxuXG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcblxuICAgIGZuOiBmdW5jdGlvbihpKSB7XG4gICAgICBsZXQgcmV0ID0gdGVtcGxhdGVTcGVjW2ldO1xuICAgICAgcmV0LmRlY29yYXRvciA9IHRlbXBsYXRlU3BlY1tpICsgJ19kJ107XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG5cbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZGF0YSwgZGVjbGFyZWRCbG9ja1BhcmFtcywgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgICAgbGV0IHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSxcbiAgICAgICAgICBmbiA9IHRoaXMuZm4oaSk7XG4gICAgICBpZiAoZGF0YSB8fCBkZXB0aHMgfHwgYmxvY2tQYXJhbXMgfHwgZGVjbGFyZWRCbG9ja1BhcmFtcykge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuLCBkYXRhLCBkZWNsYXJlZEJsb2NrUGFyYW1zLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IHdyYXBQcm9ncmFtKHRoaXMsIGksIGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICB9LFxuXG4gICAgZGF0YTogZnVuY3Rpb24odmFsdWUsIGRlcHRoKSB7XG4gICAgICB3aGlsZSAodmFsdWUgJiYgZGVwdGgtLSkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgbGV0IG9iaiA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbiAmJiAocGFyYW0gIT09IGNvbW1vbikpIHtcbiAgICAgICAgb2JqID0gVXRpbHMuZXh0ZW5kKHt9LCBjb21tb24sIHBhcmFtKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuICAgIC8vIEFuIGVtcHR5IG9iamVjdCB0byB1c2UgYXMgcmVwbGFjZW1lbnQgZm9yIG51bGwtY29udGV4dHNcbiAgICBudWxsQ29udGV4dDogT2JqZWN0LnNlYWwoe30pLFxuXG4gICAgbm9vcDogZW52LlZNLm5vb3AsXG4gICAgY29tcGlsZXJJbmZvOiB0ZW1wbGF0ZVNwZWMuY29tcGlsZXJcbiAgfTtcblxuICBmdW5jdGlvbiByZXQoY29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGRhdGEgPSBvcHRpb25zLmRhdGE7XG5cbiAgICByZXQuX3NldHVwKG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsICYmIHRlbXBsYXRlU3BlYy51c2VEYXRhKSB7XG4gICAgICBkYXRhID0gaW5pdERhdGEoY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIGxldCBkZXB0aHMsXG4gICAgICAgIGJsb2NrUGFyYW1zID0gdGVtcGxhdGVTcGVjLnVzZUJsb2NrUGFyYW1zID8gW10gOiB1bmRlZmluZWQ7XG4gICAgaWYgKHRlbXBsYXRlU3BlYy51c2VEZXB0aHMpIHtcbiAgICAgIGlmIChvcHRpb25zLmRlcHRocykge1xuICAgICAgICBkZXB0aHMgPSBjb250ZXh0ICE9IG9wdGlvbnMuZGVwdGhzWzBdID8gW2NvbnRleHRdLmNvbmNhdChvcHRpb25zLmRlcHRocykgOiBvcHRpb25zLmRlcHRocztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlcHRocyA9IFtjb250ZXh0XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWluKGNvbnRleHQvKiwgb3B0aW9ucyovKSB7XG4gICAgICByZXR1cm4gJycgKyB0ZW1wbGF0ZVNwZWMubWFpbihjb250YWluZXIsIGNvbnRleHQsIGNvbnRhaW5lci5oZWxwZXJzLCBjb250YWluZXIucGFydGlhbHMsIGRhdGEsIGJsb2NrUGFyYW1zLCBkZXB0aHMpO1xuICAgIH1cbiAgICBtYWluID0gZXhlY3V0ZURlY29yYXRvcnModGVtcGxhdGVTcGVjLm1haW4sIG1haW4sIGNvbnRhaW5lciwgb3B0aW9ucy5kZXB0aHMgfHwgW10sIGRhdGEsIGJsb2NrUGFyYW1zKTtcbiAgICByZXR1cm4gbWFpbihjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxuICByZXQuaXNUb3AgPSB0cnVlO1xuXG4gIHJldC5fc2V0dXAgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMuaGVscGVycywgZW52LmhlbHBlcnMpO1xuXG4gICAgICBpZiAodGVtcGxhdGVTcGVjLnVzZVBhcnRpYWwpIHtcbiAgICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gY29udGFpbmVyLm1lcmdlKG9wdGlvbnMucGFydGlhbHMsIGVudi5wYXJ0aWFscyk7XG4gICAgICB9XG4gICAgICBpZiAodGVtcGxhdGVTcGVjLnVzZVBhcnRpYWwgfHwgdGVtcGxhdGVTcGVjLnVzZURlY29yYXRvcnMpIHtcbiAgICAgICAgY29udGFpbmVyLmRlY29yYXRvcnMgPSBjb250YWluZXIubWVyZ2Uob3B0aW9ucy5kZWNvcmF0b3JzLCBlbnYuZGVjb3JhdG9ycyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5oZWxwZXJzID0gb3B0aW9ucy5oZWxwZXJzO1xuICAgICAgY29udGFpbmVyLnBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICAgIGNvbnRhaW5lci5kZWNvcmF0b3JzID0gb3B0aW9ucy5kZWNvcmF0b3JzO1xuICAgIH1cbiAgfTtcblxuICByZXQuX2NoaWxkID0gZnVuY3Rpb24oaSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocykge1xuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlQmxvY2tQYXJhbXMgJiYgIWJsb2NrUGFyYW1zKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdtdXN0IHBhc3MgYmxvY2sgcGFyYW1zJyk7XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZVNwZWMudXNlRGVwdGhzICYmICFkZXB0aHMpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oJ211c3QgcGFzcyBwYXJlbnQgZGVwdGhzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgdGVtcGxhdGVTcGVjW2ldLCBkYXRhLCAwLCBibG9ja1BhcmFtcywgZGVwdGhzKTtcbiAgfTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBQcm9ncmFtKGNvbnRhaW5lciwgaSwgZm4sIGRhdGEsIGRlY2xhcmVkQmxvY2tQYXJhbXMsIGJsb2NrUGFyYW1zLCBkZXB0aHMpIHtcbiAgZnVuY3Rpb24gcHJvZyhjb250ZXh0LCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgY3VycmVudERlcHRocyA9IGRlcHRocztcbiAgICBpZiAoZGVwdGhzICYmIGNvbnRleHQgIT0gZGVwdGhzWzBdICYmICEoY29udGV4dCA9PT0gY29udGFpbmVyLm51bGxDb250ZXh0ICYmIGRlcHRoc1swXSA9PT0gbnVsbCkpIHtcbiAgICAgIGN1cnJlbnREZXB0aHMgPSBbY29udGV4dF0uY29uY2F0KGRlcHRocyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuKGNvbnRhaW5lcixcbiAgICAgICAgY29udGV4dCxcbiAgICAgICAgY29udGFpbmVyLmhlbHBlcnMsIGNvbnRhaW5lci5wYXJ0aWFscyxcbiAgICAgICAgb3B0aW9ucy5kYXRhIHx8IGRhdGEsXG4gICAgICAgIGJsb2NrUGFyYW1zICYmIFtvcHRpb25zLmJsb2NrUGFyYW1zXS5jb25jYXQoYmxvY2tQYXJhbXMpLFxuICAgICAgICBjdXJyZW50RGVwdGhzKTtcbiAgfVxuXG4gIHByb2cgPSBleGVjdXRlRGVjb3JhdG9ycyhmbiwgcHJvZywgY29udGFpbmVyLCBkZXB0aHMsIGRhdGEsIGJsb2NrUGFyYW1zKTtcblxuICBwcm9nLnByb2dyYW0gPSBpO1xuICBwcm9nLmRlcHRoID0gZGVwdGhzID8gZGVwdGhzLmxlbmd0aCA6IDA7XG4gIHByb2cuYmxvY2tQYXJhbXMgPSBkZWNsYXJlZEJsb2NrUGFyYW1zIHx8IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhcnRpYWwocGFydGlhbCwgY29udGV4dCwgb3B0aW9ucykge1xuICBpZiAoIXBhcnRpYWwpIHtcbiAgICBpZiAob3B0aW9ucy5uYW1lID09PSAnQHBhcnRpYWwtYmxvY2snKSB7XG4gICAgICBwYXJ0aWFsID0gb3B0aW9ucy5kYXRhWydwYXJ0aWFsLWJsb2NrJ107XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWwgPSBvcHRpb25zLnBhcnRpYWxzW29wdGlvbnMubmFtZV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCFwYXJ0aWFsLmNhbGwgJiYgIW9wdGlvbnMubmFtZSkge1xuICAgIC8vIFRoaXMgaXMgYSBkeW5hbWljIHBhcnRpYWwgdGhhdCByZXR1cm5lZCBhIHN0cmluZ1xuICAgIG9wdGlvbnMubmFtZSA9IHBhcnRpYWw7XG4gICAgcGFydGlhbCA9IG9wdGlvbnMucGFydGlhbHNbcGFydGlhbF07XG4gIH1cbiAgcmV0dXJuIHBhcnRpYWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgLy8gVXNlIHRoZSBjdXJyZW50IGNsb3N1cmUgY29udGV4dCB0byBzYXZlIHRoZSBwYXJ0aWFsLWJsb2NrIGlmIHRoaXMgcGFydGlhbFxuICBjb25zdCBjdXJyZW50UGFydGlhbEJsb2NrID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YVsncGFydGlhbC1ibG9jayddO1xuICBvcHRpb25zLnBhcnRpYWwgPSB0cnVlO1xuICBpZiAob3B0aW9ucy5pZHMpIHtcbiAgICBvcHRpb25zLmRhdGEuY29udGV4dFBhdGggPSBvcHRpb25zLmlkc1swXSB8fCBvcHRpb25zLmRhdGEuY29udGV4dFBhdGg7XG4gIH1cblxuICBsZXQgcGFydGlhbEJsb2NrO1xuICBpZiAob3B0aW9ucy5mbiAmJiBvcHRpb25zLmZuICE9PSBub29wKSB7XG4gICAgb3B0aW9ucy5kYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAvLyBXcmFwcGVyIGZ1bmN0aW9uIHRvIGdldCBhY2Nlc3MgdG8gY3VycmVudFBhcnRpYWxCbG9jayBmcm9tIHRoZSBjbG9zdXJlXG4gICAgbGV0IGZuID0gb3B0aW9ucy5mbjtcbiAgICBwYXJ0aWFsQmxvY2sgPSBvcHRpb25zLmRhdGFbJ3BhcnRpYWwtYmxvY2snXSA9IGZ1bmN0aW9uIHBhcnRpYWxCbG9ja1dyYXBwZXIoY29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgIC8vIFJlc3RvcmUgdGhlIHBhcnRpYWwtYmxvY2sgZnJvbSB0aGUgY2xvc3VyZSBmb3IgdGhlIGV4ZWN1dGlvbiBvZiB0aGUgYmxvY2tcbiAgICAgIC8vIGkuZS4gdGhlIHBhcnQgaW5zaWRlIHRoZSBibG9jayBvZiB0aGUgcGFydGlhbCBjYWxsLlxuICAgICAgb3B0aW9ucy5kYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICAgIG9wdGlvbnMuZGF0YVsncGFydGlhbC1ibG9jayddID0gY3VycmVudFBhcnRpYWxCbG9jaztcbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9O1xuICAgIGlmIChmbi5wYXJ0aWFscykge1xuICAgICAgb3B0aW9ucy5wYXJ0aWFscyA9IFV0aWxzLmV4dGVuZCh7fSwgb3B0aW9ucy5wYXJ0aWFscywgZm4ucGFydGlhbHMpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJ0aWFsID09PSB1bmRlZmluZWQgJiYgcGFydGlhbEJsb2NrKSB7XG4gICAgcGFydGlhbCA9IHBhcnRpYWxCbG9jaztcbiAgfVxuXG4gIGlmIChwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdUaGUgcGFydGlhbCAnICsgb3B0aW9ucy5uYW1lICsgJyBjb3VsZCBub3QgYmUgZm91bmQnKTtcbiAgfSBlbHNlIGlmIChwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9vcCgpIHsgcmV0dXJuICcnOyB9XG5cbmZ1bmN0aW9uIGluaXREYXRhKGNvbnRleHQsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8ICEoJ3Jvb3QnIGluIGRhdGEpKSB7XG4gICAgZGF0YSA9IGRhdGEgPyBjcmVhdGVGcmFtZShkYXRhKSA6IHt9O1xuICAgIGRhdGEucm9vdCA9IGNvbnRleHQ7XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIGV4ZWN1dGVEZWNvcmF0b3JzKGZuLCBwcm9nLCBjb250YWluZXIsIGRlcHRocywgZGF0YSwgYmxvY2tQYXJhbXMpIHtcbiAgaWYgKGZuLmRlY29yYXRvcikge1xuICAgIGxldCBwcm9wcyA9IHt9O1xuICAgIHByb2cgPSBmbi5kZWNvcmF0b3IocHJvZywgcHJvcHMsIGNvbnRhaW5lciwgZGVwdGhzICYmIGRlcHRoc1swXSwgZGF0YSwgYmxvY2tQYXJhbXMsIGRlcHRocyk7XG4gICAgVXRpbHMuZXh0ZW5kKHByb2csIHByb3BzKTtcbiAgfVxuICByZXR1cm4gcHJvZztcbn1cbiIsIi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5mdW5jdGlvbiBTYWZlU3RyaW5nKHN0cmluZykge1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcbn1cblxuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBTYWZlU3RyaW5nLnByb3RvdHlwZS50b0hUTUwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICcnICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTYWZlU3RyaW5nO1xuIiwiY29uc3QgZXNjYXBlID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgJ2AnOiAnJiN4NjA7JyxcbiAgJz0nOiAnJiN4M0Q7J1xufTtcblxuY29uc3QgYmFkQ2hhcnMgPSAvWyY8PlwiJ2A9XS9nLFxuICAgICAgcG9zc2libGUgPSAvWyY8PlwiJ2A9XS87XG5cbmZ1bmN0aW9uIGVzY2FwZUNoYXIoY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChvYmovKiAsIC4uLnNvdXJjZSAqLykge1xuICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvciAobGV0IGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXJndW1lbnRzW2ldLCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGxldCB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8vIFNvdXJjZWQgZnJvbSBsb2Rhc2hcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9sb2Rhc2gvYmxvYi9tYXN0ZXIvTElDRU5TRS50eHRcbi8qIGVzbGludC1kaXNhYmxlIGZ1bmMtc3R5bGUgKi9cbmxldCBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn07XG4vLyBmYWxsYmFjayBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQ2hyb21lIGFuZCBTYWZhcmlcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5pZiAoaXNGdW5jdGlvbigveC8pKSB7XG4gIGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG4gIH07XG59XG5leHBvcnQge2lzRnVuY3Rpb259O1xuLyogZXNsaW50LWVuYWJsZSBmdW5jLXN0eWxlICovXG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5leHBvcnQgY29uc3QgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSA/IHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nIDogZmFsc2U7XG59O1xuXG4vLyBPbGRlciBJRSB2ZXJzaW9ucyBkbyBub3QgZGlyZWN0bHkgc3VwcG9ydCBpbmRleE9mIHNvIHdlIG11c3QgaW1wbGVtZW50IG91ciBvd24sIHNhZGx5LlxuZXhwb3J0IGZ1bmN0aW9uIGluZGV4T2YoYXJyYXksIHZhbHVlKSB7XG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChhcnJheVtpXSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZUV4cHJlc3Npb24oc3RyaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgICBpZiAoc3RyaW5nICYmIHN0cmluZy50b0hUTUwpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9IVE1MKCk7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0gZWxzZSBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZyArICcnO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9ICcnICsgc3RyaW5nO1xuICB9XG5cbiAgaWYgKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGcmFtZShvYmplY3QpIHtcbiAgbGV0IGZyYW1lID0gZXh0ZW5kKHt9LCBvYmplY3QpO1xuICBmcmFtZS5fcGFyZW50ID0gb2JqZWN0O1xuICByZXR1cm4gZnJhbWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBibG9ja1BhcmFtcyhwYXJhbXMsIGlkcykge1xuICBwYXJhbXMucGF0aCA9IGlkcztcbiAgcmV0dXJuIHBhcmFtcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZENvbnRleHRQYXRoKGNvbnRleHRQYXRoLCBpZCkge1xuICByZXR1cm4gKGNvbnRleHRQYXRoID8gY29udGV4dFBhdGggKyAnLicgOiAnJykgKyBpZDtcbn1cbiIsIi8vIENyZWF0ZSBhIHNpbXBsZSBwYXRoIGFsaWFzIHRvIGFsbG93IGJyb3dzZXJpZnkgdG8gcmVzb2x2ZVxuLy8gdGhlIHJ1bnRpbWUgb24gYSBzdXBwb3J0ZWQgcGF0aC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUnKVsnZGVmYXVsdCddO1xuIiwiLypcclxuICogIENvcHlyaWdodCAyMDE0IEdhcnkgR3JlZW4uXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xyXG4gKiAgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiAgU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxyXG4gKiAgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKHdpbmRvdywgZmFjdG9yeSkge1xyXG5cclxuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxyXG5cdHtcclxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSh3aW5kb3cpO1xyXG5cdH1cclxuXHRlbHNlXHJcblx0e1xyXG5cdFx0d2luZG93LkxpZ2h0Um91dGVyID0gZmFjdG9yeSh3aW5kb3cpO1xyXG5cdH1cclxuXHJcbn0odHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiB3aW5kb3csIGZ1bmN0aW9uKHdpbmRvdykge1xyXG5cclxuXHRmdW5jdGlvbiBMaWdodFJvdXRlcihvcHRpb25zKVxyXG5cdHtcclxuXHRcdC8qKlxyXG5cdFx0ICogUGF0aCByb290ICh3aWxsIGJlIHN0cmlwcGVkIG91dCB3aGVuIHRlc3RpbmcgcGF0aC1iYXNlZCByb3V0ZXMpXHJcblx0XHQgKiBAdHlwZSBzdHJpbmdcclxuXHRcdCAqL1xyXG5cdFx0dGhpcy5wYXRoUm9vdCA9ICcnO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUm91dGVzXHJcblx0XHQgKiBAdHlwZSBhcnJheVxyXG5cdFx0ICovXHJcblx0XHR0aGlzLnJvdXRlcyA9IFtdO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRGVmYXVsdCByb3V0aW5nIHR5cGUgW2hhc2ggb3IgcGF0aF1cclxuXHRcdCAqIEB0eXBlIHN0cmluZ1xyXG5cdFx0ICovXHJcblx0XHR0aGlzLnR5cGUgPSAncGF0aCc7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXN0b20gcGF0aCAobWFpbmx5IHVzZWQgZm9yIHRlc3RpbmcpXHJcblx0XHQgKiBAdHlwZSBzdHJpbmdcclxuXHRcdCAqL1xyXG5cdFx0dGhpcy5wYXRoID0gbnVsbDtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1c3RvbSBoYXNoIChtYWlubHkgdXNlZCBmb3IgdGVzdGluZylcclxuXHRcdCAqIEB0eXBlIHN0cmluZ1xyXG5cdFx0ICovXHJcblx0XHR0aGlzLmhhc2ggPSBudWxsO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udGV4dCB0byBjYWxsIG1hdGNoZWQgcm91dGVzIHVuZGVyXHJcblx0XHQgKiBAdHlwZSB7bWl4ZWR9XHJcblx0XHQgKi9cclxuXHRcdHRoaXMuY29udGV4dCA9IHRoaXM7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBIYW5kbGVyIGZvciBzdHJpbmcgYmFzZWQgY2FsbGJhY2tzXHJcblx0XHQgKiBAdHlwZSB7b2JqZWN0fGZ1bmN0aW9ufVxyXG5cdFx0ICovXHJcblx0XHR0aGlzLmhhbmRsZXIgPSB3aW5kb3c7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBOYW1lZCBwYXJhbSByZXBsYWNlIGFuZCBtYXRjaGluZyByZWdleFxyXG5cdFx0ICogQHR5cGUge09iamVjdH1cclxuXHRcdCAqL1xyXG5cdFx0dmFyIG5hbWVkUGFyYW0gPSAnKFtcXFxcdy1dKyknO1xyXG5cdFx0dGhpcy5uYW1lZFBhcmFtID0ge1xyXG5cdFx0XHRtYXRjaDogbmV3IFJlZ0V4cCgneygnICsgbmFtZWRQYXJhbSArICcpfScsICdnJyksXHJcblx0XHRcdHJlcGxhY2U6IG5hbWVkUGFyYW1cclxuXHRcdH07XHJcblxyXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMudHlwZSkgICAgICB0aGlzLnNldFR5cGUob3B0aW9ucy50eXBlKTtcclxuXHRcdGlmIChvcHRpb25zLnBhdGgpICAgICAgdGhpcy5zZXRQYXRoKG9wdGlvbnMucGF0aCk7XHJcblx0XHRpZiAob3B0aW9ucy5wYXRoUm9vdCkgIHRoaXMuc2V0UGF0aFJvb3Qob3B0aW9ucy5wYXRoUm9vdCk7XHJcblx0XHRpZiAob3B0aW9ucy5oYXNoKSAgICAgIHRoaXMuc2V0SGFzaChvcHRpb25zLmhhc2gpO1xyXG5cdFx0aWYgKG9wdGlvbnMuY29udGV4dCkgICB0aGlzLnNldENvbnRleHQob3B0aW9ucy5jb250ZXh0KTtcclxuXHRcdGlmIChvcHRpb25zLmhhbmRsZXIpICAgdGhpcy5zZXRIYW5kbGVyKG9wdGlvbnMuaGFuZGxlcik7XHJcblxyXG5cdFx0aWYgKG9wdGlvbnMucm91dGVzKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgcm91dGU7XHJcblx0XHRcdGZvciAocm91dGUgaW4gb3B0aW9ucy5yb3V0ZXMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLmFkZChyb3V0ZSwgb3B0aW9ucy5yb3V0ZXNbcm91dGVdKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0TGlnaHRSb3V0ZXIucHJvdG90eXBlID0ge1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUm91dGUgY29uc3RydWN0b3JcclxuXHRcdCAqIEB0eXBlIHtSb3V0ZX1cclxuXHRcdCAqL1xyXG5cdFx0Um91dGU6IFJvdXRlLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQWRkIGEgcm91dGVcclxuXHRcdCAqIEBwYXJhbSBzdHJpbmd8UmVnRXhwICAgcm91dGVcclxuXHRcdCAqIEBwYXJhbSBzdHJpbmd8ZnVuY3Rpb24gY2FsbGJhY2tcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRhZGQ6IGZ1bmN0aW9uKHJvdXRlLCBjYWxsYmFjaykge1xyXG5cdFx0XHR0aGlzLnJvdXRlcy5wdXNoKG5ldyB0aGlzLlJvdXRlKHJvdXRlLCBjYWxsYmFjaywgdGhpcykpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRW1wdHkvY2xlYXIgYWxsIHRoZSByb3V0ZXNcclxuXHRcdCAqIEByZXR1cm4gc2VsZlxyXG5cdFx0ICovXHJcblx0XHRlbXB0eTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHRoaXMucm91dGVzID0gW107XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldCdzIHRoZSByb3V0aW5nIHR5cGVcclxuXHRcdCAqIEBwYXJhbSBzZWxmXHJcblx0XHQgKi9cclxuXHRcdHNldFR5cGU6IGZ1bmN0aW9uKHR5cGUpIHtcclxuXHRcdFx0dGhpcy50eXBlID0gdHlwZTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0IHRoZSBwYXRoIHJvb3QgdXJsXHJcblx0XHQgKiBAcGFyYW0gc3RyaW5nIHVybFxyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdHNldFBhdGhSb290OiBmdW5jdGlvbih1cmwpIHtcclxuXHRcdFx0dGhpcy5wYXRoUm9vdCA9IHVybDtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0cyB0aGUgY3VzdG9tIHBhdGggdG8gdGVzdCByb3V0ZXMgYWdhaW5zdFxyXG5cdFx0ICogQHBhcmFtICBzdHJpbmcgcGF0aFxyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdHNldFBhdGg6IGZ1bmN0aW9uKHBhdGgpIHtcclxuXHRcdFx0dGhpcy5wYXRoID0gcGF0aDtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0cyB0aGUgY3VzdG9tIGhhc2ggdG8gdGVzdCByb3V0ZXMgYWdhaW5zdFxyXG5cdFx0ICogQHBhcmFtICBzdHJpbmcgaGFzaFxyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdHNldEhhc2g6IGZ1bmN0aW9uKGhhc2gpIHtcclxuXHRcdFx0dGhpcy5oYXNoID0gaGFzaDtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0cyBjb250ZXh0IHRvIGNhbGwgbWF0Y2hlZCByb3V0ZXMgdW5kZXJcclxuXHRcdCAqIEBwYXJhbSAgbWl4ZWQgY29udGV4dFxyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdHNldENvbnRleHQ6IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuXHRcdFx0dGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0IGhhbmRsZXJcclxuXHRcdCAqIEBwYXJhbSAgbWl4ZWQgY29udGV4dFxyXG5cdFx0ICogQHJldHVybiBzZWxmXHJcblx0XHQgKi9cclxuXHRcdHNldEhhbmRsZXI6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcclxuXHRcdFx0dGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0cyB0aGUgdXJsIHRvIHRlc3QgdGhlIHJvdXRlcyBhZ2FpbnN0XHJcblx0XHQgKiBAcmV0dXJuIHNlbGZcclxuXHRcdCAqL1xyXG5cdFx0Z2V0VXJsOiBmdW5jdGlvbihyb3V0ZVR5cGUpIHtcclxuXHJcblx0XHRcdHZhciB1cmw7XHJcblx0XHRcdHJvdXRlVHlwZSA9IHJvdXRlVHlwZSB8fCB0aGlzLnR5cGU7XHJcblxyXG5cdFx0XHRpZiAocm91dGVUeXBlID09ICdwYXRoJylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciByb290UmVnZXggPSBuZXcgUmVnRXhwKCdeJyArIHRoaXMucGF0aFJvb3QgKyAnLz8nKTtcclxuXHRcdFx0XHR1cmwgPSB0aGlzLnBhdGggfHwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZygxKTtcclxuXHRcdFx0XHR1cmwgPSB1cmwucmVwbGFjZShyb290UmVnZXgsICcnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChyb3V0ZVR5cGUgPT0gJ2hhc2gnKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dXJsID0gdGhpcy5oYXNoIHx8IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gZGVjb2RlVVJJKHVybCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQXR0ZW1wdCB0byBtYXRjaCBhIG9uZS10aW1lIHJvdXRlIGFuZCBjYWxsYmFja1xyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSAge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHBhcmFtICB7Y2xvc3VyZXxzdHJpbmd9IGNhbGxiYWNrXHJcblx0XHQgKiBAcmV0dXJuIHttaXhlZH1cclxuXHRcdCAqL1xyXG5cdFx0bWF0Y2g6IGZ1bmN0aW9uKHBhdGgsIGNhbGxiYWNrKSB7XHJcblx0XHRcdHZhciByb3V0ZSA9IG5ldyB0aGlzLlJvdXRlKHBhdGgsIGNhbGxiYWNrLCB0aGlzKTtcclxuXHRcdFx0aWYgKHJvdXRlLnRlc3QodGhpcy5nZXRVcmwoKSkpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXR1cm4gcm91dGUucnVuKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSdW4gdGhlIHJvdXRlclxyXG5cdFx0ICogQHJldHVybiBSb3V0ZXx1bmRlZmluZWRcclxuXHRcdCAqL1xyXG5cdFx0cnVuOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIHVybCA9IHRoaXMuZ2V0VXJsKCksIHJvdXRlO1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSBpbiB0aGlzLnJvdXRlcylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIEdldCB0aGUgcm91dGVcclxuXHRcdFx0XHRyb3V0ZSA9IHRoaXMucm91dGVzW2ldO1xyXG5cclxuXHRcdFx0XHQvLyBUZXN0IGFuZCBydW4gdGhlIHJvdXRlIGlmIGl0IG1hdGNoZXNcclxuXHRcdFx0XHRpZiAocm91dGUudGVzdCh1cmwpKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJvdXRlLnJ1bigpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHJvdXRlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBSb3V0ZSBvYmplY3RcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBjbG9zdXJlXHJcblx0ICogQHBhcmFtIHtMaWdodFJvdXRlcn0gcm91dGVyICBJbnN0YW5jZSBvZiB0aGUgbGlnaHQgcm91dGVyIHRoZSByb3V0ZSBiZWxvbmdzIHRvLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIFJvdXRlKHBhdGgsIGNhbGxiYWNrLCByb3V0ZXIpXHJcblx0e1xyXG5cdFx0dGhpcy5wYXRoID0gcGF0aDtcclxuXHRcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuXHRcdHRoaXMucm91dGVyID0gcm91dGVyO1xyXG5cdFx0dGhpcy52YWx1ZXMgPSBbXTtcclxuXHR9XHJcblxyXG5cdFJvdXRlLnByb3RvdHlwZSA9IHtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnZlcnRzIHJvdXRlIHRvIGEgcmVnZXggKGlmIHJlcXVpcmVkKSBzbyB0aGF0IGl0J3Mgc3VpdGFibGUgZm9yIG1hdGNoaW5nIGFnYWluc3QuXHJcblx0XHQgKiBAcGFyYW0gIHN0cmluZyByb3V0ZVxyXG5cdFx0ICogQHJldHVybiBSZWdFeHBcclxuXHRcdCAqL1xyXG5cdFx0cmVnZXg6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0dmFyIHBhdGggPSB0aGlzLnBhdGg7XHJcblxyXG5cdFx0XHRpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgcGF0aC5yZXBsYWNlKC9cXC8vZywgJ1xcXFwvJykucmVwbGFjZSh0aGlzLnJvdXRlci5uYW1lZFBhcmFtLm1hdGNoLCB0aGlzLnJvdXRlci5uYW1lZFBhcmFtLnJlcGxhY2UpICsgJyQnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcGF0aDtcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgdGhlIG1hdGNoaW5nIHBhcmFtIGtleXNcclxuXHRcdCAqIEByZXR1cm4gb2JqZWN0ICBPYmplY3Qga2V5ZWQgd2l0aCBwYXJhbSBuYW1lIChvciBpbmRleCkgd2l0aCB0aGUgdmFsdWUuXHJcblx0XHQgKi9cclxuXHRcdHBhcmFtczogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHR2YXIgb2JqID0ge30sIG5hbWUsIHZhbHVlcyA9IHRoaXMudmFsdWVzLCBwYXJhbXMgPSB2YWx1ZXMsIGksIHQgPSAwLCBwYXRoID0gdGhpcy5wYXRoO1xyXG5cclxuXHRcdFx0aWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHQgPSAxO1xyXG5cdFx0XHRcdHBhcmFtcyA9IHBhdGgubWF0Y2godGhpcy5yb3V0ZXIubmFtZWRQYXJhbS5tYXRjaCk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZvciAoaSBpbiBwYXJhbXMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lID0gdCA/IHBhcmFtc1tpXS5yZXBsYWNlKHRoaXMucm91dGVyLm5hbWVkUGFyYW0ubWF0Y2gsICckMScpIDogaTtcclxuXHRcdFx0XHRvYmpbbmFtZV0gPSB2YWx1ZXNbaV07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBvYmo7XHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGVzdCB0aGUgcm91dGUgdG8gc2VlIGlmIGl0IG1hdGNoZXNcclxuXHRcdCAqIEBwYXJhbSAge3N0cmluZ30gdXJsIFVybCB0byBtYXRjaCBhZ2FpbnN0XHJcblx0XHQgKiBAcmV0dXJuIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHR0ZXN0OiBmdW5jdGlvbih1cmwpIHtcclxuXHRcdFx0dmFyIG1hdGNoZXM7XHJcblx0XHRcdGlmIChtYXRjaGVzID0gdXJsLm1hdGNoKHRoaXMucmVnZXgoKSkpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLnZhbHVlcyA9IG1hdGNoZXMuc2xpY2UoMSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJ1biB0aGUgcm91dGUgY2FsbGJhY2sgd2l0aCB0aGUgbWF0Y2hlZCBwYXJhbXNcclxuXHRcdCAqIEByZXR1cm4ge21peGVkfVxyXG5cdFx0ICovXHJcblx0XHRydW46IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAodHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICdzdHJpbmcnKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMucm91dGVyLmhhbmRsZXJbdGhpcy5jYWxsYmFja10odGhpcy5wYXJhbXMoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXMuY2FsbGJhY2suYXBwbHkodGhpcy5yb3V0ZXIuY29udGV4dCwgW3RoaXMucGFyYW1zKCldKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRyZXR1cm4gTGlnaHRSb3V0ZXI7XHJcblxyXG59KSk7IiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjEyLjJcbihmdW5jdGlvbigpIHtcbiAgdmFyIGdldE5hbm9TZWNvbmRzLCBocnRpbWUsIGxvYWRUaW1lLCBtb2R1bGVMb2FkVGltZSwgbm9kZUxvYWRUaW1lLCB1cFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbm9kZUxvYWRUaW1lKSAvIDFlNjtcbiAgICB9O1xuICAgIGhydGltZSA9IHByb2Nlc3MuaHJ0aW1lO1xuICAgIGdldE5hbm9TZWNvbmRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaHI7XG4gICAgICBociA9IGhydGltZSgpO1xuICAgICAgcmV0dXJuIGhyWzBdICogMWU5ICsgaHJbMV07XG4gICAgfTtcbiAgICBtb2R1bGVMb2FkVGltZSA9IGdldE5hbm9TZWNvbmRzKCk7XG4gICAgdXBUaW1lID0gcHJvY2Vzcy51cHRpbWUoKSAqIDFlOTtcbiAgICBub2RlTG9hZFRpbWUgPSBtb2R1bGVMb2FkVGltZSAtIHVwVGltZTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGVyZm9ybWFuY2Utbm93LmpzLm1hcFxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qKlxuICogWmVzdCAoaHR0cHM6Ly9naXRodWIuY29tL2NoamovemVzdClcbiAqIEEgY3NzIHNlbGVjdG9yIGVuZ2luZS5cbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDEyLCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICovXG5cbi8vIFRPRE9cbi8vIC0gUmVjb2duaXplIHRoZSBUUiBzdWJqZWN0IHNlbGVjdG9yIHdoZW4gcGFyc2luZy5cbi8vIC0gUGFzcyBjb250ZXh0IHRvIHNjb3BlLlxuLy8gLSBBZGQgOmNvbHVtbiBwc2V1ZG8tY2xhc3Nlcy5cblxuOyhmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBTaGFyZWRcbiAqL1xuXG52YXIgd2luZG93ID0gdGhpc1xuICAsIGRvY3VtZW50ID0gdGhpcy5kb2N1bWVudFxuICAsIG9sZCA9IHRoaXMuemVzdDtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cblxudmFyIGNvbXBhcmVEb2N1bWVudFBvc2l0aW9uID0gKGZ1bmN0aW9uKCkge1xuICBpZiAoZG9jdW1lbnQuY29tcGFyZURvY3VtZW50UG9zaXRpb24pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYik7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBlbCA9IGEub3duZXJEb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpXG4gICAgICAsIGkgPSBlbC5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoZWxbaV0gPT09IGEpIHJldHVybiAyO1xuICAgICAgaWYgKGVsW2ldID09PSBiKSByZXR1cm4gNDtcbiAgICB9XG5cbiAgICByZXR1cm4gMTtcbiAgfTtcbn0pKCk7XG5cbnZhciBvcmRlciA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGEsIGIpICYgMiA/IDEgOiAtMTtcbn07XG5cbnZhciBuZXh0ID0gZnVuY3Rpb24oZWwpIHtcbiAgd2hpbGUgKChlbCA9IGVsLm5leHRTaWJsaW5nKVxuICAgICAgICAgJiYgZWwubm9kZVR5cGUgIT09IDEpO1xuICByZXR1cm4gZWw7XG59O1xuXG52YXIgcHJldiA9IGZ1bmN0aW9uKGVsKSB7XG4gIHdoaWxlICgoZWwgPSBlbC5wcmV2aW91c1NpYmxpbmcpXG4gICAgICAgICAmJiBlbC5ub2RlVHlwZSAhPT0gMSk7XG4gIHJldHVybiBlbDtcbn07XG5cbnZhciBjaGlsZCA9IGZ1bmN0aW9uKGVsKSB7XG4gIGlmIChlbCA9IGVsLmZpcnN0Q2hpbGQpIHtcbiAgICB3aGlsZSAoZWwubm9kZVR5cGUgIT09IDFcbiAgICAgICAgICAgJiYgKGVsID0gZWwubmV4dFNpYmxpbmcpKTtcbiAgfVxuICByZXR1cm4gZWw7XG59O1xuXG52YXIgbGFzdENoaWxkID0gZnVuY3Rpb24oZWwpIHtcbiAgaWYgKGVsID0gZWwubGFzdENoaWxkKSB7XG4gICAgd2hpbGUgKGVsLm5vZGVUeXBlICE9PSAxXG4gICAgICAgICAgICYmIChlbCA9IGVsLnByZXZpb3VzU2libGluZykpO1xuICB9XG4gIHJldHVybiBlbDtcbn07XG5cbnZhciB1bnF1b3RlID0gZnVuY3Rpb24oc3RyKSB7XG4gIGlmICghc3RyKSByZXR1cm4gc3RyO1xuICB2YXIgY2ggPSBzdHJbMF07XG4gIHJldHVybiBjaCA9PT0gJ1wiJyB8fCBjaCA9PT0gJ1xcJydcbiAgICA/IHN0ci5zbGljZSgxLCAtMSlcbiAgICA6IHN0cjtcbn07XG5cbnZhciBpbmRleE9mID0gKGZ1bmN0aW9uKCkge1xuICBpZiAoQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmluZGV4T2Y7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlbSkge1xuICAgIHZhciBpID0gdGhpcy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH07XG59KSgpO1xuXG52YXIgbWFrZUluc2lkZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlZ2V4ID0gcnVsZXMuaW5zaWRlLnNvdXJjZVxuICAgIC5yZXBsYWNlKC88L2csIHN0YXJ0KVxuICAgIC5yZXBsYWNlKC8+L2csIGVuZCk7XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgpO1xufTtcblxudmFyIHJlcGxhY2UgPSBmdW5jdGlvbihyZWdleCwgbmFtZSwgdmFsKSB7XG4gIHJlZ2V4ID0gcmVnZXguc291cmNlO1xuICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsLnNvdXJjZSB8fCB2YWwpO1xuICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCk7XG59O1xuXG52YXIgdHJ1bmNhdGVVcmwgPSBmdW5jdGlvbih1cmwsIG51bSkge1xuICByZXR1cm4gdXJsXG4gICAgLnJlcGxhY2UoL14oPzpcXHcrOlxcL1xcL3xcXC8rKS8sICcnKVxuICAgIC5yZXBsYWNlKC8oPzpcXC8rfFxcLyojLio/KSQvLCAnJylcbiAgICAuc3BsaXQoJy8nLCBudW0pXG4gICAgLmpvaW4oJy8nKTtcbn07XG5cbi8qKlxuICogSGFuZGxlIGBudGhgIFNlbGVjdG9yc1xuICovXG5cbnZhciBwYXJzZU50aCA9IGZ1bmN0aW9uKHBhcmFtLCB0ZXN0KSB7XG4gIHZhciBwYXJhbSA9IHBhcmFtLnJlcGxhY2UoL1xccysvZywgJycpXG4gICAgLCBjYXA7XG5cbiAgaWYgKHBhcmFtID09PSAnZXZlbicpIHtcbiAgICBwYXJhbSA9ICcybiswJztcbiAgfSBlbHNlIGlmIChwYXJhbSA9PT0gJ29kZCcpIHtcbiAgICBwYXJhbSA9ICcybisxJztcbiAgfSBlbHNlIGlmICghfnBhcmFtLmluZGV4T2YoJ24nKSkge1xuICAgIHBhcmFtID0gJzBuJyArIHBhcmFtO1xuICB9XG5cbiAgY2FwID0gL14oWystXSk/KFxcZCspP24oWystXSk/KFxcZCspPyQvLmV4ZWMocGFyYW0pO1xuXG4gIHJldHVybiB7XG4gICAgZ3JvdXA6IGNhcFsxXSA9PT0gJy0nXG4gICAgICA/IC0oY2FwWzJdIHx8IDEpXG4gICAgICA6ICsoY2FwWzJdIHx8IDEpLFxuICAgIG9mZnNldDogY2FwWzRdXG4gICAgICA/IChjYXBbM10gPT09ICctJyA/IC1jYXBbNF0gOiArY2FwWzRdKVxuICAgICAgOiAwXG4gIH07XG59O1xuXG52YXIgbnRoID0gZnVuY3Rpb24ocGFyYW0sIHRlc3QsIGxhc3QpIHtcbiAgdmFyIHBhcmFtID0gcGFyc2VOdGgocGFyYW0pXG4gICAgLCBncm91cCA9IHBhcmFtLmdyb3VwXG4gICAgLCBvZmZzZXQgPSBwYXJhbS5vZmZzZXRcbiAgICAsIGZpbmQgPSAhbGFzdCA/IGNoaWxkIDogbGFzdENoaWxkXG4gICAgLCBhZHZhbmNlID0gIWxhc3QgPyBuZXh0IDogcHJldjtcblxuICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoZWwucGFyZW50Tm9kZS5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuO1xuXG4gICAgdmFyIHJlbCA9IGZpbmQoZWwucGFyZW50Tm9kZSlcbiAgICAgICwgcG9zID0gMDtcblxuICAgIHdoaWxlIChyZWwpIHtcbiAgICAgIGlmICh0ZXN0KHJlbCwgZWwpKSBwb3MrKztcbiAgICAgIGlmIChyZWwgPT09IGVsKSB7XG4gICAgICAgIHBvcyAtPSBvZmZzZXQ7XG4gICAgICAgIHJldHVybiBncm91cCAmJiBwb3NcbiAgICAgICAgICA/ICEocG9zICUgZ3JvdXApICYmIChwb3MgPCAwID09PSBncm91cCA8IDApXG4gICAgICAgICAgOiAhcG9zO1xuICAgICAgfVxuICAgICAgcmVsID0gYWR2YW5jZShyZWwpO1xuICAgIH1cbiAgfTtcbn07XG5cbi8qKlxuICogU2ltcGxlIFNlbGVjdG9yc1xuICovXG5cbnZhciBzZWxlY3RvcnMgPSB7XG4gICcqJzogKGZ1bmN0aW9uKCkge1xuICAgIGlmIChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJykpO1xuICAgICAgcmV0dXJuICEhZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJyonKVswXTtcbiAgICB9KCkpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgICBpZiAoZWwubm9kZVR5cGUgPT09IDEpIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfSkoKSxcbiAgJ3R5cGUnOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiBlbC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSB0eXBlO1xuICAgIH07XG4gIH0sXG4gICdhdHRyJzogZnVuY3Rpb24oa2V5LCBvcCwgdmFsLCBpKSB7XG4gICAgb3AgPSBvcGVyYXRvcnNbb3BdO1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgdmFyIGF0dHI7XG4gICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdmb3InOlxuICAgICAgICAgIGF0dHIgPSBlbC5odG1sRm9yO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjbGFzcyc6XG4gICAgICAgICAgLy8gY2xhc3NOYW1lIGlzICcnIHdoZW4gbm9uLWV4aXN0ZW50XG4gICAgICAgICAgLy8gZ2V0QXR0cmlidXRlKCdjbGFzcycpIGlzIG51bGxcbiAgICAgICAgICBhdHRyID0gZWwuY2xhc3NOYW1lO1xuICAgICAgICAgIGlmIChhdHRyID09PSAnJyAmJiBlbC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXR0ciA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdocmVmJzpcbiAgICAgICAgICBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJywgMik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RpdGxlJzpcbiAgICAgICAgICAvLyBnZXRBdHRyaWJ1dGUoJ3RpdGxlJykgY2FuIGJlICcnIHdoZW4gbm9uLWV4aXN0ZW50IHNvbWV0aW1lcz9cbiAgICAgICAgICBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKCd0aXRsZScpIHx8IG51bGw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2lkJzpcbiAgICAgICAgICBpZiAoZWwuZ2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgICBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGF0dHIgPSBlbFtrZXldICE9IG51bGxcbiAgICAgICAgICAgID8gZWxba2V5XVxuICAgICAgICAgICAgOiBlbC5nZXRBdHRyaWJ1dGUgJiYgZWwuZ2V0QXR0cmlidXRlKGtleSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoYXR0ciA9PSBudWxsKSByZXR1cm47XG4gICAgICBhdHRyID0gYXR0ciArICcnO1xuICAgICAgaWYgKGkpIHtcbiAgICAgICAgYXR0ciA9IGF0dHIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdmFsID0gdmFsLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3AoYXR0ciwgdmFsKTtcbiAgICB9O1xuICB9LFxuICAnOmZpcnN0LWNoaWxkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIXByZXYoZWwpICYmIGVsLnBhcmVudE5vZGUubm9kZVR5cGUgPT09IDE7XG4gIH0sXG4gICc6bGFzdC1jaGlsZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFuZXh0KGVsKSAmJiBlbC5wYXJlbnROb2RlLm5vZGVUeXBlID09PSAxO1xuICB9LFxuICAnOm9ubHktY2hpbGQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhcHJldihlbCkgJiYgIW5leHQoZWwpXG4gICAgICAmJiBlbC5wYXJlbnROb2RlLm5vZGVUeXBlID09PSAxO1xuICB9LFxuICAnOm50aC1jaGlsZCc6IGZ1bmN0aW9uKHBhcmFtLCBsYXN0KSB7XG4gICAgcmV0dXJuIG50aChwYXJhbSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCBsYXN0KTtcbiAgfSxcbiAgJzpudGgtbGFzdC1jaGlsZCc6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yc1snOm50aC1jaGlsZCddKHBhcmFtLCB0cnVlKTtcbiAgfSxcbiAgJzpyb290JzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gZWwub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPT09IGVsO1xuICB9LFxuICAnOmVtcHR5JzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIWVsLmZpcnN0Q2hpbGQ7XG4gIH0sXG4gICc6bm90JzogZnVuY3Rpb24oc2VsKSB7XG4gICAgdmFyIHRlc3QgPSBjb21waWxlR3JvdXAoc2VsKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiAhdGVzdChlbCk7XG4gICAgfTtcbiAgfSxcbiAgJzpmaXJzdC1vZi10eXBlJzogZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoZWwucGFyZW50Tm9kZS5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuO1xuICAgIHZhciB0eXBlID0gZWwubm9kZU5hbWU7XG4gICAgd2hpbGUgKGVsID0gcHJldihlbCkpIHtcbiAgICAgIGlmIChlbC5ub2RlTmFtZSA9PT0gdHlwZSkgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgJzpsYXN0LW9mLXR5cGUnOiBmdW5jdGlvbihlbCkge1xuICAgIGlmIChlbC5wYXJlbnROb2RlLm5vZGVUeXBlICE9PSAxKSByZXR1cm47XG4gICAgdmFyIHR5cGUgPSBlbC5ub2RlTmFtZTtcbiAgICB3aGlsZSAoZWwgPSBuZXh0KGVsKSkge1xuICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSB0eXBlKSByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICAnOm9ubHktb2YtdHlwZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIHNlbGVjdG9yc1snOmZpcnN0LW9mLXR5cGUnXShlbClcbiAgICAgICAgJiYgc2VsZWN0b3JzWyc6bGFzdC1vZi10eXBlJ10oZWwpO1xuICB9LFxuICAnOm50aC1vZi10eXBlJzogZnVuY3Rpb24ocGFyYW0sIGxhc3QpIHtcbiAgICByZXR1cm4gbnRoKHBhcmFtLCBmdW5jdGlvbihyZWwsIGVsKSB7XG4gICAgICByZXR1cm4gcmVsLm5vZGVOYW1lID09PSBlbC5ub2RlTmFtZTtcbiAgICB9LCBsYXN0KTtcbiAgfSxcbiAgJzpudGgtbGFzdC1vZi10eXBlJzogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gc2VsZWN0b3JzWyc6bnRoLW9mLXR5cGUnXShwYXJhbSwgdHJ1ZSk7XG4gIH0sXG4gICc6Y2hlY2tlZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICEhKGVsLmNoZWNrZWQgfHwgZWwuc2VsZWN0ZWQpO1xuICB9LFxuICAnOmluZGV0ZXJtaW5hdGUnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhc2VsZWN0b3JzWyc6Y2hlY2tlZCddKGVsKTtcbiAgfSxcbiAgJzplbmFibGVkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIWVsLmRpc2FibGVkICYmIGVsLnR5cGUgIT09ICdoaWRkZW4nO1xuICB9LFxuICAnOmRpc2FibGVkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gISFlbC5kaXNhYmxlZDtcbiAgfSxcbiAgJzp0YXJnZXQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbC5pZCA9PT0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xuICB9LFxuICAnOmZvY3VzJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gZWwgPT09IGVsLm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgfSxcbiAgJzptYXRjaGVzJzogZnVuY3Rpb24oc2VsKSB7XG4gICAgcmV0dXJuIGNvbXBpbGVHcm91cChzZWwpO1xuICB9LFxuICAnOm50aC1tYXRjaCc6IGZ1bmN0aW9uKHBhcmFtLCBsYXN0KSB7XG4gICAgdmFyIGFyZ3MgPSBwYXJhbS5zcGxpdCgvXFxzKixcXHMqLylcbiAgICAgICwgYXJnID0gYXJncy5zaGlmdCgpXG4gICAgICAsIHRlc3QgPSBjb21waWxlR3JvdXAoYXJncy5qb2luKCcsJykpO1xuXG4gICAgcmV0dXJuIG50aChhcmcsIHRlc3QsIGxhc3QpO1xuICB9LFxuICAnOm50aC1sYXN0LW1hdGNoJzogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gc2VsZWN0b3JzWyc6bnRoLW1hdGNoJ10ocGFyYW0sIHRydWUpO1xuICB9LFxuICAnOmxpbmtzLWhlcmUnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbCArICcnID09PSB3aW5kb3cubG9jYXRpb24gKyAnJztcbiAgfSxcbiAgJzpsYW5nJzogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHdoaWxlIChlbCkge1xuICAgICAgICBpZiAoZWwubGFuZykgcmV0dXJuIGVsLmxhbmcuaW5kZXhPZihwYXJhbSkgPT09IDA7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICAnOmRpcic6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICB3aGlsZSAoZWwpIHtcbiAgICAgICAgaWYgKGVsLmRpcikgcmV0dXJuIGVsLmRpciA9PT0gcGFyYW07XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICAnOnNjb3BlJzogZnVuY3Rpb24oZWwsIGNvbikge1xuICAgIHZhciBjb250ZXh0ID0gY29uIHx8IGVsLm93bmVyRG9jdW1lbnQ7XG4gICAgaWYgKGNvbnRleHQubm9kZVR5cGUgPT09IDkpIHtcbiAgICAgIHJldHVybiBlbCA9PT0gY29udGV4dC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiBlbCA9PT0gY29udGV4dDtcbiAgfSxcbiAgJzphbnktbGluayc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlbC5ocmVmID09PSAnc3RyaW5nJztcbiAgfSxcbiAgJzpsb2NhbC1saW5rJzogZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoZWwubm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiBlbC5ocmVmICYmIGVsLmhvc3QgPT09IHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuICAgIH1cbiAgICB2YXIgcGFyYW0gPSArZWwgKyAxO1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgaWYgKCFlbC5ocmVmKSByZXR1cm47XG5cbiAgICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24gKyAnJ1xuICAgICAgICAsIGhyZWYgPSBlbCArICcnO1xuXG4gICAgICByZXR1cm4gdHJ1bmNhdGVVcmwodXJsLCBwYXJhbSkgPT09IHRydW5jYXRlVXJsKGhyZWYsIHBhcmFtKTtcbiAgICB9O1xuICB9LFxuICAnOmRlZmF1bHQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhIWVsLmRlZmF1bHRTZWxlY3RlZDtcbiAgfSxcbiAgJzp2YWxpZCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuIGVsLndpbGxWYWxpZGF0ZSB8fCAoZWwudmFsaWRpdHkgJiYgZWwudmFsaWRpdHkudmFsaWQpO1xuICB9LFxuICAnOmludmFsaWQnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiAhc2VsZWN0b3JzWyc6dmFsaWQnXShlbCk7XG4gIH0sXG4gICc6aW4tcmFuZ2UnOiBmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbC52YWx1ZSA+IGVsLm1pbiAmJiBlbC52YWx1ZSA8PSBlbC5tYXg7XG4gIH0sXG4gICc6b3V0LW9mLXJhbmdlJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gIXNlbGVjdG9yc1snOmluLXJhbmdlJ10oZWwpO1xuICB9LFxuICAnOnJlcXVpcmVkJzogZnVuY3Rpb24oZWwpIHtcbiAgICByZXR1cm4gISFlbC5yZXF1aXJlZDtcbiAgfSxcbiAgJzpvcHRpb25hbCc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFlbC5yZXF1aXJlZDtcbiAgfSxcbiAgJzpyZWFkLW9ubHknOiBmdW5jdGlvbihlbCkge1xuICAgIGlmIChlbC5yZWFkT25seSkgcmV0dXJuIHRydWU7XG5cbiAgICB2YXIgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJylcbiAgICAgICwgcHJvcCA9IGVsLmNvbnRlbnRFZGl0YWJsZVxuICAgICAgLCBuYW1lID0gZWwubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIG5hbWUgPSBuYW1lICE9PSAnaW5wdXQnICYmIG5hbWUgIT09ICd0ZXh0YXJlYSc7XG5cbiAgICByZXR1cm4gKG5hbWUgfHwgZWwuZGlzYWJsZWQpICYmIGF0dHIgPT0gbnVsbCAmJiBwcm9wICE9PSAndHJ1ZSc7XG4gIH0sXG4gICc6cmVhZC13cml0ZSc6IGZ1bmN0aW9uKGVsKSB7XG4gICAgcmV0dXJuICFzZWxlY3RvcnNbJzpyZWFkLW9ubHknXShlbCk7XG4gIH0sXG4gICc6aG92ZXInOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpob3ZlciBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOmFjdGl2ZSc6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOmFjdGl2ZSBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOmxpbmsnOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpsaW5rIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6dmlzaXRlZCc6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOnZpc2l0ZWQgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzpjb2x1bW4nOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpjb2x1bW4gaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzpudGgtY29sdW1uJzogZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCc6bnRoLWNvbHVtbiBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOm50aC1sYXN0LWNvbHVtbic6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOm50aC1sYXN0LWNvbHVtbiBpcyBub3Qgc3VwcG9ydGVkLicpO1xuICB9LFxuICAnOmN1cnJlbnQnOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpjdXJyZW50IGlzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gIH0sXG4gICc6cGFzdCc6IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignOnBhc3QgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgJzpmdXR1cmUnOiBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJzpmdXR1cmUgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgfSxcbiAgLy8gTm9uLXN0YW5kYXJkLCBmb3IgY29tcGF0aWJpbGl0eSBwdXJwb3Nlcy5cbiAgJzpjb250YWlucyc6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICB2YXIgdGV4dCA9IGVsLmlubmVyVGV4dCB8fCBlbC50ZXh0Q29udGVudCB8fCBlbC52YWx1ZSB8fCAnJztcbiAgICAgIHJldHVybiAhIX50ZXh0LmluZGV4T2YocGFyYW0pO1xuICAgIH07XG4gIH0sXG4gICc6aGFzJzogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiB6ZXN0KHBhcmFtLCBlbCkubGVuZ3RoID4gMDtcbiAgICB9O1xuICB9XG4gIC8vIFBvdGVudGlhbGx5IGFkZCBtb3JlIHBzZXVkbyBzZWxlY3RvcnMgZm9yXG4gIC8vIGNvbXBhdGliaWxpdHkgd2l0aCBzaXp6bGUgYW5kIG1vc3Qgb3RoZXJcbiAgLy8gc2VsZWN0b3IgZW5naW5lcyAoPykuXG59O1xuXG4vKipcbiAqIEF0dHJpYnV0ZSBPcGVyYXRvcnNcbiAqL1xuXG52YXIgb3BlcmF0b3JzID0ge1xuICAnLSc6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICAnPSc6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuICAgIHJldHVybiBhdHRyID09PSB2YWw7XG4gIH0sXG4gICcqPSc6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuICAgIHJldHVybiBhdHRyLmluZGV4T2YodmFsKSAhPT0gLTE7XG4gIH0sXG4gICd+PSc6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuICAgIHZhciBpID0gYXR0ci5pbmRleE9mKHZhbClcbiAgICAgICwgZlxuICAgICAgLCBsO1xuXG4gICAgaWYgKGkgPT09IC0xKSByZXR1cm47XG4gICAgZiA9IGF0dHJbaSAtIDFdO1xuICAgIGwgPSBhdHRyW2kgKyB2YWwubGVuZ3RoXTtcblxuICAgIHJldHVybiAoIWYgfHwgZiA9PT0gJyAnKSAmJiAoIWwgfHwgbCA9PT0gJyAnKTtcbiAgfSxcbiAgJ3w9JzogZnVuY3Rpb24oYXR0ciwgdmFsKSB7XG4gICAgdmFyIGkgPSBhdHRyLmluZGV4T2YodmFsKVxuICAgICAgLCBsO1xuXG4gICAgaWYgKGkgIT09IDApIHJldHVybjtcbiAgICBsID0gYXR0cltpICsgdmFsLmxlbmd0aF07XG5cbiAgICByZXR1cm4gbCA9PT0gJy0nIHx8ICFsO1xuICB9LFxuICAnXj0nOiBmdW5jdGlvbihhdHRyLCB2YWwpIHtcbiAgICByZXR1cm4gYXR0ci5pbmRleE9mKHZhbCkgPT09IDA7XG4gIH0sXG4gICckPSc6IGZ1bmN0aW9uKGF0dHIsIHZhbCkge1xuICAgIHJldHVybiBhdHRyLmluZGV4T2YodmFsKSArIHZhbC5sZW5ndGggPT09IGF0dHIubGVuZ3RoO1xuICB9LFxuICAvLyBub24tc3RhbmRhcmRcbiAgJyE9JzogZnVuY3Rpb24oYXR0ciwgdmFsKSB7XG4gICAgcmV0dXJuIGF0dHIgIT09IHZhbDtcbiAgfVxufTtcblxuLyoqXG4gKiBDb21iaW5hdG9yIExvZ2ljXG4gKi9cblxudmFyIGNvbWJpbmF0b3JzID0ge1xuICAnICc6IGZ1bmN0aW9uKHRlc3QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHdoaWxlIChlbCA9IGVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgaWYgKHRlc3QoZWwpKSByZXR1cm4gZWw7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgJz4nOiBmdW5jdGlvbih0ZXN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gdGVzdChlbCA9IGVsLnBhcmVudE5vZGUpICYmIGVsO1xuICAgIH07XG4gIH0sXG4gICcrJzogZnVuY3Rpb24odGVzdCkge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuIHRlc3QoZWwgPSBwcmV2KGVsKSkgJiYgZWw7XG4gICAgfTtcbiAgfSxcbiAgJ34nOiBmdW5jdGlvbih0ZXN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICB3aGlsZSAoZWwgPSBwcmV2KGVsKSkge1xuICAgICAgICBpZiAodGVzdChlbCkpIHJldHVybiBlbDtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICAnbm9vcCc6IGZ1bmN0aW9uKHRlc3QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiB0ZXN0KGVsKSAmJiBlbDtcbiAgICB9O1xuICB9LFxuICAncmVmJzogZnVuY3Rpb24odGVzdCwgbmFtZSkge1xuICAgIHZhciBub2RlO1xuXG4gICAgZnVuY3Rpb24gcmVmKGVsKSB7XG4gICAgICB2YXIgZG9jID0gZWwub3duZXJEb2N1bWVudFxuICAgICAgICAsIG5vZGVzID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCcqJylcbiAgICAgICAgLCBpID0gbm9kZXMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKHJlZi50ZXN0KGVsKSkge1xuICAgICAgICAgIG5vZGUgPSBudWxsO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5vZGUgPSBudWxsO1xuICAgIH1cblxuICAgIHJlZi5jb21iaW5hdG9yID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5nZXRBdHRyaWJ1dGUpIHJldHVybjtcblxuICAgICAgdmFyIGF0dHIgPSBub2RlLmdldEF0dHJpYnV0ZShuYW1lKSB8fCAnJztcbiAgICAgIGlmIChhdHRyWzBdID09PSAnIycpIGF0dHIgPSBhdHRyLnN1YnN0cmluZygxKTtcblxuICAgICAgaWYgKGF0dHIgPT09IGVsLmlkICYmIHRlc3Qobm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiByZWY7XG4gIH1cbn07XG5cbi8qKlxuICogR3JhbW1hclxuICovXG5cbnZhciBydWxlcyA9IHtcbiAgcW5hbWU6IC9eICooW1xcd1xcLV0rfFxcKikvLFxuICBzaW1wbGU6IC9eKD86KFsuI11bXFx3XFwtXSspfHBzZXVkb3xhdHRyKS8sXG4gIHJlZjogL14gKlxcLyhbXFx3XFwtXSspXFwvICovLFxuICBjb21iaW5hdG9yOiAvXig/OiArKFteIFxcdypdKSArfCggKSt8KFteIFxcdypdKSkoPyEgKiQpLyxcbiAgYXR0cjogL15cXFsoW1xcd1xcLV0rKSg/OihbXlxcd10/PSkoaW5zaWRlKSk/XFxdLyxcbiAgcHNldWRvOiAvXig6W1xcd1xcLV0rKSg/OlxcKChpbnNpZGUpXFwpKT8vLFxuICBpbnNpZGU6IC8oPzpcIig/OlxcXFxcInxbXlwiXSkqXCJ8Jyg/OlxcXFwnfFteJ10pKid8PFteXCInPl0qPnxcXFxcW1wiJz5dfFteXCInPl0pKi9cbn07XG5cbnJ1bGVzLmluc2lkZSA9IHJlcGxhY2UocnVsZXMuaW5zaWRlLCAnW15cIlxcJz5dKicsIHJ1bGVzLmluc2lkZSk7XG5ydWxlcy5hdHRyID0gcmVwbGFjZShydWxlcy5hdHRyLCAnaW5zaWRlJywgbWFrZUluc2lkZSgnXFxcXFsnLCAnXFxcXF0nKSk7XG5ydWxlcy5wc2V1ZG8gPSByZXBsYWNlKHJ1bGVzLnBzZXVkbywgJ2luc2lkZScsIG1ha2VJbnNpZGUoJ1xcXFwoJywgJ1xcXFwpJykpO1xucnVsZXMuc2ltcGxlID0gcmVwbGFjZShydWxlcy5zaW1wbGUsICdwc2V1ZG8nLCBydWxlcy5wc2V1ZG8pO1xucnVsZXMuc2ltcGxlID0gcmVwbGFjZShydWxlcy5zaW1wbGUsICdhdHRyJywgcnVsZXMuYXR0cik7XG5cbi8qKlxuICogQ29tcGlsaW5nXG4gKi9cblxudmFyIGNvbXBpbGUgPSBmdW5jdGlvbihzZWwpIHtcbiAgdmFyIHNlbCA9IHNlbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICAsIHRlc3RcbiAgICAsIGZpbHRlciA9IFtdXG4gICAgLCBidWZmID0gW11cbiAgICAsIHN1YmplY3RcbiAgICAsIHFuYW1lXG4gICAgLCBjYXBcbiAgICAsIG9wXG4gICAgLCByZWY7XG5cbiAgd2hpbGUgKHNlbCkge1xuICAgIGlmIChjYXAgPSBydWxlcy5xbmFtZS5leGVjKHNlbCkpIHtcbiAgICAgIHNlbCA9IHNlbC5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBxbmFtZSA9IGNhcFsxXTtcbiAgICAgIGJ1ZmYucHVzaCh0b2socW5hbWUsIHRydWUpKTtcbiAgICB9IGVsc2UgaWYgKGNhcCA9IHJ1bGVzLnNpbXBsZS5leGVjKHNlbCkpIHtcbiAgICAgIHNlbCA9IHNlbC5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBxbmFtZSA9ICcqJztcbiAgICAgIGJ1ZmYucHVzaCh0b2socW5hbWUsIHRydWUpKTtcbiAgICAgIGJ1ZmYucHVzaCh0b2soY2FwKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzZWxlY3Rvci4nKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoY2FwID0gcnVsZXMuc2ltcGxlLmV4ZWMoc2VsKSkge1xuICAgICAgc2VsID0gc2VsLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGJ1ZmYucHVzaCh0b2soY2FwKSk7XG4gICAgfVxuXG4gICAgaWYgKHNlbFswXSA9PT0gJyEnKSB7XG4gICAgICBzZWwgPSBzZWwuc3Vic3RyaW5nKDEpO1xuICAgICAgc3ViamVjdCA9IG1ha2VTdWJqZWN0KCk7XG4gICAgICBzdWJqZWN0LnFuYW1lID0gcW5hbWU7XG4gICAgICBidWZmLnB1c2goc3ViamVjdC5zaW1wbGUpO1xuICAgIH1cblxuICAgIGlmIChjYXAgPSBydWxlcy5yZWYuZXhlYyhzZWwpKSB7XG4gICAgICBzZWwgPSBzZWwuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgcmVmID0gY29tYmluYXRvcnMucmVmKG1ha2VTaW1wbGUoYnVmZiksIGNhcFsxXSk7XG4gICAgICBmaWx0ZXIucHVzaChyZWYuY29tYmluYXRvcik7XG4gICAgICBidWZmID0gW107XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoY2FwID0gcnVsZXMuY29tYmluYXRvci5leGVjKHNlbCkpIHtcbiAgICAgIHNlbCA9IHNlbC5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvcCA9IGNhcFsxXSB8fCBjYXBbMl0gfHwgY2FwWzNdO1xuICAgICAgaWYgKG9wID09PSAnLCcpIHtcbiAgICAgICAgZmlsdGVyLnB1c2goY29tYmluYXRvcnMubm9vcChtYWtlU2ltcGxlKGJ1ZmYpKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvcCA9ICdub29wJztcbiAgICB9XG5cbiAgICBmaWx0ZXIucHVzaChjb21iaW5hdG9yc1tvcF0obWFrZVNpbXBsZShidWZmKSkpO1xuICAgIGJ1ZmYgPSBbXTtcbiAgfVxuXG4gIHRlc3QgPSBtYWtlVGVzdChmaWx0ZXIpO1xuICB0ZXN0LnFuYW1lID0gcW5hbWU7XG4gIHRlc3Quc2VsID0gc2VsO1xuXG4gIGlmIChzdWJqZWN0KSB7XG4gICAgc3ViamVjdC5sbmFtZSA9IHRlc3QucW5hbWU7XG5cbiAgICBzdWJqZWN0LnRlc3QgPSB0ZXN0O1xuICAgIHN1YmplY3QucW5hbWUgPSBzdWJqZWN0LnFuYW1lO1xuICAgIHN1YmplY3Quc2VsID0gdGVzdC5zZWw7XG4gICAgdGVzdCA9IHN1YmplY3Q7XG4gIH1cblxuICBpZiAocmVmKSB7XG4gICAgcmVmLnRlc3QgPSB0ZXN0O1xuICAgIHJlZi5xbmFtZSA9IHRlc3QucW5hbWU7XG4gICAgcmVmLnNlbCA9IHRlc3Quc2VsO1xuICAgIHRlc3QgPSByZWY7XG4gIH1cblxuICByZXR1cm4gdGVzdDtcbn07XG5cbnZhciB0b2sgPSBmdW5jdGlvbihjYXAsIHFuYW1lKSB7XG4gIC8vIHFuYW1lXG4gIGlmIChxbmFtZSkge1xuICAgIHJldHVybiBjYXAgPT09ICcqJ1xuICAgICAgPyBzZWxlY3RvcnNbJyonXVxuICAgICAgOiBzZWxlY3RvcnMudHlwZShjYXApO1xuICB9XG5cbiAgLy8gY2xhc3MvaWRcbiAgaWYgKGNhcFsxXSkge1xuICAgIHJldHVybiBjYXBbMV1bMF0gPT09ICcuJ1xuICAgICAgPyBzZWxlY3RvcnMuYXR0cignY2xhc3MnLCAnfj0nLCBjYXBbMV0uc3Vic3RyaW5nKDEpKVxuICAgICAgOiBzZWxlY3RvcnMuYXR0cignaWQnLCAnPScsIGNhcFsxXS5zdWJzdHJpbmcoMSkpO1xuICB9XG5cbiAgLy8gcHNldWRvLW5hbWVcbiAgLy8gaW5zaWRlLXBzZXVkb1xuICBpZiAoY2FwWzJdKSB7XG4gICAgcmV0dXJuIGNhcFszXVxuICAgICAgPyBzZWxlY3RvcnNbY2FwWzJdXSh1bnF1b3RlKGNhcFszXSkpXG4gICAgICA6IHNlbGVjdG9yc1tjYXBbMl1dO1xuICB9XG5cbiAgLy8gYXR0ciBuYW1lXG4gIC8vIGF0dHIgb3BcbiAgLy8gYXR0ciB2YWx1ZVxuICBpZiAoY2FwWzRdKSB7XG4gICAgdmFyIGk7XG4gICAgaWYgKGNhcFs2XSkge1xuICAgICAgaSA9IGNhcFs2XS5sZW5ndGg7XG4gICAgICBjYXBbNl0gPSBjYXBbNl0ucmVwbGFjZSgvICtpJC8sICcnKTtcbiAgICAgIGkgPSBpID4gY2FwWzZdLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdG9ycy5hdHRyKGNhcFs0XSwgY2FwWzVdIHx8ICctJywgdW5xdW90ZShjYXBbNl0pLCBpKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignVW5rbm93biBTZWxlY3Rvci4nKTtcbn07XG5cbnZhciBtYWtlU2ltcGxlID0gZnVuY3Rpb24oZnVuYykge1xuICB2YXIgbCA9IGZ1bmMubGVuZ3RoXG4gICAgLCBpO1xuXG4gIC8vIFBvdGVudGlhbGx5IG1ha2Ugc3VyZVxuICAvLyBgZWxgIGlzIHRydXRoeS5cbiAgaWYgKGwgPCAyKSByZXR1cm4gZnVuY1swXTtcblxuICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoIWVsKSByZXR1cm47XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKCFmdW5jW2ldKGVsKSkgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn07XG5cbnZhciBtYWtlVGVzdCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgaWYgKGZ1bmMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgcmV0dXJuICEhZnVuY1swXShlbCk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgaSA9IGZ1bmMubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmICghKGVsID0gZnVuY1tpXShlbCkpKSByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufTtcblxudmFyIG1ha2VTdWJqZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0YXJnZXQ7XG5cbiAgZnVuY3Rpb24gc3ViamVjdChlbCkge1xuICAgIHZhciBub2RlID0gZWwub3duZXJEb2N1bWVudFxuICAgICAgLCBzY29wZSA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc3ViamVjdC5sbmFtZSlcbiAgICAgICwgaSA9IHNjb3BlLmxlbmd0aDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlmIChzdWJqZWN0LnRlc3Qoc2NvcGVbaV0pICYmIHRhcmdldCA9PT0gZWwpIHtcbiAgICAgICAgdGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGFyZ2V0ID0gbnVsbDtcbiAgfVxuXG4gIHN1YmplY3Quc2ltcGxlID0gZnVuY3Rpb24oZWwpIHtcbiAgICB0YXJnZXQgPSBlbDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICByZXR1cm4gc3ViamVjdDtcbn07XG5cbnZhciBjb21waWxlR3JvdXAgPSBmdW5jdGlvbihzZWwpIHtcbiAgdmFyIHRlc3QgPSBjb21waWxlKHNlbClcbiAgICAsIHRlc3RzID0gWyB0ZXN0IF07XG5cbiAgd2hpbGUgKHRlc3Quc2VsKSB7XG4gICAgdGVzdCA9IGNvbXBpbGUodGVzdC5zZWwpO1xuICAgIHRlc3RzLnB1c2godGVzdCk7XG4gIH1cblxuICBpZiAodGVzdHMubGVuZ3RoIDwgMikgcmV0dXJuIHRlc3Q7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIGwgPSB0ZXN0cy5sZW5ndGhcbiAgICAgICwgaSA9IDA7XG5cbiAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKHRlc3RzW2ldKGVsKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9O1xufTtcblxuLyoqXG4gKiBTZWxlY3Rpb25cbiAqL1xuXG52YXIgZmluZCA9IGZ1bmN0aW9uKHNlbCwgbm9kZSkge1xuICB2YXIgcmVzdWx0cyA9IFtdXG4gICAgLCB0ZXN0ID0gY29tcGlsZShzZWwpXG4gICAgLCBzY29wZSA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGVzdC5xbmFtZSlcbiAgICAsIGkgPSAwXG4gICAgLCBlbDtcblxuICB3aGlsZSAoZWwgPSBzY29wZVtpKytdKSB7XG4gICAgaWYgKHRlc3QoZWwpKSByZXN1bHRzLnB1c2goZWwpO1xuICB9XG5cbiAgaWYgKHRlc3Quc2VsKSB7XG4gICAgd2hpbGUgKHRlc3Quc2VsKSB7XG4gICAgICB0ZXN0ID0gY29tcGlsZSh0ZXN0LnNlbCk7XG4gICAgICBzY29wZSA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGVzdC5xbmFtZSk7XG4gICAgICBpID0gMDtcbiAgICAgIHdoaWxlIChlbCA9IHNjb3BlW2krK10pIHtcbiAgICAgICAgaWYgKHRlc3QoZWwpICYmICF+aW5kZXhPZi5jYWxsKHJlc3VsdHMsIGVsKSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChlbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0cy5zb3J0KG9yZGVyKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBOYXRpdmVcbiAqL1xuXG52YXIgc2VsZWN0ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgc2xpY2UgPSAoZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd6ZXN0JykpO1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGUgPSBudWxsO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYSA9IFtdLCBpID0gMCwgbCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICBmb3IgKDsgaSA8IGw7IGkrKykgYS5wdXNoKHRoaXNbaV0pO1xuICAgICAgICByZXR1cm4gYTtcbiAgICAgIH07XG4gICAgfVxuICB9KSgpO1xuXG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHNlbCwgbm9kZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHNsaWNlLmNhbGwobm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbCkpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmaW5kKHNlbCwgbm9kZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihzZWwsIG5vZGUpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHNlbFswXSA9PT0gJyMnICYmIC9eI1tcXHdcXC1dKyQvLnRlc3Qoc2VsKSkge1xuICAgICAgICByZXR1cm4gW25vZGUuZ2V0RWxlbWVudEJ5SWQoc2VsLnN1YnN0cmluZygxKSldO1xuICAgICAgfVxuICAgICAgaWYgKHNlbFswXSA9PT0gJy4nICYmIC9eXFwuW1xcd1xcLV0rJC8udGVzdChzZWwpKSB7XG4gICAgICAgIHNlbCA9IG5vZGUuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShzZWwuc3Vic3RyaW5nKDEpKTtcbiAgICAgICAgcmV0dXJuIHNsaWNlLmNhbGwoc2VsKTtcbiAgICAgIH1cbiAgICAgIGlmICgvXltcXHdcXC1dKyQvLnRlc3Qoc2VsKSkge1xuICAgICAgICByZXR1cm4gc2xpY2UuY2FsbChub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKHNlbCkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgO1xuICAgIH1cbiAgICByZXR1cm4gZmluZChzZWwsIG5vZGUpO1xuICB9O1xufSkoKTtcblxuLyoqXG4gKiBaZXN0XG4gKi9cblxudmFyIHplc3QgPSBmdW5jdGlvbihzZWwsIG5vZGUpIHtcbiAgdHJ5IHtcbiAgICBzZWwgPSBzZWxlY3Qoc2VsLCBub2RlIHx8IGRvY3VtZW50KTtcbiAgfSBjYXRjaChlKSB7XG4gICAgaWYgKHdpbmRvdy5aRVNUX0RFQlVHKSB7XG4gICAgICBjb25zb2xlLmxvZyhlLnN0YWNrIHx8IGUgKyAnJyk7XG4gICAgfVxuICAgIHNlbCA9IFtdO1xuICB9XG4gIHJldHVybiBzZWw7XG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbnplc3Quc2VsZWN0b3JzID0gc2VsZWN0b3JzO1xuemVzdC5vcGVyYXRvcnMgPSBvcGVyYXRvcnM7XG56ZXN0LmNvbWJpbmF0b3JzID0gY29tYmluYXRvcnM7XG56ZXN0LmNvbXBpbGUgPSBjb21waWxlR3JvdXA7XG5cbnplc3QubWF0Y2hlcyA9IGZ1bmN0aW9uKGVsLCBzZWwpIHtcbiAgcmV0dXJuICEhY29tcGlsZUdyb3VwKHNlbCkoZWwpO1xufTtcblxuemVzdC5jYWNoZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoY29tcGlsZS5yYXcpIHJldHVybjtcblxuICB2YXIgcmF3ID0gY29tcGlsZVxuICAgICwgY2FjaGUgPSB7fTtcblxuICBjb21waWxlID0gZnVuY3Rpb24oc2VsKSB7XG4gICAgcmV0dXJuIGNhY2hlW3NlbF1cbiAgICAgIHx8IChjYWNoZVtzZWxdID0gcmF3KHNlbCkpO1xuICB9O1xuXG4gIGNvbXBpbGUucmF3ID0gcmF3O1xuICB6ZXN0Ll9jYWNoZSA9IGNhY2hlO1xufTtcblxuemVzdC5ub0NhY2hlID0gZnVuY3Rpb24oKSB7XG4gIGlmICghY29tcGlsZS5yYXcpIHJldHVybjtcbiAgY29tcGlsZSA9IGNvbXBpbGUucmF3O1xuICBkZWxldGUgemVzdC5fY2FjaGU7XG59O1xuXG56ZXN0Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgd2luZG93Lnplc3QgPSBvbGQ7XG4gIHJldHVybiB6ZXN0O1xufTtcblxuemVzdC5ub05hdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICBzZWxlY3QgPSBmaW5kO1xufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gemVzdDtcbn0gZWxzZSB7XG4gIHRoaXMuemVzdCA9IHplc3Q7XG59XG5cbmlmICh3aW5kb3cuWkVTVF9ERUJVRykge1xuICB6ZXN0Lm5vTmF0aXZlKCk7XG59IGVsc2Uge1xuICB6ZXN0LmNhY2hlKCk7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuIiwidmFyIHBlcmZub3cgICAgID0gcmVxdWlyZShcInV0aWwvcGVyZm5vd1wiKSxcbiAgICBQYWdlVmlldyAgICA9IHJlcXVpcmUoXCIuLi92aWV3L3BhZ2VcIiksXG4gICAgU2lkZWJhclZpZXcgPSByZXF1aXJlKFwiLi4vdmlldy9zaWRlYmFyXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhZ2UoY29udGFpbmVyKSB7XG4gIGNvbnNvbGUubG9nKFwiSW5pdGlhbGl6aW5nIHBhZ2VGYWN0b3J5XCIsXCJbflwiICsgcGVyZm5vdygpICsgXCJtc11cIilcbiAgcmV0dXJuIHtcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlxcdFwiLCBcIlN0YXJ0aW5nIHBhZ2VGYWN0b3J5XCIsIFwiW35cIiArIHBlcmZub3coKSArIFwibXNdXCIpO1xuXG4gICAgICB0aGlzLnNpZGViYXIgPSBuZXcgU2lkZWJhclZpZXcoe1xuICAgICAgICBlbDogXCJzaWRlYmFyXCIsXG4gICAgICAgIHRlbXBsYXRlOiBjb250YWluZXIudGVtcGxhdGUuc2lkZWJhcixcbiAgICAgICAgbW9kZWw6IGNvbnRhaW5lci5jb25maWcuYWJvdXQsXG4gICAgICAgIG5hdjogY29udGFpbmVyLiQoXCIjbmF2LS1zdXBlci12ZXJ0aWNhbC1yZXNwb25zaXZlXCIpWzBdXG4gICAgICB9KTtcblxuICAgICAgdGhpcy52aWV3ID0gbmV3IFBhZ2VWaWV3KHtcbiAgICAgICAgZWw6IFwicGFnZVwiLFxuICAgICAgICB0ZW1wbGF0ZTogY29udGFpbmVyLnRlbXBsYXRlLnBhZ2UsXG4gICAgICAgIG1vZGVsOiBjb250YWluZXIuY29uZmlnLmFib3V0XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGxvYWRQYWdlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLnZpZXcucmVuZGVyKG5hbWUpO1xuICAgIH0sXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIlxcdFwiLCBcInBhZ2VGYWN0b3J5IERlc3Ryb3llZFwiKTtcbiAgICB9XG4gIH1cbn07XG4iLCJ2YXIgaGFuZGxlYmFycyA9IHJlcXVpcmUoXCJoYW5kbGViYXJzL3J1bnRpbWVcIiksXG4gICAgbGF5b3V0cyAgICA9IHJlcXVpcmUoXCJoYW5kbGViYXJzLWxheW91dHNcIiksXG4gICAgX3RlbXBsYXRlcyA9IHJlcXVpcmUoXCIuLi90ZW1wbGF0ZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb250YWluZXIpe1xuICAgIC8vSW5zdGFudGlhdGUgdGVtcGxhdGVzIGJ5IGluamVjdGluZyBoYW5kbGViYXJzXG4gICAgdmFyIHRlbXBsYXRlcyA9IF90ZW1wbGF0ZXMoaGFuZGxlYmFycyk7XG5cbiAgICAvL1JlZ2lzdGVyIGxheW91dHMgaGVscGVyXG4gICAgaGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcihsYXlvdXRzKGhhbmRsZWJhcnMpKTtcblxuICAgIC8vUmVnaXN0ZXIgbGF5b3V0IHBhcnRpYWxcbiAgICBoYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCgnbGF5b3V0JywgdGVtcGxhdGVzWydsYXlvdXQnXSk7XG5cbiAgICAvL3JldHVybiB0ZW1wbGF0ZXM7XG4gICAgcmV0dXJuIHRlbXBsYXRlcztcbn1cbiIsInZhciBwZXJmbm93ID0gcmVxdWlyZSgndXRpbC9wZXJmbm93JyksXG4gICAgZmx1eGJvdHRsZSA9IHJlcXVpcmUoJ2ZsdXhib3R0bGUnKSxcbiAgICBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcvYXBwJyksXG4gICAgY29udGVudCA9ICh7XCJzZXJ2aWNlXCI6KHtcImNvbmZpZ1wiOnJlcXVpcmUoXCIuL3NlcnZpY2UvY29uZmlnLmpzXCIpLFwicm91dGVyXCI6cmVxdWlyZShcIi4vc2VydmljZS9yb3V0ZXIuanNcIiksXCJ6ZXN0XCI6cmVxdWlyZShcIi4vc2VydmljZS96ZXN0LmpzXCIpfSksXCJmYWN0b3J5XCI6KHtcInBhZ2VcIjpyZXF1aXJlKFwiLi9mYWN0b3J5L3BhZ2UuanNcIiksXCJ0ZW1wbGF0ZVwiOnJlcXVpcmUoXCIuL2ZhY3RvcnkvdGVtcGxhdGUuanNcIil9KX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4vKipcbiAqIENvcmUgZm9yIHlvdXIgYXBwbGljYXRpb24gdGhhdCBnZXRzIGJvdHRsZWQgaW50byBhIGZhY3RvcnkuXG4gKiBBbGwgeW91ciBzZXJ2aWNlcywgZmFjdG9yaWVzIGFuZCBzdWNoIHdpbGwgYmUgYm90dGxlZCBiZWZvcmVoYW5kIGFuZFxuICogYXJlIGFjY2VzaWJsZSBmcm9tIGBjb250YWluZXJgLlxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRhaW5lciBBIEJvdHRsZUpTIGNvbnRhaW5lclxuICogQHJldHVybnMge29iamVjdH0gc2VydmljZSBBIHNlcnZpY2UgdG8gZXhwb3NlXG4gKi9cbnZhciBBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICBjb250YWluZXIuJCA9IGNvbnRhaW5lci56ZXN0O1xuXG4gIGNvbnRhaW5lci5yb3V0ZXIuYWRkKFwie3F1ZXJ5fVwiLCAob3B0aW9ucykgPT5cbiAgICBjb250YWluZXIucGFnZS5sb2FkUGFnZShvcHRpb25zLnF1ZXJ5KVxuICApO1xuXG4gIHJldHVybiB7XG4gICAgc3RhcnQ6ICAgIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coXCJcXHRcIixcIkFwcGxpY2F0aW9uIFN0YXJ0ZWRcIiwgXCJbflwiICsgcGVyZm5vdygpICsgXCJtc11cIik7XG4gICAgICBjb250YWluZXIucGFnZS5zdGFydCgpO1xuICAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlKSA9PiBjb250YWluZXIucm91dGVyLnJ1bigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgIFxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gXCJcIilcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gXCIjaG9tZVwiO1xuICAgIFxuICAgIGNvbnRhaW5lci5yb3V0ZXIucnVuKCk7XG4gICAgXG4gICAgfVxuICB9XG59O1xuXG53aW5kb3cuYXBwID0gZmx1eGJvdHRsZS5zZXR1cChBcHBsaWNhdGlvbixjb25maWcsY29udGVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwbGljYXRpb247XG4iLCJ2YXIgYXBwY29uZmlnID0gcmVxdWlyZShcIi4uLy4uL2NvbmZpZy9hcHBcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29uZmlnKCl7XG4gIHJldHVybiBhcHBjb25maWc7XG59O1xuIiwidmFyIHBlcmZub3cgID0gcmVxdWlyZShcInV0aWwvcGVyZm5vd1wiKSxcbiAgICBMaWdodHJvdXRlciA9IHJlcXVpcmUoXCJsaWdodHJvdXRlclwiKTtcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcm91dGVyKCkge1xuXG4gIGNvbnNvbGUubG9nKFwiSW5pdGlhbGl6aW5nIFJvdXRlck1vZHVsZVwiLCBcIlt+XCIgKyBwZXJmbm93KCkgKyBcIm1zXVwiKVxuICBcbiAgdmFyIHJvdXRlciA9IG5ldyBMaWdodHJvdXRlcih7XG5cdCAgdHlwZTogJ2hhc2gnLCAgICAgICAgICAgICAvLyBEZWZhdWx0IHJvdXRpbmcgdHlwZVxuXHQgIHBhdGhSb290OiAnJywgIC8vIEJhc2UgcGF0aCBmb3IgeW91ciBhcHBcbiAgfSk7XG4gXG4gIHJldHVybiByb3V0ZXI7XG59O1xuIiwidmFyIHplc3QgPSByZXF1aXJlKFwiemVzdFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gemVzdDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEhhbmRsZWJhcnMpe3ZhciBjb250YWluZXIgPSB7fTsgY29udGFpbmVyW1wibGF5b3V0XCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBoZWxwZXIsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIjxoZWFkZXIgY2xhc3M9XFxcImNvbnRhaW5lci0td3JhcCBuby1tYXJnaW4tdmVydGljYWxcXFwiPlxcbiAgICA8aDEgY2xhc3M9XFxcIm0tLTEgZy0tMTIgbm8tbWFyZ2luLXZlcnRpY2FsXFxcIj5cXG4gICAgICBcIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGFsaWFzMiksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGFsaWFzMSx7XCJuYW1lXCI6XCJuYW1lXCIsXCJoYXNoXCI6e30sXCJkYXRhXCI6ZGF0YX0pIDogaGVscGVyKSkpXG4gICAgKyBcIlxcbiAgICA8L2gxPlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmJsb2NrIHx8IChkZXB0aDAgJiYgZGVwdGgwLmJsb2NrKSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwiaGVhZGVyXCIse1wibmFtZVwiOlwiYmxvY2tcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiPC9oZWFkZXI+XFxuICA8ZGl2IGNsYXNzPVxcXCJnLS0xMCBtLS0xXFxcIj5cXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5ibG9jayB8fCAoZGVwdGgwICYmIGRlcHRoMC5ibG9jaykgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJibG9ja1wiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCIgIDwvZGl2PlxcbjwvZGl2PlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIlwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICBDb250ZW50XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5ibG9jayB8fCAoZGVwdGgwICYmIGRlcHRoMC5ibG9jaykgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJmdWxscGFnZVwiLHtcIm5hbWVcIjpcImJsb2NrXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJzaWRlYmFyXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgaGVscGVyO1xuXG4gIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcImxvZ28tYXJlYSBuby1tYXJnaW4tdmVydGljYWwgZmFkZS1pbi1mcm9tLXRvcFxcXCI+XFxuICA8aW1nIGNsYXNzPVxcXCJnLS0yIG5vLW1hcmdpbi12ZXJ0aWNhbFxcXCIgc3JjPVxcXCJpbWFnZXMvbG9nby5wbmdcXFwiPlxcbiAgPGg0IGNsYXNzPVxcXCJnLS02IG0tLTEgbm8tbWFyZ2luLXZlcnRpY2FsXFxcIj5cIlxuICAgICsgY29udGFpbmVyLmVzY2FwZUV4cHJlc3Npb24oKChoZWxwZXIgPSAoaGVscGVyID0gaGVscGVycy5uYW1lIHx8IChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMC5uYW1lIDogZGVwdGgwKSkgIT0gbnVsbCA/IGhlbHBlciA6IGhlbHBlcnMuaGVscGVyTWlzc2luZyksKHR5cGVvZiBoZWxwZXIgPT09IFwiZnVuY3Rpb25cIiA/IGhlbHBlci5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSkse1wibmFtZVwiOlwibmFtZVwiLFwiaGFzaFwiOnt9LFwiZGF0YVwiOmRhdGF9KSA6IGhlbHBlcikpKVxuICAgICsgXCI8L2g0PlxcbjwvZGl2PlxcbjxuYXYgY2xhc3M9XFxcImctLTEyIG5vLW1hcmdpbi12ZXJ0aWNhbCBmYWRlLWluLWZyb20tbGVmdFxcXCJcXG4gICAgIHJvbGU9XFxcIm5hdmlnYXRpb25cXFwiPlxcblxcbiAgPGEgaHJlZj1cXFwiI2hvbWVcXFwiPlxcbiAgICA8aSBjbGFzcz1cXFwiZmEgZmEtaG9tZSBmYS0yeFxcXCI+PC9pPlxcbiAgICAgIDxzcGFuIGNsYXNzPVxcXCJtLS0xXFxcIj5Ib21lPC9zcGFuPlxcbiAgPC9hPlxcblxcbiAgPGRpdiBjbGFzcz1cXFwibmF2LWNvbGxhcHNpYmxlIG5vLW1hcmdpbi12ZXJ0aWNhbFxcXCI+XFxuICAgIDxpbnB1dCB0eXBlPVxcXCJjaGVja2JveFxcXCIgaWQ9XFxcIm5hdi1kb2N1bWVudGF0aW9uXFxcIj5cXG4gICAgPGxhYmVsIGZvcj1cXFwibmF2LWRvY3VtZW50YXRpb25cXFwiPlxcbiAgICAgICAgPGkgY2xhc3M9XFxcImZhIGZhLWJvb2tcXFwiPjwvaT5cXG4gICAgICAgIDxzcGFuIGNsYXNzPVxcXCJtLS0xXFxcIj5Eb2N1bWVudGF0aW9uPHNwYW4+XFxuICAgICAgPC9sYWJlbD5cXG4gICAgPGRpdiBjbGFzcz1cXFwibmF2LWNvbGxhcHNpYmxlLWxpbmtzXFxcIj5cXG4gICAgICA8YSBocmVmPVxcXCIjc3RydWN0dXJlXFxcIj5Qcm9qZWN0IFN0cnVjdHVyZTwvYT5cXG4gICAgICA8YSBocmVmPVxcXCIjd29ya2Zsb3dcXFwiPldvcmtmbG93PC9hPlxcbiAgICAgIDxhIGhyZWY9XFxcIiNndWxwXFxcIj5HdWxwIFRhc2tzPC9hPlxcbiAgICAgIDxhIGhyZWY9XFxcIiNkb2N1bWVudGF0aW9uXFxcIj5HZW5lcmF0aW5nIERvY3VtZW50YXRpb248L2E+XFxuICAgICAgPGEgaHJlZj1cXFwiI2hhbmRsZWJhcnNcXFwiPkhhbmRsZWJhcnMgUmVmZXJlbmNlPC9hPlxcbiAgICAgIDxhIGhyZWY9XFxcIiNzdXJmYWNlXFxcIj5TdXJmYWNlIENTUyBSZWZlcmVuY2U8L2E+XFxuICAgICAgPGEgaHJlZj1cXFwiI2V4dGVybmFsXFxcIj5FeHRlcm5hbCBJbmZvcm1hdGlvbjwvYT5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG5cXG4gIDxhIGhyZWY9XFxcIiNhYm91dFxcXCI+XFxuICAgICAgPGkgY2xhc3M9J2ZhIGZhLXVzZXIgZmEtMngnPjwvaT5cXG4gICAgICA8c3BhbiBjbGFzcz1cXFwibS0tMVxcXCI+QWJvdXQ8L3NwYW4+XFxuICA8L2E+XFxuICBcXG4gIDxhIGhyZWY9XFxcIiNkaXNjXFxcIj5cXG4gICAgICA8aSBjbGFzcz0nZmEgZmEtYmFyLWNoYXJ0IGZhLTJ4Jz48L2k+XFxuICAgICAgPHNwYW4gY2xhc3M9XFxcIm0tLTFcXFwiPkRpc2M8L3NwYW4+XFxuICA8L2E+XFxuICBcXG48L25hdj5cXG5cIjtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuY29udGFpbmVyW1wicGFnZVwiXSA9IGNvbnRhaW5lcltcInBhZ2VcIl0gfHwge307XG5jb250YWluZXJbXCJwYWdlXCJdW1wiYWJvdXRcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgICAgPGRpdiBjbGFzcz1cXFwiZy0tMTAgbS0tMSBuby1tYXJnaW5cXFwiPlxcbiAgICAgICAgICAgIDxoMiBjbGFzcz1cXFwibS0tMSBjb2xvci0tcGFwZXIgZmFkZS1pbi1mcm9tLXRvcFxcXCI+QWJvdXQ8L2gyPlxcbiAgICAgIDwvZGl2PlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkXFxcIj5cXG4gICAgICA8aDI+QXV0aG9yPC9oMj5cXG4gICAgICA8cD5cXG4gICAgICAgIEZsdXhidWlsZCBpcyB3cml0dGVuIGJ5IDxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9GbHViYmV4XFxcIj5GbHViYmV4LjwvYT5cXG4gICAgICA8L3A+XFxuICAgIDwvZGl2PlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcInBhZ2VcIl0gPSBjb250YWluZXJbXCJwYWdlXCJdIHx8IHt9O1xuY29udGFpbmVyW1wicGFnZVwiXVtcImRpc2NcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSxcImZ1bGxwYWdlXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgIDxlbWJlZCBzcmM9XFxcImNvbnRlbnQvZGlzYy9pbmRleC5odG1sXFxcIiBcXG4gICAgICAgICBjbGFzcz1cXFwibm8tbWFyZ2luXFxcIiBcXG4gICAgICAgICBzdHlsZT1cXFwiaGVpZ2h0OjkwJTt3aWR0aDoxMDAlXFxcIj48L2VtYmVkPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcInBhZ2VcIl0gPSBjb250YWluZXJbXCJwYWdlXCJdIHx8IHt9O1xuY29udGFpbmVyW1wicGFnZVwiXVtcImRvY3VtZW50YXRpb25cIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImctLTEwIG0tLTEgbm8tbWFyZ2luXFxcIj5cXG4gICAgICA8aDIgY2xhc3M9XFxcIm0tLTEgZmFkZS1pbi1mcm9tLXRvcCBjb2xvci0tcGFwZXJcXFwiPkdlbmVyYXRpbmcgRG9jdW1lbnRhdGlvbjwvaDI+XFxuICAgIDwvZGl2PlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8aDI+Q29taW5nIFNvb248L2gyPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcInBhZ2VcIl0gPSBjb250YWluZXJbXCJwYWdlXCJdIHx8IHt9O1xuY29udGFpbmVyW1wicGFnZVwiXVtcImV4dGVybmFsXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8ZGl2IGNsYXNzPVxcXCJnLS0xMCBtLS0xIG5vLW1hcmdpblxcXCI+XFxuICAgICAgPGgyIGNsYXNzPVxcXCJtLS0xIGZhZGUtaW4tZnJvbS10b3AgY29sb3ItLXBhcGVyXFxcIj5FeHRlcm5hbCBJbmZvcm1hdGlvbjwvaDI+XFxuICAgIDwvZGl2PlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8ZGl2IGNsYXNzPVxcXCJjb250YWluZXIgY29udGFpbmVyLS13cmFwXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkIG5vLW1hcmdpbi12ZXJ0aWNhbCBnLS0zIGctbS0tNCBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5CYWNrYm9uZTwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vYmFja2JvbmVqcy5vcmcvXFxcIj5PZmZpY2lhbCB3ZWJzaXRlPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPmRvYy5qczwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vZG9jdW1lbnRhdGlvbi5qcy5vcmcvXFxcIj5vZmZpY2lhbCB3ZWJzaXRlPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL2dpdGh1Yi5jb20vZG9jdW1lbnRhdGlvbmpzL2RvY3VtZW50YXRpb24vYmxvYi9tYXN0ZXIvZG9jcy9HRVRUSU5HX1NUQVJURUQubWRcXFwiPkRvY3VtZW50YXRpb248L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+c2NhbGVBcHA8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cDovL3NjYWxlYXBwLm9yZy9cXFwiPm9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMiBnLS0zIGctbS0tNCBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5aZXN0PC9oMj5cXG4gICAgICAgIDx1bD5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9jaGpqL3plc3RcXFwiPkdpdGh1YjwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvemVzdFxcXCI+TlBNIFBhY2thZ2U8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+QnJvd3NlcmlmeTwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vYnJvd3NlcmlmeS5vcmcvXFxcIj5PZmZpY2lhbCBTaXRlPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL2dpdGh1Yi5jb20vc3Vic3RhY2svbm9kZS1icm93c2VyaWZ5I3VzYWdlXFxcIj5Eb2N1bWVudGF0aW9uPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPkF0b20uanM8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXRvbS1qc1xcXCI+TlBNIFBhY2thZ2U8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+R3VscDwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vZ3VscGpzLmNvbS9cXFwiPk9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9ndWxwanMvZ3VscC90cmVlL21hc3Rlci9kb2NzXFxcIj5Eb2N1bWVudGF0aW9uIChHaXRodWIpPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vZ3VscGpzLm9yZy9yZWNpcGVzL1xcXCI+UmVjaXBlcyAoR3VscC5qcyk8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vZ2l0aHViLmNvbS9ndWxwanMvZ3VscC90cmVlL21hc3Rlci9kb2NzL3JlY2lwZXNcXFwiPlJlY2lwZXMgKEdpdGh1Yik8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+SGFuZGxlYmFyczwvaDI+XFxuICAgICAgICA8dWw+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwOi8vaGFuZGxlYmFyc2pzLmNvbS9cXFwiPk9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMyBnLW0tLTQgZy10LS0xMlxcXCI+XFxuICAgICAgICA8aDI+TW9jaGE8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly9tb2NoYWpzLm9yZy9cXFwiPk9mZmljaWFsIHdlYnNpdGU8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vbW9jaGFqbC5yZWFkdGhlZG9jcy5pby9lbi9sYXRlc3QvXFxcIj5Eb2N1bWVudGF0aW9uPC9hPjwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTMgZy1tLS00IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPlN1cmZhY2UgQ1NTPC9oMj5cXG4gICAgICAgIDx1bD5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHA6Ly9taWxkcmVuYmVuLmdpdGh1Yi5pby9zdXJmYWNlL1xcXCI+T2ZmaWNpYWwgd2Vic2l0ZTwvYT48L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkIG5vLW1hcmdpbi12ZXJ0aWNhbCBnLS0zIGctbS0tNCBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5HdWxwIFBsdWdpbnM8L2gyPlxcbiAgICAgICAgPHVsPlxcbiAgICAgICAgICA8YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLWNvbmNhdFxcXCI+XFxuICAgICAgICAgIGd1bHAtY29uY2F0XFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtZGVjbGFyZVxcXCI+XFxuICAgICAgICAgIGd1bHAtZGVjbGFyZVxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLWRvY3VtZW50YXRpb25cXFwiPlxcbiAgICAgICAgICBndWxwLWRvY3VtZW50YXRpb25cXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC1oYW5kbGViYXJzXFxcIj5cXG4gICAgICAgICAgZ3VscC1oYW5kbGViYXJzXFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgICAgPGxpPjxhIGhyZWY9XFxcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2d1bHAtaHViXFxcIj5cXG4gICAgICAgICAgZ3VscC1odWJcXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC1qc2hpbnRcXFwiPlxcbiAgICAgICAgICBndWxwLWpzaGludFxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLW9wZW5cXFwiPlxcbiAgICAgICAgICBndWxwLW9wZW5cXG4gICAgICAgIDwvYT48L2xpPlxcbiAgICAgICAgICA8bGk+PGEgaHJlZj1cXFwiaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvZ3VscC10YXBcXFwiPlxcbiAgICAgICAgICBndWxwLXRhcFxcbiAgICAgICAgPC9hPjwvbGk+XFxuICAgICAgICAgIDxsaT48YSBocmVmPVxcXCJodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ndWxwLXVnbGlmeVxcXCI+XFxuICAgICAgICAgIGd1bHAtdWdsaWZ5XFxuICAgICAgICA8L2E+PC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcInBhZ2VcIl0gPSBjb250YWluZXJbXCJwYWdlXCJdIHx8IHt9O1xuY29udGFpbmVyW1wicGFnZVwiXVtcImd1bHBcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImctLTEwIG0tLTEgbm8tbWFyZ2luXFxcIj5cXG4gICAgICA8aDIgY2xhc3M9XFxcIm0tLTEgZmFkZS1pbi1mcm9tLXRvcCBjb2xvci0tcGFwZXJcXFwiPkd1bHAgVGFza3M8L2gyPlxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCI0XCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGgyPkNvbWluZyBTb29uPC9oMj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJwYWdlXCJdID0gY29udGFpbmVyW1wicGFnZVwiXSB8fCB7fTtcbmNvbnRhaW5lcltcInBhZ2VcIl1bXCJoYW5kbGViYXJzXCJdID0gSGFuZGxlYmFycy50ZW1wbGF0ZSh7XCIxXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxLCBhbGlhczE9ZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSwgYWxpYXMyPWhlbHBlcnMuaGVscGVyTWlzc2luZztcblxuICByZXR1cm4gXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJoZWFkZXJcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDIsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcInBhZ2VcIix7XCJuYW1lXCI6XCJjb250ZW50XCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDQsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpXG4gICAgKyBcIlxcblwiO1xufSxcIjJcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8ZGl2IGNsYXNzPVxcXCJnLS0xMCBtLS0xIG5vLW1hcmdpblxcXCI+XFxuICAgICAgPGgyIGNsYXNzPVxcXCJtLS0xIGZhZGUtaW4tZnJvbS10b3AgY29sb3ItLXBhcGVyXFxcIj5IYW5kbGViYXJzIFJlZmVyZW5jZTwvaDI+XFxuICAgIDwvZGl2PlxcblwiO1xufSxcIjRcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHJldHVybiBcIiAgICA8aDI+Q29taW5nIFNvb248L2gyPlxcblwiO1xufSxcImNvbXBpbGVyXCI6WzcsXCI+PSA0LjAuMFwiXSxcIm1haW5cIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazE7XG5cbiAgcmV0dXJuICgoc3RhY2sxID0gKGhlbHBlcnMuZXh0ZW5kIHx8IChkZXB0aDAgJiYgZGVwdGgwLmV4dGVuZCkgfHwgaGVscGVycy5oZWxwZXJNaXNzaW5nKS5jYWxsKGRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksXCJsYXlvdXRcIix7XCJuYW1lXCI6XCJleHRlbmRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMSwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIik7XG59LFwidXNlRGF0YVwiOnRydWV9KTtcbmNvbnRhaW5lcltcInBhZ2VcIl0gPSBjb250YWluZXJbXCJwYWdlXCJdIHx8IHt9O1xuY29udGFpbmVyW1wicGFnZVwiXVtcImhvbWVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImctLTEwIG0tLTEgbm8tbWFyZ2luXFxcIj5cXG5cXG4gICAgICA8aDIgY2xhc3M9XFxcIm0tLTIgY29sb3ItLXBhcGVyIGZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tNVxcXCI+XFxuICAgICAgICBFbWJlci1pbnNwaXJlZCBidWlsZCB0b29sIHdyaXR0ZW4gaW4gTm9kZS5qc1xcbiAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMTBcXFwiPlxcbiAgICAgICAgICBmb3IgY3JlYXRpbmcgZmFzdCxcXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMTVcXFwiPmxpZ2h0d2VpZ2h0LDwvc3Bhbj5cXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMjBcXFwiPnVuY291cGxlZCw8L3NwYW4+XFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJmYWRlLWluLWZyb20tdG9wIGFuaW0tZGVsYXktLTI1XFxcIj5mdWxsLXNjYWxlIGFwcGxpY2F0aW9ucyAtIDwvc3Bhbj5cXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImZhZGUtaW4tZnJvbS10b3AgYW5pbS1kZWxheS0tMzVcXFwiPnRoYXQgd29yayBhbnl3aGVyZSA8L3NwYW4+XFxuICAgICAgICA8L3NwYW4+XFxuICAgICAgPC9oMj5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJyaWdodCBuby1tYXJnaW4gY29sb3ItLXdoaXRlXFxcIj5cXG4gICAgICAgIDxpIGNsYXNzPVxcXCJmYWRlLWluLWZyb20tYm90dG9tIGFuaW0tZGVsYXktLTMwIGZhIGZhLXNlcnZlciBmYS0zeFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvaT5cXG4gICAgICAgIDxpIGNsYXNzPVxcXCJmYWRlLWluLWZyb20tYm90dG9tIGFuaW0tZGVsYXktLTM1IGZhIGZhLWxhcHRvcCBmYS0zeFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvaT5cXG4gICAgICAgIDxpIGNsYXNzPVxcXCJmYWRlLWluLWZyb20tYm90dG9tIGFuaW0tZGVsYXktLTQwIGZhIGZhLW1vYmlsZSBmYS0zeFxcXCIgYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPjwvaT5cXG4gICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImNvbnRhaW5lciBjb250YWluZXItLXdyYXAgbm8tbWFyZ2luXFxcIj5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkIG5vLW1hcmdpbi12ZXJ0aWNhbCBnLS00IGctbS0tNiBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5HdWxwIDQ8L2gyPlxcbiAgICAgICAgPHA+XFxuICAgICAgICAgIGd1bHAgaXMgYSB0b29sa2l0IGZvciBhdXRvbWF0aW5nIHBhaW5mdWwgb3IgdGltZS1jb25zdW1pbmcgdGFza3MgaW4geW91ciBkZXZlbG9wbWVudCB3b3JrZmxvdywgc28geW91IGNhbiBzdG9wIG1lc3NpbmcgYXJvdW5kIGFuZCBidWlsZCBzb21ldGhpbmcuXFxuICAgICAgICAgIDxwPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTQgZy1tLS02IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPkJyb3dzZXJpZnk8L2gyPlxcbiAgICAgICAgPHA+XFxuICAgICAgICAgIEJyb3dzZXJzIGRvbid0IGhhdmUgdGhlIHJlcXVpcmUgbWV0aG9kIGRlZmluZWQsIGJ1dCBOb2RlLmpzIGRvZXMuIFdpdGggQnJvd3NlcmlmeSB5b3UgY2FuIHdyaXRlIGNvZGUgdGhhdCB1c2VzIHJlcXVpcmUgaW4gdGhlIHNhbWUgd2F5IHRoYXQgeW91IHdvdWxkIHVzZSBpdCBpbiBOb2RlLlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTQgZy1tLS02IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPkJhY2tib25lPC9oMj5cXG4gICAgICAgIDxwPlxcbiAgICAgICAgICBCYWNrYm9uZS5qcyBnaXZlcyBzdHJ1Y3R1cmUgdG8gd2ViIGFwcGxpY2F0aW9ucyBieSBwcm92aWRpbmcgbW9kZWxzIHdpdGgga2V5LXZhbHVlIGJpbmRpbmcgYW5kIGN1c3RvbSBldmVudHMsIGNvbGxlY3Rpb25zIHdpdGggYSByaWNoIEFQSSBvZiBlbnVtZXJhYmxlIGZ1bmN0aW9ucywgdmlld3Mgd2l0aCBkZWNsYXJhdGl2ZSBldmVudCBoYW5kbGluZywgYW5kIGNvbm5lY3RzIGl0IGFsbCB0byB5b3VyIGV4aXN0aW5nIEFQSSBvdmVyIGEgUkVTVGZ1bFxcbiAgICAgICAgICBKU09OIGludGVyZmFjZS5cXG4gICAgICAgIDwvcD5cXG4gICAgICA8L2Rpdj5cXG5cXG4gICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkIG5vLW1hcmdpbi12ZXJ0aWNhbCBnLS00IGctbS0tNiBnLXQtLTEyXFxcIj5cXG4gICAgICAgIDxoMj5aZXN0PC9oMj5cXG5cXG4gICAgICAgIDxwPlxcbiAgICAgICAgICB6ZXN0IGlzIGEgZmFzdCwgbGlnaHR3ZWlnaHQsIGFuZCBleHRlbnNpYmxlIENTUyBzZWxlY3RvciBlbmdpbmUuIFplc3Qgd2FzIGRlc2lnbmVkIHRvIGJlIHZlcnkgY29uY2lzZSB3aGlsZSBzdGlsbCBzdXBwb3J0aW5nIENTUzMvQ1NTNCBzZWxlY3RvcnMgYW5kIHJlbWFpbmluZyBmYXN0LlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTQgZy1tLS02IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPkhhbmRsZWJhcnM8L2gyPlxcbiAgICAgICAgPHA+XFxuICAgICAgICAgIEhhbmRsZWJhcnMgcHJvdmlkZXMgdGhlIHBvd2VyIG5lY2Vzc2FyeSB0byBsZXQgeW91IGJ1aWxkIHNlbWFudGljIHRlbXBsYXRlcyBlZmZlY3RpdmVseSB3aXRoIG5vIGZydXN0cmF0aW9uLlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQgbm8tbWFyZ2luLXZlcnRpY2FsIGctLTQgZy1tLS02IGctdC0tMTJcXFwiPlxcbiAgICAgICAgPGgyPlN1cmZhY2UgQ1NTPC9oMj5cXG4gICAgICAgIDxwPlxcbiAgICAgICAgICBEZXNpZ24gcGhpbG9zb3BoeSBhbmQgYWVzdGhldGljcyBpbnNwaXJlZCBieSBHb29nbGUncyBNYXRlcmlhbCBEZXNpZ24uXFxuICAgICAgICA8L3A+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZCBuby1tYXJnaW4tdmVydGljYWwgZy0tMTJcXFwiIHN0eWxlPVxcXCJ0ZXh0LWFsaWduOmNlbnRlcjtcXFwiPlxcbiAgICAgICAgPGgyPkZsdXhidWlsZDwvaDI+XFxuICAgICAgICA8cD5cXG4gICAgICAgICAgQnVpbGQgYmxhemluZ2x5LWZhc3QgYXBwbGljYXRpb25zIHVzaW5nIGFsbCBvZiB0aGUgYWJvdmUsIHdpdGggcHJlbWFkZSBndWxwIHRhc2tzIGZvciBhdXRvbWF0ZWQgdGVzdGluZywgZG9jdW1lbnRhdGlvbix0ZW1wbGF0aW5nIGFuZCBtb3JlLiBDb25maWd1cmFibGUgdG8gZml0IHlvdXIgZmF2b3JpdGUgd29ya2Zsb3cgd2l0aG91dCBnZXR0aW5nIGluIHlvdXIgd2F5LlxcbiAgICAgICAgPC9wPlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICA8L2Rpdj5cXG5cIjtcbn0sXCJjb21waWxlclwiOls3LFwiPj0gNC4wLjBcIl0sXCJtYWluXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICB2YXIgc3RhY2sxO1xuXG4gIHJldHVybiAoKHN0YWNrMSA9IChoZWxwZXJzLmV4dGVuZCB8fCAoZGVwdGgwICYmIGRlcHRoMC5leHRlbmQpIHx8IGhlbHBlcnMuaGVscGVyTWlzc2luZykuY2FsbChkZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLFwibGF5b3V0XCIse1wibmFtZVwiOlwiZXh0ZW5kXCIsXCJoYXNoXCI6e30sXCJmblwiOmNvbnRhaW5lci5wcm9ncmFtKDEsIGRhdGEsIDApLFwiaW52ZXJzZVwiOmNvbnRhaW5lci5ub29wLFwiZGF0YVwiOmRhdGF9KSkgIT0gbnVsbCA/IHN0YWNrMSA6IFwiXCIpO1xufSxcInVzZURhdGFcIjp0cnVlfSk7XG5jb250YWluZXJbXCJwYWdlXCJdID0gY29udGFpbmVyW1wicGFnZVwiXSB8fCB7fTtcbmNvbnRhaW5lcltcInBhZ2VcIl1bXCJzdHJ1Y3R1cmVcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImctLTEwIG0tLTEgbm8tbWFyZ2luXFxcIj5cXG4gICAgICA8aDIgY2xhc3M9XFxcIm0tLTEgZmFkZS1pbi1mcm9tLXRvcCBjb2xvci0tcGFwZXJcXFwiPlByb2plY3QgU3RydWN0dXJlPC9oMj5cXG4gICAgPC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxoMj5Db21pbmcgU29vbjwvaDI+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5leHRlbmQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuZXh0ZW5kKSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSxcImxheW91dFwiLHtcIm5hbWVcIjpcImV4dGVuZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuY29udGFpbmVyW1wicGFnZVwiXSA9IGNvbnRhaW5lcltcInBhZ2VcIl0gfHwge307XG5jb250YWluZXJbXCJwYWdlXCJdW1wic3VyZmFjZVwiXSA9IEhhbmRsZWJhcnMudGVtcGxhdGUoe1wiMVwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMSwgYWxpYXMxPWRlcHRoMCAhPSBudWxsID8gZGVwdGgwIDogKGNvbnRhaW5lci5udWxsQ29udGV4dCB8fCB7fSksIGFsaWFzMj1oZWxwZXJzLmhlbHBlck1pc3Npbmc7XG5cbiAgcmV0dXJuIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwiaGVhZGVyXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgyLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIlxuICAgICsgKChzdGFjazEgPSAoaGVscGVycy5jb250ZW50IHx8IChkZXB0aDAgJiYgZGVwdGgwLmNvbnRlbnQpIHx8IGFsaWFzMikuY2FsbChhbGlhczEsXCJwYWdlXCIse1wibmFtZVwiOlwiY29udGVudFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSg0LCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKVxuICAgICsgXCJcXG5cIjtcbn0sXCIyXCI6ZnVuY3Rpb24oY29udGFpbmVyLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgICByZXR1cm4gXCIgICAgPGRpdiBjbGFzcz1cXFwiZy0tMTAgbS0tMSBuby1tYXJnaW5cXFwiPlxcbiAgICAgIDxoMiBjbGFzcz1cXFwibS0tMSBmYWRlLWluLWZyb20tdG9wIGNvbG9yLS1wYXBlclxcXCI+U3VyZmFjZSBDU1MgUmVmZXJlbmNlPC9oMj5cXG4gICAgPC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxoMj5Db21pbmcgU29vbjwvaDI+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5leHRlbmQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuZXh0ZW5kKSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSxcImxheW91dFwiLHtcIm5hbWVcIjpcImV4dGVuZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pO1xuY29udGFpbmVyW1wicGFnZVwiXSA9IGNvbnRhaW5lcltcInBhZ2VcIl0gfHwge307XG5jb250YWluZXJbXCJwYWdlXCJdW1wid29ya2Zsb3dcIl0gPSBIYW5kbGViYXJzLnRlbXBsYXRlKHtcIjFcIjpmdW5jdGlvbihjb250YWluZXIsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICAgIHZhciBzdGFjazEsIGFsaWFzMT1kZXB0aDAgIT0gbnVsbCA/IGRlcHRoMCA6IChjb250YWluZXIubnVsbENvbnRleHQgfHwge30pLCBhbGlhczI9aGVscGVycy5oZWxwZXJNaXNzaW5nO1xuXG4gIHJldHVybiBcIlxcblwiXG4gICAgKyAoKHN0YWNrMSA9IChoZWxwZXJzLmNvbnRlbnQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuY29udGVudCkgfHwgYWxpYXMyKS5jYWxsKGFsaWFzMSxcImhlYWRlclwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oMiwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCJcbiAgICArICgoc3RhY2sxID0gKGhlbHBlcnMuY29udGVudCB8fCAoZGVwdGgwICYmIGRlcHRoMC5jb250ZW50KSB8fCBhbGlhczIpLmNhbGwoYWxpYXMxLFwicGFnZVwiLHtcIm5hbWVcIjpcImNvbnRlbnRcIixcImhhc2hcIjp7fSxcImZuXCI6Y29udGFpbmVyLnByb2dyYW0oNCwgZGF0YSwgMCksXCJpbnZlcnNlXCI6Y29udGFpbmVyLm5vb3AsXCJkYXRhXCI6ZGF0YX0pKSAhPSBudWxsID8gc3RhY2sxIDogXCJcIilcbiAgICArIFwiXFxuXCI7XG59LFwiMlwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxkaXYgY2xhc3M9XFxcImctLTEwIG0tLTEgbm8tbWFyZ2luXFxcIj5cXG4gICAgICA8aDIgY2xhc3M9XFxcIm0tLTEgZmFkZS1pbi1mcm9tLXRvcCBjb2xvci0tcGFwZXJcXFwiPldvcmtmbG93PC9oMj5cXG4gICAgPC9kaXY+XFxuXCI7XG59LFwiNFwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgcmV0dXJuIFwiICAgIDxoMj5Db21pbmcgU29vbjwvaDI+XFxuXCI7XG59LFwiY29tcGlsZXJcIjpbNyxcIj49IDQuMC4wXCJdLFwibWFpblwiOmZ1bmN0aW9uKGNvbnRhaW5lcixkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gICAgdmFyIHN0YWNrMTtcblxuICByZXR1cm4gKChzdGFjazEgPSAoaGVscGVycy5leHRlbmQgfHwgKGRlcHRoMCAmJiBkZXB0aDAuZXh0ZW5kKSB8fCBoZWxwZXJzLmhlbHBlck1pc3NpbmcpLmNhbGwoZGVwdGgwICE9IG51bGwgPyBkZXB0aDAgOiAoY29udGFpbmVyLm51bGxDb250ZXh0IHx8IHt9KSxcImxheW91dFwiLHtcIm5hbWVcIjpcImV4dGVuZFwiLFwiaGFzaFwiOnt9LFwiZm5cIjpjb250YWluZXIucHJvZ3JhbSgxLCBkYXRhLCAwKSxcImludmVyc2VcIjpjb250YWluZXIubm9vcCxcImRhdGFcIjpkYXRhfSkpICE9IG51bGwgPyBzdGFjazEgOiBcIlwiKTtcbn0sXCJ1c2VEYXRhXCI6dHJ1ZX0pOzsgcmV0dXJuIGNvbnRhaW5lcjt9IiwidmFyIFNpZGViYXJWaWV3ID0gcmVxdWlyZShcIi4vc2lkZWJhclwiKTtcblxudmFyIFBhZ2VWaWV3ID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRhdGEuZWwpO1xuICAgIHRoaXMudGVtcGxhdGUgPSBkYXRhLnRlbXBsYXRlO1xuICAgIHRoaXMubW9kZWwgICAgPSBkYXRhLm1vZGVsO1xufTsgIFxuXG5QYWdlVmlldy5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24ocGFnZSkge1xuICB0aGlzLmVsLmlubmVySFRNTCA9IHRoaXMudGVtcGxhdGVbcGFnZV0odGhpcy5tb2RlbCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlVmlldztcbiIsIlxudmFyIFNpZGViYXJWaWV3ID0gZnVuY3Rpb24oZGF0YSl7XG5cbiAgICB0aGlzLmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YS5lbCk7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IGRhdGEudGVtcGxhdGU7XG4gICAgdGhpcy5tb2RlbCA9IGRhdGEubW9kZWw7XG4gICAgdGhpcy5uYXYgPSBkYXRhLm5hdjtcbiAgICB0aGlzLnJlbmRlcigpO1xuXG4gIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrIGFcIix0aGlzLmhpZGUsdGhpcylcbiAgXG4gIHRoaXMucmVuZGVyKCk7XG59O1xuXG5TaWRlYmFyVmlldy5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubmF2LmNoZWNrZWQgPSBmYWxzZTtcbn1cblxuU2lkZWJhclZpZXcucHJvdG90eXBlLnJlbmRlciA9ICBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbCk7XG59XG4gIFxubW9kdWxlLmV4cG9ydHMgPSBTaWRlYmFyVmlldztcbiJdfQ==
