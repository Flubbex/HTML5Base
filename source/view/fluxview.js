var FluxView = fluxbuild.Backbone.View.extend({
    initialize: function(data){
      this.template = data.template;
      this.data     = data.viewdata;
    },
    events:{
      "click a":"hide"
    },
    hide:function(){
      fluxbuild.$("#nav--super-vertical-responsive").checked = false;
    },
    render: function(template,data){
      var template = template || this.template;
      var data     = data     || this.data;

      this.$el.html( template(data) );
    }
});

module.exports = FluxView;
