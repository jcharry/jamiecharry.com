$(document).ready(function() {
    
    // set project boxes size depending on screen size
    setProjectBoxes($(window).innerWidth());

  // remove border of page title since there is no title for the homepage
    $('.pageTitle').css('border-bottom','0px');

    // set mouseover for project boxes
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
    
  
  // Register event
  $('#homepageInput').keypress(function(e) {
    if (e.which == 13) {
      //getSentimentScore($(this).val());
      sendRequestForTweets($(this).val());
    }
  });

  $(function(){
      $("#typewriter").typed({
	  strings: ["Hi.", "I'm Jamie.","I like to make things.","Here's some stuff I've done recently."],
	  typeSpeed: 10,
	  backSpeed: 10,
	  backDelay: 800,
	  cursorChar: "|",
	  callback: typingDone
      });
  });
});

function typingDone() {
  // animate text box up
    setTimeout(function() {
        $('.flexContainer').animate({
            'font-size': '3vw'
        }, {duration: 1000});
        $('#homeWrapper').animate({
            'margin-top':'15px'
        }, {duration: 1000});
        $('#allProjects').animate({
          'opacity':'1.0'
        }, {duration: 1000});
    }, 500);
}

$(window).resize(function() {
    setProjectBoxes($(window).innerWidth());
});

function setProjectBoxes(width) {
  if (width < 800) {
      $('.projectItem').css('width','100%');
    //$('.projectTitle').css('font-size','1.5em');
    //$('.projectDesc').css('font-size','1em');
  } else if (width > 800) {
      $('.projectItem').css('width','45%');
    //$('.projectTitle').css('font-size','2em');
    //$('.projectDesc').css('font-size','1.7em');
  }
  console.log('resizing');
}
