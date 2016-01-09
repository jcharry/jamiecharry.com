function detectmob() {
   if(window.innerWidth <= 800 && window.innerHeight <= 737) {
     return true;
   } else {
     return false;
   }
}

var isMobile = detectmob();
console.log('Are you a mobile device? : ' + isMobile);

// Constants used to determine placement of home particles
var SEPARATION = 80, AMOUNTX = 8, AMOUNTY = 8;

// State vars to keep track of status of camera
var currentPos = 'home';
var isTweening = false;

// Threejs objects 
var scene, renderer;
var cssScene, cssRenderer; 

// Css objects for project projections
var cssObject, cssObjectBack;

// Store references to about flag meshes 
var aboutFlags = [];

// Home screen project sphere objects stored here 
var particles, particle, count = 0;

// These aren't currently used anywhere, but log touch locations 
var mouseX = 0, mouseY = 0;

// Mouse vector used by raycaster
// INTERSECTED stores object the mouse is presently hovering over
var mouse = new THREE.Vector2(), INTERSECTED;

//var radius = 100, theta = 0;
// Raycaster var's.  All objects succeptible to raycasting should be stored
// in selectableObjects
var intersects, raycaster;
var selectableObjects = [];

// Easily access mid point on screen
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Camera positions
var homePos = new THREE.Vector3(0,300,800);
var projectPos = new THREE.Vector3(0,1000 + windowHalfY-150, 800);
var rightPos = new THREE.Vector3(1000, 300, 800);
var leftPos = new THREE.Vector3(-1000, 300, 800);
var downPos = new THREE.Vector3(0, -800, 800);

// Get rainbow colors for main balls see -
// Rainbow Vis - https://github.com/anomal/RainbowVis-JS/blob/master/rainbowvis.js
var rainbow = new Rainbow();
rainbow.setNumberRange(0, AMOUNTX*AMOUNTY);
var ballColors = [];
for (var i = 0; i < AMOUNTX*AMOUNTY; i++) {
    // push a set of hex colors into an array
    ballColors.push(parseInt(rainbow.colorAt(i).replace(/^#/,''),16));
}

// Fire off request to get project information
// Only after info comes back can we load the page
var projects;

if (isMobile) {
    // just show a simple element telling the user to go to a desktop computer
    $('#mobileMessage').css('display','block');
    $('#mobileMessage').css('top',windowHalfY - $('#mobileMessage').height()/2);
    console.log('hi');
    console.log($('#mobileMessage'));
    
} else {
    //$('#mobileMessage').hide();
    // fire off ajax request for project info, which upon completion loads threejs stuff
    $.ajax('/projectInfo',{
        type: 'GET',
        success: function(data) {
            projects = data;    // Store reference to project data
            init();             // Init threejs scene
            animate();          // Begin animating
            setupArrows();      // Setup arrows on the home pos 
        }
    });
}


// Hold textures in global var so I can access them from other functions
var githubTexture;
var facebookTexture;
var emailTexture;
var linkedinTexture;
var textureCounter = 0; // Counter to figure out if all textures have loaded

function init() {

    // load all textures for contact boxes
    var loader = new THREE.TextureLoader();
    loader.load('/images/github.png',function(texture) {
        githubTexture = texture;
        textureCounter++;
    });
    loader.load('/images/facebook.png',function(texture) {
        facebookTexture = texture;
        textureCounter++;
    });
    loader.load('/images/mail.png',function(texture) {
        emailTexture = texture;
        textureCounter++;
    });
    loader.load('/images/linkedin.png',function(texture) {
        linkedinTexture = texture;
        textureCounter++;
    });
    loader.load('/images/vimeo.png',function(texture) {
        vimeoTexture = texture;
        textureCounter++;
    });

    // Set camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.z = 800;
    camera.position.y = 300;

    // Set scene
    scene = new THREE.Scene();
    particles = [];


    // Create lights
    var light = new THREE.AmbientLight(  0xffffff);
    light.position.set( 1, 1, 1 ).normalize();
    scene.add(light);
    var dirlight = new THREE.DirectionalLight(0xffffff,0.5);
    dirlight.position.set(0,1,0).normalize();
    scene.add(dirlight);

    // Pick as many random numbers as there are projects
    var randNumbers = createRandomNumbersArray(projects.length); 

    
    var i = 0; // Since it's a two dimensional for loop, we use this 'i' to keep track of total number of iterations
    var projectCount = 0; // Use this to keep track of how many projects have been placed on balls

    // Loop through desired number of balls
    for (var ix = 0; ix < AMOUNTX; ix++) {
        for (var iy = 0; iy < AMOUNTY; iy++) {
            // Create particle sphere 
            // and position it according to separation and number of balls
            var particleMaterial = new THREE.MeshLambertMaterial({ color: ballColors[i] });
            var particleGeometry = new THREE.SphereGeometry(5,32,32);
            particle = new THREE.Mesh(particleGeometry, particleMaterial);
            //particle.position.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
            //particle.position.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
            particle.position.x = ix * SEPARATION - ( ( (AMOUNTX-1) * SEPARATION ) / 2 );
            particle.position.z = iy * SEPARATION - ( ( (AMOUNTY-1) * SEPARATION ) / 2 );
            //particle.userData.type = 'particle';

            // Only if the particle index matches one of our random numbers do we 
            // add a halo, project, and make it selectable
            if ($.inArray(i, randNumbers) !== -1) {

                // Add a halo to particles that should contain a project
                var haloGeo = new THREE.SphereGeometry(12,32,32);
                var haloMat = new THREE.MeshLambertMaterial({color: ballColors[i], transparent: true, opacity: 0.5});
                var haloMesh = new THREE.Mesh(haloGeo, haloMat);
                particle.add(haloMesh);

                // Halo is ultimately what's selectable
                // so store necessary info there
                haloMesh.userData.type = 'particle';
                haloMesh.userData.project = projects[projectCount];
                selectableObjects.push(haloMesh);

                // Counter indepent of loop that keeps track of where we are
                // in the projects array
                projectCount++;
            }

            // Store reference to all particles 
            particles.push(particle);
            scene.add(particle);
            i++;
        }
    }

    // Raycaster
    raycaster = new THREE.Raycaster();

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x333333);
    renderer.sortObjects = false;
    document.body.appendChild( renderer.domElement );

    // Camera look at
    camera.lookAt(scene.position);

    // Event listeners
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
}

// Create animation loop 
function animate() {
    requestAnimationFrame(animate);
    render();
}

// Render objects
function render() {
    // Keeps track of all Tweens
    TWEEN.update();

    //if (aboutFlags.length > 0) {
        //for (var i = 0; i < aboutFlags.length; i++) {
            //var shape = aboutFlags[i];
            //shape.rotation.x += 0.005;
        //}
    //}
    //if (pivots.length > 0) {
        //for (var i = 0; i < pivots.length; i++) {
            //pivots[i].rotation.x += 0.005;
        //}
    //}

    // Not sure what this does, doh!
    camera.updateMatrixWorld();

    // Particle motion
    waveParticles();
    // Box motion
    wobble(contactBoxes);

    //wobble(aboutFlags);
    // Flag motion
    // Raycaster & selection
    raycastObjects();

    // Render scenes
    renderer.render(scene, camera);
    if (cssRenderer) {
        cssRenderer.render(cssScene, camera);
    }
}

function raycastObjects() {
    raycaster.setFromCamera(mouse,camera);
    var intersects = raycaster.intersectObjects(selectableObjects, true);

    if ( intersects.length > 0 ) {
        // check if intersected object is of type
        if (intersects[0].object.userData.type === 'particle') {
        } else if (intersects[0].object.userData.type === 'contactBox') {
        }


        // Is the intersected object from the last frame the same as the current intersected object?
        // If not, run what's in here
        if ( INTERSECTED != intersects[ 0 ].object ) {
            //
            if ( INTERSECTED ) {
                if (INTERSECTED.userData.type === 'particle') {
                    INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                    INTERSECTED = null;
                } else if (INTERSECTED.userData.type === 'contactBox') {
                    //INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                    INTERSECTED = null;
                } else if (INTERSECTED.userData.type === 'aboutflag') {
                    INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                    INTERSECTED = null;
                }
            }

            INTERSECTED = intersects[ 0 ].object;
            
            if (INTERSECTED.userData.type === 'particle') {
                console.log('intersectiong particle');
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 );
                INTERSECTED.parent.holdPosition = true;
                INTERSECTED.scale.x = 1.5;
                INTERSECTED.scale.y = 1.5;
                INTERSECTED.scale.z = 1.5;

                showDetailPopup(INTERSECTED, INTERSECTED.userData.project);
            } else if (INTERSECTED.userData.type === 'contactBox') {
            } else if (INTERSECTED.userData.type === 'aboutflag') {
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 );
            }
        }
    } else {
        if (INTERSECTED) {
            if (INTERSECTED.userData.type === 'particle') {
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED.parent.holdPosition = false;
                INTERSECTED.scale.x = 1;
                INTERSECTED.scale.y = 1;
                INTERSECTED.scale.z = 1;
            } else if (INTERSECTED.userData.type === 'contactBox') {
            } else if (INTERSECTED.userData.type === 'aboutflag') {
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            }
        }
        INTERSECTED = null;
        removeDetailPopup();
    }

}


