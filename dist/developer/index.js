(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(document).ready(function(){
            
		  var $bodyEl = $('body'),
			  $sidedrawerEl = $('#sidedrawer');
        
		  
		  // ==========================================================================
		  // Toggle Sidedrawer
		  // ==========================================================================
		  function showSidedrawer() {
			// show overlay
			var options = {
			  onclose: function() {
				$sidedrawerEl
				  .removeClass('active')
				  .appendTo(document.body);
			  }
			};
			
			var $overlayEl = $(mui.overlay('on', options));
			
			// show element
			$sidedrawerEl.appendTo($overlayEl);
			setTimeout(function() {
			  $sidedrawerEl.addClass('active');
			}, 20);
		  }
		  
		  
		  function hideSidedrawer() {
			$bodyEl.toggleClass('hide-sidedrawer');
		  }
		  
		  
		  $('.js-show-sidedrawer').on('click', showSidedrawer);
		  $('.js-hide-sidedrawer').on('click', hideSidedrawer);
		  
		  
		  // ==========================================================================
		  // Animate menu
		  // ==========================================================================
		  var $titleEls = $('strong', $sidedrawerEl);
		  
		  $titleEls
			.next()
			.hide();
		  
		  $titleEls.on('click', function() {
			$(this).next().slideToggle(200);
		  });
          
          $bodyEl.fadeIn(250,function(){
            
          $("#content").slideDown(250);
            
            $(".sidedrawer-toggle")
                .delay(500)
                .animate({opacity:1},200,"linear",function(){
                  $(this).animate({opacity:0.5},function(){
                      $(this).animate({opacity:1},function(){
                            $(this).animate({opacity:0.5},200);
                          });
                        
                  });
                });
        });
});
        
module.exports = {};

},{}]},{},[1])