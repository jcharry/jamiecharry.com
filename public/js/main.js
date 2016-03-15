(function() {
    var obj= {
        detectMobile: function() {

        },
        detectSmall: function() {
            if (window.innerWidth < 400 || window.innerHeight < 700) {
                return true;
            }
        },
        isSmall: true,
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
                $('.filterItem').removeClass('selected');
                $(this).addClass('selected');

                //if ($(this).data('filter') === 'all') {
                    //$('.project').fadeIn();
                    //return;
                //}
                
                var projects = $('.project');
                console.log(projects.length);
                for (var p = 0; p < projects.length; p++) {
                    console.log(projects[p]);
                    $(projects[p]).fadeOut(200);
                }

                // Wait til fade outs are done
                setTimeout(function() {
                    // fade in
                    var matches = $('li[data-category~='+$self.data('filter')+']');
                    if ($self.data('filter') === 'all') {
                        matches = $('.project');    
                    }

                    for (var p = 0; p < matches.length; p++) {
                        console.log(matches[p]);
                        $(matches[p]).fadeIn();
                    }
                }, 200);

                // Hide all elements
                //$('.project').fadeOut(200, function() {
                
                    //// otherwise show matches only

                //});

            });
        },
        initProjects: function() {
            // Hover functionality
            $('.project').hover(function() {
                var id = $(this).data('id');
                $('li[data-id=\''+id+'\'] .overlay').show();
            }, function() {
                var id = $(this).data('id');
                $('li[data-id=\''+id+'\'] .overlay').hide();
            });
        },
    };

    this.jc= obj;

})(this);

$(document).ready(function() {
    var isMobile = jc.detectMobile();
    jc.initNavBar();
    jc.initFilters();
    jc.initProjects();
});
