var overlayShowing = true;
var windowHeight;
$(document).ready(function() {
    windowHeight = $(window).height();
    console.log(windowHeight);
    $('#sectionTwo').offset({top:windowHeight, left:0});
    
    var popover = $('<p id=popover></p>');
    popover.hide();
    $('#body').append(popover);
    $('.timelineItem').mouseover(function() {
        var header = $(this).find('.timelineItemHeader').html();
        
        var posX = $(this).offset().top;
        var posY = $(this).offset().left;
        var h = $(this).height();
        popover.css({
            position: 'absolute',
            top: $(this).offset().top - h/1,
            left: $(this).offset().left    
        });
        popover.text(header);
        popover.fadeIn(200);

    });
    $('.timelineItem').mouseout(function() {
        $(this).find('.timelineItemHeader').hide();
        popover.hide();
    });

    $('.timelineItem').click(function() {

        // capture var associated with this while in scope
        var imgSrc = $(this).find('.timelineItemImgSrc').text();
        var header = $(this).find('.timelineItemHeader').html();
        var ptext = $(this).find('.timelineItemDesc').html();
        
        if (overlayShowing) {
            // hide overlay and show image and text
            $('#mainContentOverlay').fadeOut(800, function() {

                // get img link from html elements in timeline
                // and set src attribute
                $('#mainContentImage').attr('src',imgSrc);

                // get text from elements in timeline and set text
                $('#mainContentHeader').text(header);
                $('#mainContentP').text(ptext);

                // Set display to flex so text becomes visible
                $('#textContainer').css('display','flex');
                $('#imageContainer').fadeIn(2000);
                $('.mainContentText').fadeIn(2000);
                overlayShowing = false;

                // show blinking arrow
                var arrow = $('<img src=\'/images/arrow.png\'>');
                var arrowTop = $(window).height() - 60;
                console.log(arrowTop);
                var arrowLeft = $(window).width() / 2;
                arrow.css({
                    position: 'absolute',
                    top: arrowTop + 'px',
                    left: arrowLeft + 'px'
                });
                $('#body').append(arrow); 

                //$('#sectionTwo').fadeIn(3000);
                $('#sectionTwo').offset({top:windowHeight, left:0});

            });
        } else {
            $('#mainContentImage').fadeOut(1000, function() {
                $('#mainContentImage').attr('src',imgSrc);
                $('#mainContentImage').fadeIn(1000);
            });
            $('.mainContentText').fadeOut(1000, function() {
                $('#textContainer').css('display','flex');
                $('#mainContentHeader').text(header);
                $('#mainContentP').text(ptext);
                $('.mainContentText').fadeIn(2000);
            });
        }
    });
});




//function setup() {
    //createCanvas(windowWidth, windowHeight);
    //// load all images, and show loading icon while waiting for callbacks to come in
    //loadAllImages();
//}

//function draw() {
    //ellipse(windowWidth/2, windowHeight/2, 50,50);
    //if (isLoading) {
        //// run loading routine
        //fill(random(0,255));
        //ellipse(windowWidth/2, windowHeight/2, 50,50);
    //} else {
        //// images are loaded, display them
        //console.log('all images loaded');

    //}

//}

//var images = [];
//var numberOfImages;
//var totalNumberOfImagesToLoad;

//function loadAllImages() {
    //for (var i = 0; i < totalNumberOfImagesToLoad; i++) {
        //loadImage('images/about'+i+'.png',imageLoaded);
    //} 
//}

//function imageLoaded() {
    //if (numberOfImages < totalNumberOfImagesToLoad) {
        //numberOfImages++;
    //} else {
        //// stop loading routine
        //isLoading = false;
    //}
//}

//function Tab() {
    //this.position = pos;
//}

//Tab.prototype.display = function() {
    
//};
