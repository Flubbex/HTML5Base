var SidebarView = fluxbuild.Backbone.View.extend({
    initialize: function(data){
      this.template   = data.template;
      this.model      = data.model;
      this.navbutton  = fluxbuild.$(data.navid);

      if (this.model)
        this.render();

    },
    events:{
      "click a":"hide"
    },
    hide:function(){
      this.navbutton.checked = false;
    },
    render: function(){
      this.$el.html( this.template(this.model) );
    }
});

module.exports = SidebarView;