function onDocumentMouseDown(event) {
    // When the mouse is clicked on an object stored in INTERSECTED
    if (INTERSECTED && !isTweening) {
        if (INTERSECTED.userData.type === 'particle') {
            // get project info corresponding to clicked particle
            var proj = INTERSECTED.userData.project;

            if (proj) {
                setupCssScene(proj);

               // Hide home arrows
                $('#homeRightArrow').fadeOut(1000);
                $('#homeLeftArrow').fadeOut(1000);
                $('#homeDownArrow').fadeOut(1000);
                $('#homeDesc').fadeOut(1000);

                // Hide a bunch of html elements in case the user clicks on a project from one of the side positions
                $('#contactinfo').fadeOut(1000);
                $('#aboutDesc').fadeOut(1000);

                // Move camera upwards
                setupTween(camera.position, projectPos, 3000, function() {
                    if (rightSceneActive) {
                        removeRightScene();
                    }
                    if (leftSceneActive) {
                        removeLeftScene();
                    }
                    isTweening = false;
                    $projectDownArrow.fadeIn(1000);
                    $projectRightArrow.fadeIn(1000);
                });
            }
        } 

        if (INTERSECTED.userData.type === 'contactBox') {
            window.open(INTERSECTED.userData.link);
        }
        if (INTERSECTED.userData.type === 'aboutflag') {
            // show html element
            var indexOfClickedFlag = INTERSECTED.userData.index;
            $('#aboutFlag'+indexOfClickedFlag).fadeIn(1000);
            
        }
    }
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    positionElements();

    if (leftSceneActive) {
        for (var i = 0; i < aboutPs.length; i++) {
            //updatePositions
            var pPos = toScreenPosition(aboutFlags[i], camera);
            var $p = aboutPs[i];
            var left = pPos.x + 100;
            var top = pPos.y - 50;
            $p.css('left',left + 'px');
            $p.css('top',top + 'px');
            $p.css('width','50%');
        }
    }

}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentTouchStart( event ) {
    if ( event.touches.length === 1 ) {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}

function onDocumentTouchMove( event ) {
    if ( event.touches.length === 1 ) {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}

var $projectDownArrow;
var $projectRightArrow;
var $projectLeftArrow;
var $homeRightArrow;
var $homeLeftArrow;
var $homeDownArrow;
var $homeUpArrow;
function setupArrows() {

    // Show home arrows after render load
    $('.arrow').css('display','flex');

    // Arrow to move back to home from the project position
    $projectDownArrow = $('#projectDownArrow');
    $projectDownArrow.hide();
    $projectDownArrow.click(arrowClicked);

    // Arrows at the project position that cause the CSS objects to flip around
    // These are displayed when we tween up to project section
    $projectRightArrow = $('#projectRightArrow');
    $projectRightArrow.hide();  // initially hide them
    $projectRightArrow.click(arrowClicked);
    $projectLeftArrow = $('#projectLeftArrow');
    $projectLeftArrow.hide();
    $projectLeftArrow.click(arrowClicked);

    // Get reference to home arrows and setup mouse events
    $homeRightArrow = $('#homeRightArrow');
    $homeLeftArrow = $('#homeLeftArrow');
    $homeDownArrow = $('#homeDownArrow');
    $homeUpArrow = $('#homeUpArrow');
    $homeRightArrow.click(arrowClicked);
    $homeLeftArrow.click(arrowClicked);
    $homeDownArrow.click(arrowClicked);
    $homeUpArrow.click(arrowClicked);
    $homeRightArrow.hide();
    $homeLeftArrow.hide();
    $homeDownArrow.hide();
    $homeUpArrow.hide();


    setTimeout(function() {
        $('#bestExperience').fadeIn(1000);
       $homeRightArrow.fadeIn(1000);
       $homeLeftArrow.fadeIn(1000);
       $homeDownArrow.fadeIn(1000);
    }, 1000);
    setTimeout(function() {
       $('#homeDesc').fadeIn(1000); 
        $('#bestExperience').fadeOut(1000);
    }, 5000);

    $('#skillsDiv').css('display','flex');
    $('#skillsDiv').hide();

    // Position them accordingly, it's a separate function so we can also call 
    // it during windowResize to ensure arrows stay placed appropriately
    // even when window resizes
    positionElements();
}

// Position arrows based on window size.  Call this again on windowResize event
function positionElements() {
    $projectDownArrow.css('left', windowHalfX - $projectDownArrow.width()/2 + 'px');
    $projectDownArrow.css('top', window.innerHeight - $projectDownArrow.height() - 10 + 'px');
    $projectRightArrow.css('left', window.innerWidth - 50 + 'px');
    $projectRightArrow.css('top',windowHalfY - $projectRightArrow.height()/2 + 'px');
    $projectLeftArrow.css('left', '20px');
    $projectLeftArrow.css('top',windowHalfY - $projectLeftArrow.height()/2 + 'px');

    $homeRightArrow.css('left', window.innerWidth - 70 + 'px');
    $homeRightArrow.css('top',windowHalfY - $homeRightArrow.height()/2 + 'px');
    $homeLeftArrow.css('left', '20px');
    $homeLeftArrow.css('top',windowHalfY - $homeLeftArrow.height()/2 + 'px');
    $homeDownArrow.css('left', windowHalfX - $homeDownArrow.width()/2 + 'px');
    $homeDownArrow.css('top', window.innerHeight - $homeDownArrow.height() -10 + 'px');
    $homeUpArrow.css('left',windowHalfX - $homeUpArrow.width()/2 + 'px');
    $homeUpArrow.css('top','40px');


    $('#contactinfo').css('left',windowHalfX - $('#contactinfo').width()/2 + 'px');
    $('#contactinfo').css('top',window.innerHeight - $('#contactinfo').height() - 200 + 'px');

    $('#aboutDesc').css('left', windowHalfX - $('#aboutDesc').width()/2 + 'px');
    $('#aboutDesc').css('top', '200px');

    $('#homeDesc').css('left', windowHalfX - $('#homeDesc').width()/2 + 'px');
    $('#homeDesc').css('top', '200px');
    $('#bestExperience').css('left', windowHalfX - $('#bestExperience').width()/2 + 'px');
    $('#bestExperience').css('top', '200px');

    //$('#skillsDiv').css('left',windowHalfX - $('skillsDiv').width()/2 + 'px');
    $('#skillsDiv').css('top', windowHalfY - $('#skillsDiv').height()/2 + 'px');
}

// This is a big function - it controls mouse clicks on any arrow, anywhere, at anytime
function arrowClicked(e) {

    // First check to make sure we're not currently Tweening, otherwise arrows are disabled
    if (!isTweening) {

        // Switch on the ID of the arrow element to handle each case
        switch ($(this)[0].id) {

            // Arrow that takes you back home when looking at a specific project
            case 'projectDownArrow':
                currentPos = 'home';
                $(this).fadeOut(1000);                      // immediately start fading
                $('#projectRightArrow').fadeOut(1000);      // Fade out the right and left arrows
                $('#projectLeftArrow').fadeOut(1000);

                // Tween the camera back home
                setupTween(camera.position, homePos, 3000, function() { 
                    // Completion callback
                    isTweening = false; // set state var to reflect end of tween

                    // Remove CSS Renderer and associated element
                    // These are created the moment a project ball is tapped
                    var elt = document.getElementById('cssRendererElement');
                    elt.parentNode.removeChild(elt);
                    cssScene.remove(cssObject);
                    cssScene.remove(cssObjectBack);
                    cssRenderer = null;

                    // Make home arrows visible
                    $('#homeRightArrow').fadeIn(1000);
                    $('#homeLeftArrow').fadeIn(1000);
                    $('#homeDownArrow').fadeIn(1000);
                    $('#homeDesc').fadeIn(1000);
                });
                break;

            // Arrow that flips the project canvas around
            case 'projectRightArrow':

                // There are two css objects, one facing away and slightly farther away from the camera to ensure it's not visible
                // Tween rotation of both css objects
                new TWEEN.Tween(cssObject.rotation)
                .to({y:-Math.PI}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                // Tween back object - This tween monitors amount of rotation
                new TWEEN.Tween(cssObjectBack.rotation)
                .to({y:0}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function() {
                    // When the tween is half-done, move the back canvas to the front
                    // so it's now visible
                    if (cssObjectBack.rotation.y < Math.PI/2) {
                        cssObjectBack.position.z = 1;
                    } 
                })
                .start();       // Start tween

                // fade the appropriate arrows into view
                $projectRightArrow.fadeOut(1000);
                $projectLeftArrow.fadeIn(1000);
                break;

            // Arrow that flips canvas back around
            case 'projectLeftArrow':

                // Same flow as above, but flips and moves the back 
                // object to the back so it's no longer visible
                // Tween back
                new TWEEN.Tween(cssObject.rotation)
                .to({y:0}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                new TWEEN.Tween(cssObjectBack.rotation)
                .to({y:Math.PI}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function(){
                    if (cssObjectBack.rotation.y > Math.PI/2) {
                        cssObjectBack.position.z = -1;
                    }
                })
                .start();
                $projectRightArrow.fadeIn(1000);
                $projectLeftArrow.fadeOut(1000);
                break;

            // Home page Arrows multitask
            case 'homeRightArrow':

                // Fade out all arrows
                $homeRightArrow.fadeOut(1000);
                $homeLeftArrow.fadeOut(1000);
                $homeDownArrow.fadeOut(1000);
                $('#homeDesc').fadeOut(1000);

                // Figure out where the camera is
                if (currentPos === 'home') {
                    // Then we need to move to the right 'contact' section
                    // And update our pos
                    currentPos = 'right';

                    // Setup right scene
                    setupRightScene();

                    // Finally Tween camera right
                    setupTween(camera.position, rightPos, 3000, function() {
                        // Change state of left arrow text to reflect it's function
                        $homeLeftArrow[0].children[0].innerHTML = 'Home';
                        $homeLeftArrow.fadeIn(1000);
                        $('#contactinfo').fadeIn(1000);
                        // set flag only upon completion so other arrows are disabled during tween
                        isTweening = false;
                    });
                } else if (currentPos === 'left') {
                    // Then we need to tween back home
                    currentPos = 'home';    // Set current pos
                    $('#aboutDesc').fadeOut(1000);
                    $('.aboutFlag').fadeOut(1000);

                    // Tween home
                    setupTween(camera.position, homePos, 3000, function() {
                        // Set appropriate arrow html content
                        $homeRightArrow[0].children[0].innerHTML = 'Contact';
                        // Fade appropriate arrows
                        $homeRightArrow.fadeIn(1000);
                        $homeLeftArrow.fadeIn(1000);
                        $homeDownArrow.fadeIn(1000);
                        $('#homeDesc').fadeIn(1000);
                        // When we're back home, do some cleanup, remove the left scene
                        removeLeftScene();

                        // Set movement flag
                        isTweening = false;
                    });
                }
                break;

            // Basically the same as the right arrow, just reversed
            case 'homeLeftArrow':
                // Hide all arrows
                $homeLeftArrow.fadeOut(1000);
                $homeRightArrow.fadeOut(1000);
                $homeDownArrow.fadeOut(1000);
                $('#homeDesc').fadeOut(1000);

                // Figure out where camera is
                if (currentPos === 'home') {
                    currentPos = 'left';

                    setupLeftScene();

                    setupTween(camera.position, leftPos, 3000, function() {
                        // we have to wait until the camera stops moving to get the positions of the arrows and place the elements

                        // get all flag positions
                        for (var i = 0; i < aboutFlags.length; i++) {
                            // for each flag position, create a <p> corresponding to it
                            var pPos = toScreenPosition(aboutFlags[i], camera);
                            var $p = $('<p id=\'aboutFlag'+i+'\' class=\'aboutFlag\'>' + taglines[i] + '</p>');
                            var left = pPos.x + 100;
                            var top = pPos.y - 50;
                            $p.css('left',left + 'px');
                            $p.css('top',top + 'px');
                            $p.css('width','50%');
                            $p.hide();
                            $('#body').append($p);
                            aboutPs.push($p);
                        } 

                        $homeRightArrow[0].children[0].innerHTML = 'Home';
                        $('#homeRightArrow').fadeIn(1000);
                        $('#aboutDesc').fadeIn(1000);
                        isTweening = false;
                    });
                } else if (currentPos === 'right') {
                    currentPos = 'home';
                    $('#contactinfo').fadeOut(1000);
                    setupTween(camera.position, homePos, 3000, function() {
                        $homeLeftArrow[0].children[0].innerHTML = 'About';

                        $homeLeftArrow.fadeIn(1000);
                        $homeRightArrow.fadeIn(1000);
                        $homeDownArrow.fadeIn(1000);
                        $('#homeDesc').fadeIn(1000);

                        removeRightScene();
                        isTweening = false;
                    });
                }
                break;
            case 'homeDownArrow':
                // Hide all arrows
                $homeLeftArrow.fadeOut(1000);
                $homeRightArrow.fadeOut(1000);
                $homeDownArrow.fadeOut(1000);
                $('#homeDesc').fadeOut(1000);

                setupBottomScene();

                setupTween(camera.position, downPos, 2000, function() {
                    $homeUpArrow.fadeIn(1000);
                    $('#skillsDiv').fadeIn(1000);

                    isTweening = false;
                });
                break;
            case 'homeUpArrow':
                $homeUpArrow.fadeOut(1000); 
                $('#skillsDiv').fadeOut(1000);
                setupTween(camera.position, homePos, 3000, function() {
                    $homeRightArrow.fadeIn(1000);
                    $homeLeftArrow.fadeIn(1000);
                    $homeDownArrow.fadeIn(1000);
                    $('#homeDesc').fadeIn(1000);

                    isTweening = false;
                });
                break;
        }
    }
} 

// Objects necessary to set up the right scene - textures and links
var contactBoxes = [];
var contactLinks = ['https://github.com/jcharry/','https://www.facebook.com/jamie.charry','https://vimeo.com/jcharry','https://www.linkedin.com/in/jcharry', 'mailto:jamie.charry@gmail.com'];
var imgURLs = ['/images/github.png','/images/facebook.png','/images/linkedin.png','/images/mail.png'];

var rightSceneActive = false;
var leftSceneActive = false;
var bottomSceneActive = false;
function setupRightScene() {
    rightSceneActive = true;
    // Before we can actually setup the scene, we have to make sure all the textures have loaded
    // if texture Count is less than it should be, wait a sec, then run this function again
    // Note: textures are loaded within init() to give them time to load
    if (textureCounter === 5) {

        // Put all textures in an array to be used during the loop
        var textures = [githubTexture, facebookTexture,vimeoTexture, linkedinTexture, emailTexture];

        // Iterate through as many textures as we have
        for (var i = 0; i < textures.length; i++) {
            // NOTE: The 5th element in the materials array is the side facing us
            var materials = [
                new THREE.MeshLambertMaterial({color:0x363636}),
                new THREE.MeshLambertMaterial({color:0x363636}),
                new THREE.MeshLambertMaterial({color:0x696969}),
                new THREE.MeshLambertMaterial({color:0x696969}),
                new THREE.MeshLambertMaterial({map:textures[i]}),
                new THREE.MeshLambertMaterial({color:0x696969})
            ];
            
            var boxGeo = new THREE.BoxGeometry(100,100,100);
            var box = new THREE.Mesh(boxGeo, new THREE.MeshFaceMaterial(materials));

            // Add boxes to our selectable objects array
            selectableObjects.push(box);

            // Set position and info
            box.position.z = 0;
            box.position.x = i * 150 + 700;
            box.rotation.x -= 0.3;
            box.userData.type = 'contactBox';
            box.userData.link = contactLinks[i];

            // Add's a tiny bit of randomness to how the boxes wobble
            // 50% chance they'll start rotating one way or the other for each axis
            if (Math.random() > 0.5) {
                box.rotDirX = 1;    //rotDir properties tell the box which direction to rotate
            } else {
                box.rotDirX = -1;
            }
            if (Math.random() > 0.5) {
                box.rotDirY = 1;
            } else {
                box.rotDirY = -1;
            }
            if (Math.random() > 0.5) {
                box.rotDirZ = 1;
            } else {
                box.rotDirZ = -1;
            }

            // Save reference to boxes for later
            contactBoxes.push(box);
            // Add boxes to scene
            scene.add(box);
        } 
    } else {
        // Here's where we run this function again if not all the textures were loaded
        setTimeout(setupRightScene, 1000);
    }
}
// Cleanup right scene 
function removeRightScene() {
    rightSceneActive = false;
    for (var i = 0; i < contactBoxes.length; i++) {
       scene.remove(contactBoxes[i]);
       selectableObjects.splice(-1,1);
    }
    contactBoxes = [];
}

var taglines = ['Growing up I was obsessed with Mythbusters and Junkyard Wars. Nothing did more for my love of science than watching Jamie and Adam hurt themselves on a weekly basis.', 'Ultimately that love of science led me to study Physics in school where I got to really geek on out science and philosophy.','Along the way I found that the life of a physicist wasn\'t for me. So I went to work for Makerbot for a while as a Hardware Project Manager.','My time there cemented that what I really wanted to do was make stuff. It\'s when I\'m the happiest.','So that\'s me. I just love to make stuff.  Today, I\'m mostly interested in building things for the web that improve public understanding of and excitement around science.'];
var aboutPs = [];
function setupLeftScene() {
    leftSceneActive = true;
    for (var i = 0; i < taglines.length; i++) {
        // create about pos shape
        var shape = new THREE.Shape();
        var bot = i*-(50) + 100;
        var h = 20;
        var w = 50;
        var v = 10;
        shape.moveTo(0 ,0);
        shape.lineTo(0, h);
        shape.lineTo(w,h);
        shape.lineTo(w+v,h/2);
        shape.lineTo(w,0);
        shape.lineTo(0, 0);
        var extrudeSettings = { amount: 5, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 3, bevelThickness: 2 };
        var shapeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        var shapeMesh = new THREE.Mesh(shapeGeo, new THREE.MeshLambertMaterial({color: 0x2f3d5a}));
        shapeMesh.position.x = - 1200;
        shapeMesh.position.y = bot;
        shapeMesh.userData.type = 'aboutflag';
        shapeMesh.userData.tagline = taglines[i];
        shapeMesh.userData.index = i;

        // properties for wobbling
        if (Math.random() > 0.5) {
            shapeMesh.rotDirX = 1;
        } else {
            shapeMesh.rotDirX = -1;
        }
        if (Math.random() > 0.5) {
            shapeMesh.rotDirY = 1;
        } else {
            shapeMesh.rotDirY = -1;
        }
        if (Math.random() > 0.5) {
            shapeMesh.rotDirZ = 1;
        } else {
            shapeMesh.rotDirZ = -1;
        }

        selectableObjects.push(shapeMesh);
        aboutFlags.push(shapeMesh);
        scene.add(shapeMesh);

    }
}

function removeLeftScene() {
    leftSceneActive = false;
    for (var i = 0; i < aboutFlags.length; i++) {
        scene.remove(aboutFlags[i]);
        selectableObjects.splice(-1,1);
    }
    $('.aboutFlag').remove();
    aboutFlags = [];
}
function setupBottomScene() {
    

}
function removeBottomScene() {

}


// Move the particles in the home position in a wave motion
var logged = false;
function waveParticles() {
    var i = 0;
    for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
        for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

            particle = particles[i];
            if (!logged) {
                logged=true;
            }
            i++;
            if (!particle.holdPosition) {
                particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 10 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 10 );
            } else {
                console.log('holding');
            } 
        }
    }
    count += 0.1;
}

// Generic wobble function 
// requires objects to be in an array, and have properties for rotDirX, rotDirY, rotDirZ
function wobble(arrayOfObjects) {
    if (arrayOfObjects.length > 0) {
        for (var i = 0; i < arrayOfObjects.length; i++) {
            var obj = arrayOfObjects[i];
            if (obj.rotation.y >= 0.3) {
                obj.rotDirY = -1;
            } else if (obj.rotation.y <= -0.5) {
                obj.rotDirY = 1;
            }
            if (obj.rotation.x >= 0.15) {
                obj.rotDirX = -1;
            } else if (obj.rotation.x <= -0.3) {
                obj.rotDirX = 1;
            }
            if (obj.rotation.z >= 0.2) {
                obj.rotDirZ = -1;
            } else if (obj.rotation.z <= -0.2) {
                obj.rotDirZ = 1;
            }
            obj.rotation.y += 0.003*obj.rotDirY;
            obj.rotation.x += 0.003*obj.rotDirX;
            obj.rotation.z += 0.003*obj.rotDirZ;
        }
    }
}

// Setup CSS objects to project projects onto
function setupCssScene(proj) {
    // Setup css scene and renderer;
    cssScene = new THREE.Scene();
    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth,window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    cssRenderer.domElement.id = 'cssRendererElement';
    //cssRenderer.domElement.style.margin = 0;
    //cssRenderer.domElement.padding = 0;
    document.body.appendChild(cssRenderer.domElement);
    
    var elt = document.createElement('iframe');
    //document.body.appendChild(elt);
    elt.style.opacity = 1;
    elt.src = proj.src;
    var eltWidth = windowHalfY*1.7777;
    var eltHeight = windowHalfY;
    elt.style.width = eltWidth + 'px';
    elt.style.height = eltHeight + 'px';
    elt.style.backgroundColor = 'black';
    if (proj.title === 'Casual HSB Drawings') {
        elt.style.backgroundColor = 'white';
    }
    cssObject = new THREE.CSS3DObject(elt);
    cssObject.position.z = 0;
    cssObject.position.y = 1000;
    cssObject.rotation.x -= 0.3;
    cssScene.add(cssObject);

    // back surface
    var elt = document.createElement('div');
    elt.id = 'cssBackSurface';
    elt.style.backgroundColor = '#DEDEDE';
    var eltTitle = document.createElement('h2');
    eltTitle.id = 'cssBackSurfaceTitle';
    eltTitle.innerHTML = proj.title;
    eltTitle.className = 'backSurfaceText';
    var eltDesc = document.createElement('p');
    eltDesc.id = 'cssBackSurfaceDesc';
    eltDesc.innerHTML = proj.longdesc;
    eltDesc.className = 'backSurfaceText';
    var eltLink = document.createElement('a');
    eltLink.id = 'cssBackSurfaceLink';
    eltLink.innerHTML = 'View Full Size Project';
    eltLink.className = 'backSurfaceText';
    eltLink.setAttribute('href',proj.projectLink);
    elt.appendChild(eltTitle);
    elt.appendChild(eltLink);
    elt.appendChild(eltDesc);
    elt.style.opacity = 1;
    var eltWidth = windowHalfY*1.7777;
    var eltHeight = windowHalfY;
    elt.style.width = eltWidth + 'px';
    elt.style.height = eltHeight + 'px';
    if (proj.title === 'Question a Day') {
        //elt.style.backgroundColor = 'black';
    }
    cssObjectBack = new THREE.CSS3DObject(elt);
    cssObjectBack.position.z = -1;
    cssObjectBack.position.y = 1000;
    cssObjectBack.rotation.x -= 0.3;
    cssObjectBack.rotation.y = Math.PI;
    cssScene.add(cssObjectBack);
}


// When a particle is hovered over, show the detail popup
function showDetailPopup(obj, data) {

    // set text
    $('#projectImg').attr('src',data.thumbnail);
    $('#projectTitle').text(data.title);
    $('#projectDescription').text(data.desc);
    $('#projectDate').text(data.date);

    var pos2D = toScreenPosition(obj, camera);
    var xpos = pos2D.x - $('#projectPopup').width()/2;
    var ypos = pos2D.y - 40 - $('#projectPopup').height();

    // set popup location and properties
    //$('#projectPopup').css('position','absolute');
    $('#projectPopup').css('display','flex');
    $('#projectPopup').css('top', ypos + 'px');
    $('#projectPopup').css('left',xpos + 'px');

    //$('#body').append($('#projectPopup'));
    $('#projectPopup').show();
}

function removeDetailPopup() {
    $('#projectPopup').hide();
}

// 3D to 2D projection - http://stackoverflow.com/questions/27409074/three-js-converting-3d-position-to-2d-screen-position-r69
function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };
}

