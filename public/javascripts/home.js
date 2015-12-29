$(document).ready(function() {
  //$('#navTitle').hide();

  //$('#body').css('background-color','Azure');
    
  // remove border of page title since there is no title for the homepage
    $('.pageTitle').css('border-bottom','0px');
  
  // Register event
  $('#homepageInput').keypress(function(e) {
    if (e.which == 13) {
      //getSentimentScore($(this).val());
      sendRequestForTweets($(this).val());
    }
  });

  $(function(){
      $("#typewriter").typed({
	  strings: ["Hi.", "I'm Jamie.","Nice to meet you.","How are you today?"],
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

    $('#homeWrapper').animate({
      'margin-top':'0%'
    }, {duration: 1000});

    $('#homepageInput').show('drop', null, 1000, function() {

      // add placeholder text to input
      $('#homepageInput').attr('placeholder','great, terrible, beautiful, etc.');

      // add nav menu
    });
  }, 300);
}

function getSentimentScore(str) {
  $.ajax({
    type: 'GET',
    url: '/sentiment',
    data: {
      str: str
    },
    success: displaySentiment,
    error: oops
  });
}

function sendRequestForTweets(str) {

  // send get request
  $.ajax({
    type: 'GET',
    url: '/twitterResults',
    data: {
      str: str
    },
    success: displayTweets,
    error: oops
  }); 
}

function displayTweets(responseHtml) {
  //$('#tweets').show();
  
  //console.log(data.statuses); 
  //console.log(data.sentiment);
  //// if there are old tweets, clear them out
  //$('#tweets').empty();
  
  $('#tweets').html(responseHtml); 
}

function oops(err) {
  console.log('oops');
}
