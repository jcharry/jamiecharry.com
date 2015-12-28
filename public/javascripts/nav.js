$(document).ready(function() {

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

