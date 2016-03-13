/*
 * isMobile.js
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
(function(){
    'use strict';

    function is_touch_device() {
        return 'ontouchstart' in window || navigator.maxTouchPoints;       // works on IE10/11 and Surface
    }

    var isTouch = is_touch_device();
    console.log(isTouch);
    
    function detectmob() {

       if(window.innerWidth <= 400 && window.innerHeight <= 737) {
         return 'yes';
       } else {
         return 'no';
       }
    }

    var isMobile = detectmob();
    console.log('Are you a mobile device? : ' + isMobile);

    $.ajax({
        type: 'POST',
        url: '/isMobile',
        data: {
            isMobile: isMobile,
            isTouch: isTouch
        },
        success: function(res) {
            console.log(res);
            window.location = res.redirect ;
        }
    });

})();