// Creates an array of random numbers with no repeats up to specified length
function createRandomNumbersArray(length) {
    var array = [];
    for (var i = 0; i < length; i++) {
        var n = Math.floor(Math.random() * AMOUNTX*AMOUNTY);

        // if the new random number is already contained in randNumbers, 
        // then don't add it, and instead redo this iteration of the loop
        if ($.inArray(n, array) === -1) {
            array.push(n); 
        } else {
            i -=1;      // sets loop counter back one
            continue;   // ends this iteration of the loop and starts the next
        }
    }
    return array;
}

// Helper function to Tween camera positions
function setupTween (position, target, duration, callback)
{
    TWEEN.removeAll();    // remove previous tweens if needed

    new TWEEN.Tween (position)
        .to (target, duration)
        .easing (TWEEN.Easing.Quadratic.InOut)
        .onUpdate (
            function() {
                // copy incoming position into capera position
                camera.position.copy (position);
            })
        .onComplete(callback)
        .onStart(function() {
            isTweening = true;
        })
        .start();
}

// Helper mapping function
function mapValue(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Rainbow Vis - https://github.com/anomal/RainbowVis-JS/blob/master/rainbowvis.js
// for creating color gradients
function Rainbow()
{
    "use strict";
    var gradients = null;
    var minNum = 0;
    var maxNum = 100;
    var colours = ['ff0000', 'ffff00', '00ff00', '0000ff']; 
    setColours(colours);
    
    function setColours (spectrum) 
    {
        if (spectrum.length < 2) {
            throw new Error('Rainbow must have two or more colours.');
        } else {
            var increment = (maxNum - minNum)/(spectrum.length - 1);
            var firstGradient = new ColourGradient();
            firstGradient.setGradient(spectrum[0], spectrum[1]);
            firstGradient.setNumberRange(minNum, minNum + increment);
            gradients = [ firstGradient ];
            
            for (var i = 1; i < spectrum.length - 1; i++) {
                var colourGradient = new ColourGradient();
                colourGradient.setGradient(spectrum[i], spectrum[i + 1]);
                colourGradient.setNumberRange(minNum + increment * i, minNum + increment * (i + 1)); 
                gradients[i] = colourGradient; 
            }

            colours = spectrum;
        }
    }

    this.setSpectrum = function () 
    {
        setColours(arguments);
        return this;
    };

    this.setSpectrumByArray = function (array)
    {
        setColours(array);
        return this;
    };

    this.colourAt = function (number)
    {
        if (isNaN(number)) {
            throw new TypeError(number + ' is not a number');
        } else if (gradients.length === 1) {
            return gradients[0].colourAt(number);
        } else {
            var segment = (maxNum - minNum)/(gradients.length);
            var index = Math.min(Math.floor((Math.max(number, minNum) - minNum)/segment), gradients.length - 1);
            return gradients[index].colourAt(number);
        }
    };

    this.colorAt = this.colourAt;

    this.setNumberRange = function (minNumber, maxNumber)
    {
        if (maxNumber > minNumber) {
            minNum = minNumber;
            maxNum = maxNumber;
            setColours(colours);
        } else {
            throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
        }
        return this;
    };
}

function ColourGradient() 
{
    "use strict";
    var startColour = 'ff0000';
    var endColour = '0000ff';
    var minNum = 0;
    var maxNum = 100;

    this.setGradient = function (colourStart, colourEnd)
    {
        startColour = getHexColour(colourStart);
        endColour = getHexColour(colourEnd);
    };

    this.setNumberRange = function (minNumber, maxNumber)
    {
        if (maxNumber > minNumber) {
            minNum = minNumber;
            maxNum = maxNumber;
        } else {
            throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
        }
    };

    this.colourAt = function (number)
    {
        return calcHex(number, startColour.substring(0,2), endColour.substring(0,2)) + calcHex(number, startColour.substring(2,4), endColour.substring(2,4)) + calcHex(number, startColour.substring(4,6), endColour.substring(4,6));
    };
    
    function calcHex(number, channelStart_Base16, channelEnd_Base16)
    {
        var num = number;
        if (num < minNum) {
            num = minNum;
        }
        if (num > maxNum) {
            num = maxNum;
        } 
        var numRange = maxNum - minNum;
        var cStart_Base10 = parseInt(channelStart_Base16, 16);
        var cEnd_Base10 = parseInt(channelEnd_Base16, 16); 
        var cPerUnit = (cEnd_Base10 - cStart_Base10)/numRange;
        var c_Base10 = Math.round(cPerUnit * (num - minNum) + cStart_Base10);
        return formatHex(c_Base10.toString(16));
    }

    function formatHex(hex) 
    {
        if (hex.length === 1) {
            return '0' + hex;
        } else {
            return hex;
        }
    } 
    
    function isHexColour(string)
    {
        var regex = /^#?[0-9a-fA-F]{6}$/i;
        return regex.test(string);
    }

    function getHexColour(string)
    {
        if (isHexColour(string)) {
            return string.substring(string.length - 6, string.length);
        } else {
            var name = string.toLowerCase();
            if (colourNames.hasOwnProperty(name)) {
                return colourNames[name];
            }
            throw new Error(string + ' is not a valid colour.');
        }
    }
    
    // Extended list of CSS colornames s taken from
    // http://www.w3.org/TR/css3-color/#svg-color
    var colourNames = {
        aliceblue: "F0F8FF",
        antiquewhite: "FAEBD7",
        aqua: "00FFFF",
        aquamarine: "7FFFD4",
        azure: "F0FFFF",
        beige: "F5F5DC",
        bisque: "FFE4C4",
        black: "000000",
        blanchedalmond: "FFEBCD",
        blue: "0000FF",
        blueviolet: "8A2BE2",
        brown: "A52A2A",
        burlywood: "DEB887",
        cadetblue: "5F9EA0",
        chartreuse: "7FFF00",
        chocolate: "D2691E",
        coral: "FF7F50",
        cornflowerblue: "6495ED",
        cornsilk: "FFF8DC",
        crimson: "DC143C",
        cyan: "00FFFF",
        darkblue: "00008B",
        darkcyan: "008B8B",
        darkgoldenrod: "B8860B",
        darkgray: "A9A9A9",
        darkgreen: "006400",
        darkgrey: "A9A9A9",
        darkkhaki: "BDB76B",
        darkmagenta: "8B008B",
        darkolivegreen: "556B2F",
        darkorange: "FF8C00",
        darkorchid: "9932CC",
        darkred: "8B0000",
        darksalmon: "E9967A",
        darkseagreen: "8FBC8F",
        darkslateblue: "483D8B",
        darkslategray: "2F4F4F",
        darkslategrey: "2F4F4F",
        darkturquoise: "00CED1",
        darkviolet: "9400D3",
        deeppink: "FF1493",
        deepskyblue: "00BFFF",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1E90FF",
        firebrick: "B22222",
        floralwhite: "FFFAF0",
        forestgreen: "228B22",
        fuchsia: "FF00FF",
        gainsboro: "DCDCDC",
        ghostwhite: "F8F8FF",
        gold: "FFD700",
        goldenrod: "DAA520",
        gray: "808080",
        green: "008000",
        greenyellow: "ADFF2F",
        grey: "808080",
        honeydew: "F0FFF0",
        hotpink: "FF69B4",
        indianred: "CD5C5C",
        indigo: "4B0082",
        ivory: "FFFFF0",
        khaki: "F0E68C",
        lavender: "E6E6FA",
        lavenderblush: "FFF0F5",
        lawngreen: "7CFC00",
        lemonchiffon: "FFFACD",
        lightblue: "ADD8E6",
        lightcoral: "F08080",
        lightcyan: "E0FFFF",
        lightgoldenrodyellow: "FAFAD2",
        lightgray: "D3D3D3",
        lightgreen: "90EE90",
        lightgrey: "D3D3D3",
        lightpink: "FFB6C1",
        lightsalmon: "FFA07A",
        lightseagreen: "20B2AA",
        lightskyblue: "87CEFA",
        lightslategray: "778899",
        lightslategrey: "778899",
        lightsteelblue: "B0C4DE",
        lightyellow: "FFFFE0",
        lime: "00FF00",
        limegreen: "32CD32",
        linen: "FAF0E6",
        magenta: "FF00FF",
        maroon: "800000",
        mediumaquamarine: "66CDAA",
        mediumblue: "0000CD",
        mediumorchid: "BA55D3",
        mediumpurple: "9370DB",
        mediumseagreen: "3CB371",
        mediumslateblue: "7B68EE",
        mediumspringgreen: "00FA9A",
        mediumturquoise: "48D1CC",
        mediumvioletred: "C71585",
        midnightblue: "191970",
        mintcream: "F5FFFA",
        mistyrose: "FFE4E1",
        moccasin: "FFE4B5",
        navajowhite: "FFDEAD",
        navy: "000080",
        oldlace: "FDF5E6",
        olive: "808000",
        olivedrab: "6B8E23",
        orange: "FFA500",
        orangered: "FF4500",
        orchid: "DA70D6",
        palegoldenrod: "EEE8AA",
        palegreen: "98FB98",
        paleturquoise: "AFEEEE",
        palevioletred: "DB7093",
        papayawhip: "FFEFD5",
        peachpuff: "FFDAB9",
        peru: "CD853F",
        pink: "FFC0CB",
        plum: "DDA0DD",
        powderblue: "B0E0E6",
        purple: "800080",
        red: "FF0000",
        rosybrown: "BC8F8F",
        royalblue: "4169E1",
        saddlebrown: "8B4513",
        salmon: "FA8072",
        sandybrown: "F4A460",
        seagreen: "2E8B57",
        seashell: "FFF5EE",
        sienna: "A0522D",
        silver: "C0C0C0",
        skyblue: "87CEEB",
        slateblue: "6A5ACD",
        slategray: "708090",
        slategrey: "708090",
        snow: "FFFAFA",
        springgreen: "00FF7F",
        steelblue: "4682B4",
        tan: "D2B48C",
        teal: "008080",
        thistle: "D8BFD8",
        tomato: "FF6347",
        turquoise: "40E0D0",
        violet: "EE82EE",
        wheat: "F5DEB3",
        white: "FFFFFF",
        whitesmoke: "F5F5F5",
        yellow: "FFFF00",
        yellowgreen: "9ACD32"
    };
}
