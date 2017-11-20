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
