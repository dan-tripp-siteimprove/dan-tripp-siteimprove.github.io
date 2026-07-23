(function ($) {

    var SortableEntry = Backbone.Model.extend({

        defaults: {
            title: "empty group",
            activity: Infinity,
            date: "",
            participants: 0,
            isCommunityGroup: true,
            //id           : "", // Not used
            //url          : "",
            /* for participants page*/
            name: "N/A",
            organization: "N/A"
        },

        render: function () {

        }

    });

    var SortableEntryView = Backbone.View.extend({

        tagName: "li",

        events: {
            "click .read-more": "expand"
        },

        expand: function () {
            var content = this.$(".group-content");

            _.map(this.$(".template"), function (template) {
                var t = $(template);
                t.replaceWith(t.html());
            });
            content.toggleClass("collapse-small");
            content.toggleClass("expand");
            return false;
        }

    });

    var Sortable = Backbone.Collection.extend({

        model: SortableEntry,

        initialize: function () {
            this.on("add reset destroy", this.render, this);

            this.parseFromContent();

            // Sorters
            var self = this;
            var reverse = function (control) {
                var sort_dir = $("span", control);
                if (sort_dir.hasClass("sort-up")) {
                    self.models = self.models.reverse();
                    sort_dir.addClass("sort-down").removeClass("sort-up");
                } else {
                    sort_dir.addClass("sort-up").removeClass("sort-down");
                }
            }
            var controls = $(".sort-button");
            var sorter = function (control) {
                var field = control.attr("id").replace(/^sort-/, "");
                control.click(function () {
                    $(".sortable-list").attr("data-sortedBy", field);
                    self.comparator = function (group) {
                        return group.get(field);
                    };
                    self.sort();
                    var sort_dir = $("span", control);
                    var isSortedUp = sort_dir.hasClass("sort-up");
                    var isSortedDown = sort_dir.hasClass("sort-down");
                    $("span", controls).removeClass("sort-down").removeClass("sort-up");
                    if (!isSortedUp && !isSortedDown && (field != 'title' && field != 'activity')) {
                        self.models = self.models.reverse();
                        sort_dir.addClass("sort-down");
                    } else {
                        if (isSortedUp) {
                            self.models = self.models.reverse();
                            sort_dir.addClass("sort-down");
                        } else {
                            sort_dir.addClass("sort-up");
                        }
                    }
                    self.render();
                });
            }
            controls.map(function (i, elem) {
                sorter($(elem))
            })

            // Filters
            this.searchInput = $("#live-search #filter");
            this.searchInput.bind("keyup change", function () {
                if (this.value != "") {
                    clearBox.show()
                } else {
                    clearBox.hide()
                }
                self.render();
            });
            var clearBox = $('#live-search .clear');
            clearBox.click(function () {
                self.searchInput.val("");
                self.searchInput.change();
                return false;
            })


            this.groupTypes = $("#types input");
            this.communityGroups = $("#cgroups");
            this.businessGroups = $("#bgroups");
            this.groupTypes.change(function () {
                self.render();
            });

            if (controls.length > 0) {
                controls[0].click();
            }
            clearBox.hide();
        },

        // returns a filtered array of entries
        filterEntries: function () {
            var self = this,
                currentSearch = self.searchInput.val();
            var filtered = this.filter(function (entry) {
                var isSearched = entry.get("title").search(new RegExp(currentSearch, "i")) >= 0 ||
                    entry.get("name").search(new RegExp(currentSearch, "i")) >= 0 ||
                    entry.get("organization").search(new RegExp(currentSearch, "i")) >= 0;
                var iscg = entry.get("isCommunityGroup") && self.communityGroups.is(":checked");
                var isbg = !entry.get("isCommunityGroup") && self.businessGroups.is(":checked");
                return isSearched && (iscg || isbg || (!self.communityGroups.is(":checked") && !self.businessGroups.is(":checked")));
            });
            return filtered;
        },

        parseFromContent: function () {
            var entries = $(".sortable-entry"), self = this;
            _.map(entries, function (entry) {
                var entryView = new SortableEntryView({
                    el: entry
                });
                var $entry = $(entry);
                var g = new SortableEntry({
                    title: $(".group-title", entry).text().trim().toLowerCase(),
                    activity: parseInt($(".group-title", entry).attr("data-activity-rank"), 10),
                    date: $(".group-meta time", entry).attr("datetime") || $(".col-date:last time", entry).attr("datetime"),
                    participants: parseInt($(".group-meta .participants", entry).attr("data-participants")),
                    isCommunityGroup: !$entry.hasClass("bg"),
                    name: $(".chair-name", entry).text().trim().toLowerCase(),
                    organization: $(".chair-affiliation", entry).text().trim().toLowerCase(),
                    view: entryView,
                });
                self.add(g, {silent: true});
                entryView.delegateEvents();
            });
        },

        render: function () {
            var el = $(".sortable-list");
            var lst = $("ul:first", el);
            var filtered = this.filterEntries();
            $('#group_count').text(filtered.length);
            if (filtered.length > 1) {
                $('.plural').text("s");
            } else {
                $('.plural').text("");
            }
            this.map(function (entry) {
                entry.get("view").$el.detach();
            });
            filtered.map(function (entry) {
                lst.append(entry.get("view").el);
            });
        },
    });

    $(function () {

        var url, redirect;

        // Change login links to open modal window instead
// login modal disabled by Gerald 2023-07-14
// https://lists.w3.org/Archives/Team/team-community-process/2023Mar/0317.html
// https://lists.w3.org/Archives/Team/sysreq/2023Jul/0133.html
//        $("a[href*='wp-login.php']:not([href*='action=logout'])").addClass("leanModal").attr("data-group", "#login-modal");
        // When clicking on a login link, replace the form's redirect_to input with the link's one
        $("a[href*='wp-login.php']:not([href*='action=logout'])").click(function () {
            if ($(this).attr('action') == 'logout') {
                return;
            }
            url = $(this).attr("href");
            redirect = url.indexOf('redirect_to=');
            if (redirect > -1) {
                redirect = unescape(url.substr(url.indexOf('redirect_to=') + 12));
            } else {
                redirect = "/community/wp-admin/";
            }
            $("#login-modal #loginform input[name='redirect_to']").attr("value", redirect);
        });

        // Hide login form on submit
        $("#loginform").submit(function (event) {
            $("#lean_overlay").fadeOut(200);
            $("#login-modal").css({'display': 'none'});
        });

        // Call modal windows when pressing <button> elements with specific rel attr
        // $("#go").leanModal();
        // $("button[rel*=leanModal]").leanModal();
        $(".leanModal").leanModal({closeButton: ".modal_close"});


        // Markup changes to make reports page look good with JS
        /*$(".sortable-entry").each(function (index, el) {
            var groupContent = $(".group-content", this);
            var dates = $("time", this).map(function () {
                return $(this).attr("datetime");
            }).sort();
            date = dates[dates.length - 1];
            groupContent.before($("<div class='group-meta' style='display: none'><time datetime='"+date+"'>"+date+"</date></div>"));
            groupContent.before($("<div class='group-desc'>"+$("p", groupContent).text().substring(0,119)+"…</div>"));
            groupContent.hide();
        });*/

        _.map($(".template.show"), function (template) {
            var t = $(template);
            t.replaceWith(t.html());
        });


        window.groupList = new Sortable();
        $(".group-content").addClass("collapse-small");
        $("#only-proposed-groups .group-content").removeClass('collapse-small');
    });


// Add the css classes to all input submit buttons
    $('input#submit').addClass('button action orange');

// When URI with hashtag, scroll the page to pass the WP top bar
// Expand the content if Read more is present
    $(function () {
        // Retrieves the hash from URL
        var hash = window.location.hash.substring(1);

        // If hash length > 0 (there is actually a hash)
        // And the #hash element exists on page
        if (hash.length > 0 && $('#' + hash).size() > 0) {

            // Binds a function to the page scroll
            $(document).on('scroll', function () {

                var elemTop = $('#' + hash).offset().top; // Retrieve element's offset top
                var docTop = $(document).scrollTop(); // Retrieve page's offset

                if ((Math.round(elemTop)) == docTop) {
                    // Scroll the page 50px down
                    window.scrollBy(0, -50);
                }
                $(document).unbind('scroll');

                // Add class to the #hash(id) and trigger the Read more click to expand
                $('#' + hash).addClass("expand-hook");
                $(".expand-hook .read-more").trigger("click");

                // Find the tab associated with the hashtag and trigger the click
                var $zeeParent = $(".expand-hook").parent().parent();
                $("li.ui-state-default").each(function () {
                    if ($(this).attr("aria-labelledby") == $zeeParent.attr("aria-labelledby")) {
                        $(this).children("h3").children().trigger("click");
                    }
                    ;
                });
            });
        }
    });

// Make the story wheels spin while scrolling up/down
    $(window).scroll(function () {
        var top = $(document).scrollTop();
        $(".brown-wheel").css({
            '-webkit-transform': 'rotate(' + top + 'deg)',
            '-moz-transform': 'rotate(' + top + 'deg)',
            '-o-transform': 'rotate(' + top + 'deg)',
            '-ms-transform': 'rotate(' + top + 'deg)',
            'transform': 'rotate(' + top + 'deg)'
        });
        $(".green-wheel").css({
            '-webkit-transform': 'rotate(' + top + 'deg)',
            '-moz-transform': 'rotate(' + top + 'deg)',
            '-o-transform': 'rotate(' + top + 'deg)',
            '-ms-transform': 'rotate(' + top + 'deg)',
            'transform': 'rotate(' + top + 'deg)'
        });
        $(".orange-wheel").css({
            '-webkit-transform': 'rotate(-' + top + 'deg)',
            '-moz-transform': 'rotate(-' + top + 'deg)',
            '-o-transform': 'rotate(-' + top + 'deg)',
            '-ms-transform': 'rotate(-' + top + 'deg)',
            'transform': 'rotate(-' + top + 'deg)'
        });
    });


// Disable "continue" button on join form if affiliation checkbox is not clicked
// if($("#check-affiliation").is(':checked')) {
//     $("#affiliation-continue").removeClass("disabled");
//     $("#affiliation-continue").removeAttr("disabled");
// } else {
//     $("#affiliation-continue").addClass("disabled");
//     $("#affiliation-continue").attr("disabled", "disabled");
// }
// $("#check-affiliation").click(function(){
//     if($(this).is(':checked')) {
//         $("#affiliation-continue").removeClass("disabled");
//         $("#affiliation-continue").removeAttr("disabled");
//     } else {
//         $("#affiliation-continue").addClass("disabled");
//         $("#affiliation-continue").attr("disabled", "disabled");
//     }
// });

// join pages

// $(".join-agreement .wrap-fluid-groups").hide();
// $("#agreement .read-more-content").hide();

    $("#affiliation-continue").click(function (e) {
        $("#agreement").slideToggle();
        e.preventDefault();
    });

    $(".continue").on("click", function (event) {
        var block = $(".read-more-content", $(this).parent());

        block.slideDown();
        $(this).hide();
        $(".read-more-shadow", $(this).parent()).hide();

        event.preventDefault();
    });

// Make filters/sorting sticky
    var stick = $(".wrap-filtering");
    var windowsize = $(window).width();
    if (stick.length > 0 && windowsize > 680) {
        $(".wrap-filtering").sticky({topSpacing: 40});
    }

//Expand all radio functionality
    $("#expand-groups").on("click", function () {
        $(".group-content").each(function () {
            $(this).removeClass("collapse-small").addClass("expand");
        });
    });

// Collapse all radio functionality
    $("#collapse-groups").on("click", function () {
        $(".group-content").each(function () {
            $(this).removeClass("expand").addClass("collapse-small");
        });
    });

    jQuery('.expandable + ul.submenu').addClass('hidden');

// Set submenu to display on hover
    jQuery('.expandable, .expandable + ul.submenu').hover(function () {
        if (jQuery(this).prop("nodeName") == "UL") {
            jQuery(this).removeClass('hidden');
        } else {
            jQuery(this).next().removeClass('hidden');
        }
    }, function () {
        if (jQuery(this).prop("nodeName") == "UL") {
            jQuery(this).addClass('hidden');
        } else {
            jQuery(this).next().addClass('hidden');
        }
    });

// Set submenu to display on focus
    jQuery('.expandable, .expandable + ul.submenu a').focus(function () {
        if (jQuery(this).prop("nodeName") == "A") {
            jQuery(this).parent().removeClass('hidden');
        } else {
            jQuery(this).next().removeClass('hidden');
        }
    });

// Set submenu to hide on focus
    jQuery(':not(.expandable, .expandable + ul.submenu a)').focus(function () {
        jQuery('.expandable + ul.submenu').addClass('hidden');
    });


  // Scroll to url#anchor (useful with accordions)
    // add anchor for permalink
    jQuery(document).ready(function() {
        jQuery(".ui-tabs").find("h1[id], h2[id], h3[id], h4[id], h5[id]").each((i, el) => {
          if (!jQuery(el).find('a[href]').length) {
            jQuery(el).prepend(jQuery('<a>', {
              text: '#',
              title: el.textContent,
              href: '#' + el.id,
              class: "permalink"
            }));
          }
        });

      if (window.location.hash.length > 1 && jQuery(".ui-accordion " + window.location.hash)) {
          scrollTo(0,1);
          document.getElementById(window.location.hash.slice(1)).scrollIntoView();
          // taking into nav bar at the top
          scrollBy(0,-15); 
        }
    });

})(jQuery);



