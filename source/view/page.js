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
