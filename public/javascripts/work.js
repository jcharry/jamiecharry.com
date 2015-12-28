
$(document).ready(function () {
  console.log('hi, I am your work page');
  
  // Set height of image blocks
  setProjectBoxes($('#body').width());
  $('.projectItem').hover(function(e) {
    $(this).find('.projectText').each(function(index) {
      $(this).show();
    });
    $(this).find('.imgMask').css('opacity','0.5');
  }, 
  function() {
    $(this).find('.projectText').each(function(index) {
      $(this).hide();
    });
    $(this).find('.imgMask').css('opacity','0');
  });

});

$(window).resize(function() {
  setProjectBoxes($('#body').width());
});

function mouseOverProject() {

}

function setProjectBoxes(width) {
  if (width < 500) {
    $('.projectTitle').css('font-size','1.5em');
    $('.projectDesc').css('font-size','1em');
  } else {
    $('.projectTitle').css('font-size','2em');
    $('.projectDesc').css('font-size','1.7em');
  }
  console.log('resizing');
  //$('.projectItem').css('height',width*0.3056+'px');
  //$('.imgMask').css('height',width*0.3056+'px');
  //console.log(width);
  //$('.projectTitle').css('width', width+'px');
  //$('.projectDesc').css('bottom','0px');
  //$('.projectDesc').css('width',width+'px');
}
