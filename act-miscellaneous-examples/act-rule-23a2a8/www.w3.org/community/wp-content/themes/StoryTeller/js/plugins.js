// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/

window.log = function f() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        var args = arguments;
        var newarr;

        try {
            args.callee = f.caller;
        } catch(e) {

        }

        newarr = [].slice.call(args);

        if (typeof console.log === 'object') {
            log.apply.call(console.log, console, newarr);
        } else {
            console.log.apply(console, newarr);
        }
    }
};

// make it safe to use console.log always

(function(a) {
    function b() {}
    var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn";
    var d;
    for (c = c.split(","); !!(d = c.pop());) {
        a[d] = a[d] || b;
    }
})
(function() {
    try {
        console.log();
        return window.console;
    } catch(a) {
        return (window.console = {});
    }
}());

// leanModal v1.1 by Ray Stone - http://finelysliced.com.au
// Dual licensed under the MIT and GPL
// Modal windows with LeanModal.js
// http://leanmodal.finelysliced.com.au/

(function($){$.fn.extend({leanModal:function(options){var defaults={top:60,overlay:0.5,closeButton:null};var overlay=$("<div id='lean_overlay'></div>");$("body").append(overlay);options=$.extend(defaults,options);return this.each(function(){var o=options;$(this).click(function(e){var modal_id=$(this).attr("data-group");$("#lean_overlay").click(function(){close_modal(modal_id)});$(document).keyup(function(e) {if (e.keyCode == "27") { close_modal(modal_id); }});$(o.closeButton).click(function(){close_modal(modal_id)});var modal_height=$(modal_id).outerHeight();var modal_width=$(modal_id).outerWidth();
$("#lean_overlay").css({"display":"block",opacity:0});$("#lean_overlay").fadeTo(200,o.overlay);$(modal_id).css({"display":"block","position":"fixed","opacity":0,"z-index":11000,"left":50+"%","margin-left":-(modal_width/2)+"px","top":o.top+"px"});$(modal_id).fadeTo(200,1);e.preventDefault()})});function close_modal(modal_id){$("#lean_overlay").fadeOut(200);$(modal_id).css({"display":"none"})}}})})(jQuery);

//start the tabs
  (function($) {
    var tabElts = $( "#tabs, #tabs-more" );
    if(tabElts.length > 0) {
        tabElts.tabs();
    }
    var accor = $( "#accordion-general, #accordion-process, #accordion-legal, #accordion-reports, #accordion-tools " );
    if(accor.length > 0) {
    accor.accordion({
        header: "h3", collapsible: true, active: false, heightStyle: "content", navigation: true, 

        beforeActivate: function(event, ui) {
               // The accordion believes a panel is being opened
              if (ui.newHeader[0]) {
                  var currHeader  = ui.newHeader;
                  var currContent = currHeader.next('.ui-accordion-content');
               // The accordion believes a panel is being closed
              } else {
                  var currHeader  = ui.oldHeader;
                  var currContent = currHeader.next('.ui-accordion-content');
              }
               // Since we've changed the default behavior, this detects the actual status
              var isPanelSelected = currHeader.attr('aria-selected') == 'true';
              
               // Toggle the panel's header
              currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
              
              // Get hashtag from current header id and add it to the URL
              var whatHash = currHeader.attr('id');                            
              window.location.hash = whatHash;              

               // Toggle the panel's content
              currContent.toggleClass('accordion-content-active',!isPanelSelected)    
              if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

              return false; // Cancels the default action
        }          

      });   
      $(window.location.hash).click();
      
    
    }
  })(jQuery);

  // Sticky Plugin v1.0.0 for jQuery
  // =============
  // Author: Anthony Garand
  // Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
  // Improvements by Leonardo C. Daronco (daronco)
  // Created: 2/14/2011
  // Date: 2/12/2012
  // Website: http://labs.anthonygarand.com/sticky
  // Description: Makes an element on the page stick on the screen as you scroll
  //       It will only set the 'top' and 'position' of your element, you
  //       might need to adjust the width in some cases.

  (function($) {
    var defaults = {
        topSpacing: 0,
        bottomSpacing: 0,
        className: 'is-sticky',
        wrapperClassName: 'sticky-wrapper',
        center: false,
        getWidthFrom: ''
      },
      $window = $(window),
      $document = $(document),
      sticked = [],
      windowHeight = $window.height(),
      scroller = function() {
        var scrollTop = $window.scrollTop(),
          documentHeight = $document.height(),
          dwh = documentHeight - windowHeight,
          extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

        for (var i = 0; i < sticked.length; i++) {
          var s = sticked[i],
            elementTop = s.stickyWrapper.offset().top,
            etse = elementTop - s.topSpacing - extra;

          if (scrollTop <= etse) {
            if (s.currentTop !== null) {
              s.stickyElement
                .css('position', '')
                .css('top', '');
              s.stickyElement.parent().removeClass(s.className);
              s.currentTop = null;
            }
          }
          else {
            var newTop = documentHeight - s.stickyElement.outerHeight()
              - s.topSpacing - s.bottomSpacing - scrollTop - extra;
            if (newTop < 0) {
              newTop = newTop + s.topSpacing;
            } else {
              newTop = s.topSpacing;
            }
            if (s.currentTop != newTop) {
              s.stickyElement
                .css('position', 'fixed')
                .css('top', newTop);

              if (typeof s.getWidthFrom !== 'undefined') {
                s.stickyElement.css('width', $(s.getWidthFrom).width());
              }

              s.stickyElement.parent().addClass(s.className);
              s.currentTop = newTop;
            }
          }
        }
      },
      resizer = function() {
        windowHeight = $window.height();
      },
      methods = {
        init: function(options) {
          var o = $.extend(defaults, options);
          return this.each(function() {
            var stickyElement = $(this);

            var stickyId = stickyElement.attr('id');
            var wrapper = $('<div></div>')
              .attr('id', stickyId + '-sticky-wrapper')
              .addClass(o.wrapperClassName);
            stickyElement.wrapAll(wrapper);

            if (o.center) {
              stickyElement.parent().css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
            }

            if (stickyElement.css("float") == "right") {
              stickyElement.css({"float":"none"}).parent().css({"float":"right"});
            }

            var stickyWrapper = stickyElement.parent();
            stickyWrapper.css('height', stickyElement.outerHeight());
            sticked.push({
              topSpacing: o.topSpacing,
              bottomSpacing: o.bottomSpacing,
              stickyElement: stickyElement,
              currentTop: null,
              stickyWrapper: stickyWrapper,
              className: o.className,
              getWidthFrom: o.getWidthFrom
            });
          });
        },
        update: scroller
      };

    // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
    if (window.addEventListener) {
      window.addEventListener('scroll', scroller, false);
      window.addEventListener('resize', resizer, false);
    } else if (window.attachEvent) {
      window.attachEvent('onscroll', scroller);
      window.attachEvent('onresize', resizer);
    }

    $.fn.sticky = function(method) {
      if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === 'object' || !method ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error('Method ' + method + ' does not exist on jQuery.sticky');
      }
    };
    $(function() {
      setTimeout(scroller, 0);
    });
  })(jQuery);    
