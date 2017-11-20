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
