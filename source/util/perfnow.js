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
