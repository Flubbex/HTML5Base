var SidebarView = {
    initialize: function(data) {
      console.log("\t","\t","Sidebarview initialized")
      this.template   = data.template;
      this.model      = data.model;
      this.nav        = data.nav;
      this.render();

    },
    events: {
      "click a": "hide"
    },
    hide: function() {
      this.nav.checked = false;
    },
    render: function() {
      this.$el.html(this.template(this.model));
    }
  };
module.exports = SidebarView;
