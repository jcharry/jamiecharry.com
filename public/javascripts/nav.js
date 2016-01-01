$(document).ready(function() {
    $('#navTitle').hover(function(e) {
        $(this).css('opacity','0');
        $(this).text('jamiecharry.');
        $(this).animate({opacity:'1'});
    }, function() {
        $(this).css('opacity','0');
        $(this).text('jc.');
        $(this).animate({opacity:'1'});
    });

});

$(window).resize(function() {
  var size;
  var lh;
  if ($(window).width() < 500) {
    size = '1.5em';
    lh = '1.5em';
  } else {
    size = '2em';
    lh = '2em';
  } 
  $('#navTitle').css('font-size',size);
  $('#navTitle').css('line-height',lh);
});

