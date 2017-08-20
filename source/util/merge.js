module.exports = function() {
  var args = [].slice.call(arguments);
  args.unshift({});
  return Object.assign.apply(this, args);
};
