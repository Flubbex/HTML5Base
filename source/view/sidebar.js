
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
