var SidebarView = require("./sidebar");

var PageView = {
  initialize: function(data) {
    this.template = data.template;
    this.model    = data.model;
  },
  render: function(page) {
    this.$el.html(this.template[page](this.model));
  }
};

module.exports = PageView;
