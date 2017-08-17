var SidebarView = require("./sidebar");

var PageView = {
  initialize: function(data) {
    console.log("\t","\t","PageView initialized");
    this.template = data.template;
    this.model    = data.model;
  },
  render: function(page) {
    this.$el.html(this.template[page](this.model));
  }
};

module.exports = PageView;
