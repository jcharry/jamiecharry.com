$(document).ready(function() {
   layoutPage($(window).innerWidth()); 
});

$(window).resize(function() {
    layoutPage($(window).innerWidth());
});

function layoutPage(width) {
    console.log(width);
    if (width < 800) {
       $('#contactDiv').css('flex-direction','column'); 
    } else {
       $('#contactDiv').css('flex-direction','row'); 
    }

}
