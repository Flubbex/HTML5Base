/**
 * Returns a function call to a target object property with one or
  more prefixed parameters.
 *
   @param {object} target The object on which to call the function.
   @param {string} call Name of the property to call from 'target'.
   @param {any} argument Prefixed argument to use when invoking the method.
   @returns {function} A function call which will invoke the method.
   @example
    //Once the window is loaded, it will call application.onLoaded
    //passing 'somedata' as the first argument
    window.onload = delegated(application,'onLoaded',somedata)
 */
module.exports = function(){
  var args   = [].slice.call(arguments),
      target = args.shift(),
      call   = args.shift();

  return function(){
    target[call].apply(target,args.concat([].slice.call(arguments)));
  }
}
