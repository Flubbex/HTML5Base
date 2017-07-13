var PageView = fluxbuild.Backbone.View.extend({
    initialize: function(data){
      this.template   = data.template;
      this.model      = data.model;
    },
    render: function(page){
      this.$el.html( this.template[page](this.model) );
    }
});

module.exports = PageView;
