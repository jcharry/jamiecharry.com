/* global $, jc */
'use strict';
(function(global) {
    var obj = {
        detectMobile: function() {
            if (window.innerWidth < 450 || window.innerHeight < 700) {
                this.isMobile = true;
            }

        },
        detectSmall: function() {
            if (window.innerWidth < 400 || window.innerHeight < 700) {
                this.isSmall = true;
            }
        },
        isSmall: false,
        isMobile: false,
        initNavBar: function() {
            $('#navButton').on('click', function(event) {
                // Show popup
                $('#menupopup').css('display', 'flex');
            });
            $('#closeMenu').on('click', function(event) {
                $('#menupopup').css('display', 'none');
            });
            $('#navTitle').hover(function() {
                $(this).fadeOut(100, function() {
                    $(this).text('jamiecharry.');
                    $(this).fadeIn(100);
                });
            }, function() {
                $(this).fadeOut(100, function() {
                    $(this).text('jc.');
                    $(this).fadeIn(100);
                });
            });
        },
        initFilters: function() {
            $('.filterItem').on('click', function() {
                var $self = $(this);

                // Remove selected style from filter items
                // and apply it to one that was clicked
                $('.filterItem').removeClass('selected');
                $(this).addClass('selected');

                // fade out all projects
                var projects = $('.project');

                for (var p = 0; p < projects.length; p++) {
                    $(projects[p]).fadeOut(200);
                }

                // Wait til fade outs are done
                // then fade in
                setTimeout(function() {
                    // Get items that match filter
                    var matches = $('li[data-category~=' + $self.data('filter') + ']');

                    if ($self.data('filter') === 'all') {
                        matches = $('.project');
                    }

                    // fade the matches in
                    for (var q = 0; q < matches.length; q++) {
                        $(matches[q])
                            .addClass('visible')
                            .fadeIn();
                    }
                }, 200);
            });
        },
        // Setup project items
        initProjects: function() {
            // Set height
            var w = $('.visible').width();

            $('.visible').css('height', w);
            //height($('.project').width());

            // Hover functionality
            // Only add this stuff if not on mobile
            if (!this.isMobile) {
                $('.project').hover(function() {
                    var id = $(this).data('id');

                    $('li[data-id=\'' + id + '\'] .overlay')
                        .css('display', 'flex')
                        .hide()
                        .fadeIn(200);
                }, function() {
                    var id = $(this).data('id');

                    $('li[data-id=\'' + id + '\'] .overlay').fadeOut(200);
                });
            }
        },
        sizeiFrames: function() {
            var ww = window.innerWidth;

            if (ww > 1000) {
                ww = 1000;
            }
            $('iframe').attr('width', ww - 30);
            $('iframe').attr('height', (ww - 30) * 9 / 16);
        },
        windowResized: function() {
            var w = $('.visible').width();

            $('.visible').css('height', w);
            //$('iframe').attr('width', window.innerWidth-20);
            //$('iframe').attr('height', (window.innerWidth-20)*9/16);
        }
    };

    global.jc = obj;

}(this));

$(document).ready(function() {
    jc.detectSmall();
    jc.detectMobile();
    console.log(jc.isMobile);
    jc.initNavBar();
    jc.initFilters();
    jc.initProjects();
    jc.sizeiFrames();

    window.addEventListener('resize', jc.sizeiFrames);
    window.addEventListener('resize', jc.windowResized);
});
