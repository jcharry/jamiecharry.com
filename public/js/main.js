(function() {
    var obj= {
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
                $('#menupopup').css('display','flex');
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
                    console.log(projects[p]);
                    $(projects[p]).fadeOut(200);
                }

                // Wait til fade outs are done
                // then fade in
                setTimeout(function() {
                    // Get items that match filter
                    var matches = $('li[data-category~='+$self.data('filter')+']');
                    if ($self.data('filter') === 'all') {
                        matches = $('.project');    
                    }

                    // fade the matches in
                    for (var p = 0; p < matches.length; p++) {
                        console.log(matches[p]);
                        $(matches[p]).fadeIn();
                    }
                }, 200);
            });
        },
        // hover functionality over projects
        initProjects: function() {
            // Hover functionality
            // Only add this stuff if not on mobile
            if (!this.isMobile) {
                $('.project').hover(function() {
                    var id = $(this).data('id');
                    $('li[data-id=\''+id+'\'] .overlay').show();
                }, function() {
                    var id = $(this).data('id');
                    $('li[data-id=\''+id+'\'] .overlay').hide();
                });
            }
        },
        sizeiFrames: function() {
            var ww = window.innerWidth;
            if (ww > 1000) {
                ww = 1000;
            }
            $('iframe').attr('width', ww-30);
            $('iframe').attr('height', (ww-30)*9/16);
        },
        windowResized: function() {
            // Change size of any iframes
            //$('iframe').attr('width', window.innerWidth-20);
            //$('iframe').attr('height', (window.innerWidth-20)*9/16);
            console.log('resizing');
        }
    };

    this.jc= obj;

})(this);

$(document).ready(function() {
    jc.detectSmall();
    jc.detectMobile();
    console.log(jc.isMobile);
    jc.initNavBar();
    jc.initFilters();
    jc.initProjects();
    jc.sizeiFrames();

    window.addEventListener('resize',jc.windowResized);
    window.addEventListener('resize',jc.sizeiFrames);
});
