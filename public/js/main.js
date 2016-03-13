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
                // Hide all elements
                $('.project').hide();
                $('.filterItem').removeClass('selected');
                $(this).addClass('selected');

                if ($(this).data('filter') === 'all') {
                    $('.project').show();
                    return;
                }
                // otherwise show matches only
                var matches = $('li[data-category~='+$(this).data('filter')+']');

                for (var p = 0; p < matches.length; p++) {
                    console.log(matches[p]);
                    $(matches[p]).show();
                }
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
        }
    };

    this.jc= obj;

})(this);

$(document).ready(function() {
    var isMobile = jc.detectMobile()
    jc.initNavBar();
    jc.initFilters();
    jc.initProjects();
});
