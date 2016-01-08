var SEPARATION = 80, AMOUNTX = 7, AMOUNTY = 8;

var currentPos = 'home';
var isTweening = false;

var container;
var scene, renderer;
var cssScene, cssRenderer, cssObject, cssObjectBack;
var groups = [];
var pageGroup;

var particles, particle, count = 0;
var annotations = [];
var projectSurface;
var projectBackSurface;
var downArrow;

var mouseX = 0, mouseY = 0;

var mouse = new THREE.Vector2(), INTERSECTED;
//var radius = 100, theta = 0;
var intersects, raycaster;
var selectableObjects = [];

// Easily access mid point on screen
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// camera positions
var homePos = new THREE.Vector3(0,300,800);
var projectPos = new THREE.Vector3(0,1000 + windowHalfY-150, 800);
var rightPos = new THREE.Vector3(1000, 300, 800);
var leftPos = new THREE.Vector3(-1000, 300, 800);


// Get rainbow colors for main balls
var rainbow = new Rainbow();
rainbow.setNumberRange(0, AMOUNTX*AMOUNTY);
var ballColors = [];
for (var i = 0; i < AMOUNTX*AMOUNTY; i++) {
    ballColors.push(parseInt(rainbow.colorAt(i).replace(/^#/,''),16));
}

// fire off request to get project information
var projects;
$.ajax('/projectInfo',{
    type: 'GET',
    success: function(data) {
        setupArrows();
        projects = data;
        init();
        animate();
    }
});

var $projectToHomeDownArrow;
var $projectRightArrow;
var $projectLeftArrow;
var $homeRightArrow;
var $homeLeftArrow;
var $homeDownArrow;
function setupArrows() {
    // Arrow to move back to home from the project position
    $projectToHomeDownArrow = $("<img id='projectToHomeDownArrow' class='arrow' src='/images/downarrow.png'>");
    $projectToHomeDownArrow.hide();
    $projectToHomeDownArrow.click(arrowClicked);
    $('#body').append($projectToHomeDownArrow);

    // Project arrows to rotate to next plane with new image
    $projectRightArrow = $("<img id='projectRightArrow' class='arrow' src='/images/rightarrow.png'>");
    $projectLeftArrow = $("<img id='projectLeftArrow' class='arrow' src='/images/leftarrow.png'>");
    $projectRightArrow.hide();
    $projectRightArrow.click(arrowClicked);
    $projectLeftArrow.hide();
    $projectLeftArrow.click(arrowClicked);

    // Project arrows to rotate to next plane with new image
    //$homeRightArrow = $("<img id='homeRightArrow' class='arrow' src='/images/rightarrow.png'>");
    $homeRightArrow = $('#homeRightArrow');
    $homeLeftArrow = $('#homeLeftArrow');
    $homeDownArrow = $('#homeDownArrow');
    //$homeLeftArrow = $("<img id='homeLeftArrow' class='arrow' src='/images/leftarrow.png'>");
    //$homeDownArrow = $("<img id='homeDownArrow' class='arrow' src='/images/downarrow.png'>");
    $homeRightArrow.click(arrowClicked);
    $homeLeftArrow.click(arrowClicked);
    $homeDownArrow.click(arrowClicked);

    positionArrows();

    $('#body').append($projectRightArrow);
    $('#body').append($projectLeftArrow);
    $('#body').append($homeRightArrow);
    $('#body').append($homeLeftArrow);
    $('#body').append($homeDownArrow);
}

function positionArrows() {
    $projectToHomeDownArrow.css('left', windowHalfX - $projectToHomeDownArrow.width()/2 + 'px');
    $projectToHomeDownArrow.css('top', window.innerHeight - 50 + 'px');
    $projectRightArrow.css('left', window.innerWidth - 50 + 'px');
    $projectRightArrow.css('top',windowHalfY + 'px');
    $projectLeftArrow.css('left', '20px');
    $projectLeftArrow.css('top',windowHalfY + 'px');

    $homeRightArrow.css('left', window.innerWidth - 70 + 'px');
    $homeRightArrow.css('top',windowHalfY + 'px');
    $homeLeftArrow.css('left', '20px');
    $homeLeftArrow.css('top',windowHalfY + 'px');
    $homeDownArrow.css('left', windowHalfX - $homeDownArrow.width()/2 + 'px');
    $homeDownArrow.css('top', window.innerHeight - $homeDownArrow.height() -10 + 'px');

}

function arrowClicked(e) {
    if (!isTweening) {
        switch ($(this)[0].id) {
            case 'projectToHomeDownArrow':
                $(this).fadeOut(1000);
                $('#projectRightArrow').fadeOut(1000);
                $('#projectLeftArrow').fadeOut(1000);
                //isTweening = true;
                setupTween(camera.position, homePos, 5000, function() {
                    isTweening = false;
                    //scene.remove(projectSurface);
                    //scene.remove(projectBackSurface);
                    //projectSurface = null;
                    //projectBackSurface = null;
                    var elt = document.getElementById('cssRendererElement');
                    elt.parentNode.removeChild(elt);
                    cssScene.remove(cssObject);
                    cssScene.remove(cssObjectBack);
                    cssRenderer = null;

                    // bring back home arrows
                    $('#homeRightArrow').fadeIn(1000);
                    $('#homeLeftArrow').fadeIn(1000);
                    $('#homeDownArrow').fadeIn(1000);
                    console.log('back to home');
                });
                break;
            case 'projectRightArrow':

                // Tween rotation of css objects
                new TWEEN.Tween(cssObject.rotation)
                .to({y:-Math.PI}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function() {
                    // when the rotation is halfway, switch positions so back object shows
                    //if(cssObject.rotation.y < -Math.PI/2) {
                        //// bring back object to front
                        //cssObjectBack.position.z = 1;
                    //}
                }).start();
                new TWEEN.Tween(cssObjectBack.rotation)
                .to({y:0}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function() {
                    console.log(cssObjectBack.rotation.y);
                    if (cssObjectBack.rotation.y < Math.PI/2) {
                        cssObjectBack.position.z = 1;
                    } 
                })
                .start();

                // fade the appropriate arrows into view
                $projectRightArrow.fadeOut(1000);
                $projectLeftArrow.fadeIn(1000);
                break;

            case 'projectLeftArrow':

                // Tween back
                new TWEEN.Tween(cssObject.rotation)
                .to({y:0}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function() {
                    //if (cssObject.rotation.y > -Math.PI/2) {
                        //cssObjectBack.position.z = -1;
                    //}
                })
                .onComplete(function() {
                    isTweening = false;
                })
                .start();
                new TWEEN.Tween(cssObjectBack.rotation)
                .to({y:Math.PI}, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function(){
                    if (cssObjectBack.rotation.y > Math.PI/2) {
                        cssObjectBack.position.z = -1;
                    }
                })
                .onComplete(function() {
                        isTweening = false;
                })
                .start();
                $projectRightArrow.fadeIn(1000);
                $projectLeftArrow.fadeOut(1000);
                //setTimeout(function() {
                    //$projectLeftArrow.click(arrowClicked);
                //}, 1000);
                cssObjectBack.position.z = -1;
                break;

            case 'homeRightArrow':
                console.log('right tapped');
                if (currentPos === 'home') {
                    $(this).fadeOut(1000);
                    $homeLeftArrow[0].children[0].innerHTML = 'Home';
                    console.log($homeLeftArrow);
                    $('#homeDownArrow').fadeOut(1000);
                    setupRightScene();
                    currentPos = 'right';
                    setupTween(camera.position, rightPos, 5000, function() {
                        console.log(currentPos);
                        $('#homeLeftArrow').fadeIn(1000);
                        $('#contactinfo').fadeIn(1000);
                        isTweening = false;
                    });
                } else if (currentPos === 'left') {
                    currentPos = 'home';
                    $homeRightArrow[0].children[0].innerHTML = 'Contact';
                    setupTween(camera.position, homePos, 5000, function() {
                        console.log(currentPos);
                        $('#homeDownArrow').fadeIn(1000);
                        $('#homeLeftArrow').fadeIn(1000);
                        removeLeftScene();
                        isTweening = false;
                    });
                }
                break;

            case 'homeLeftArrow':
                console.log('left tapped'); 
                if (currentPos === 'home') {
                    $(this).fadeOut(1000);
                    $homeRightArrow[0].children[0].innerHTML = 'Home';
                    $('#homeDownArrow').fadeOut(1000);
                    setupLeftScene();
                    currentPos = 'left';
                    setupTween(camera.position, leftPos, 5000, function() {
                        console.log(currentPos);
                        $('#homeRightArrow').fadeIn(1000);
                        isTweening = false;
                    });
                } else if (currentPos === 'right') {
                    currentPos = 'home';
                    $homeLeftArrow[0].children[0].innerHTML = 'About';
                    setupTween(camera.position, homePos, 5000, function() {
                        console.log(currentPos);
                        $('#homeDownArrow').fadeIn(1000);
                        $('#homeRightArrow').fadeIn(1000);
                        $('#contactinfo').fadeOut(1000);
                        removeRightScene();
                        isTweening = false;
                    });
                }
                break;
            case 'homeDownArrow':
                console.log('down tapped');
                break;
        }
    }
} 

var contactBoxes = [];
var contactLinks = ['https://github.com/jcharry/','https://www.facebook.com/jamie.charry','https://www.linkedin.com/in/jcharry', 'mailto:jamie.charry@gmail.com'];
var imgURLs = ['/images/github.png','/images/facebook.png','/images/linkedin.png','/images/mail.png'];
var posCounter = 0;
// The 5th element in the materials array is the face towards us
function setupRightScene() {
    console.log('should setup right scene');
    // Contact balls 
    
    console.log(textureCounter);
    if (textureCounter === 4) {
        var textures = [githubTexture, facebookTexture, linkedinTexture, emailTexture];
        for (var i = 0; i < 4; i++) {
            var materials = [
                new THREE.MeshLambertMaterial({color:0x395842}),
                new THREE.MeshLambertMaterial({color:0x123456}),
                new THREE.MeshLambertMaterial({color:0x6a8b4c}),
                new THREE.MeshLambertMaterial({color:0x824ca3}),
                new THREE.MeshLambertMaterial({map:textures[i]}),
                new THREE.MeshLambertMaterial({color:0x3a56b8})
            ];
            
            var boxGeo = new THREE.BoxGeometry(100,100,100);
            //var boxMat = new THREE.MeshLambertMaterial({color:0x123456});
            var box = new THREE.Mesh(boxGeo, new THREE.MeshFaceMaterial(materials));
            //var box = new THREE.Mesh(boxGeo, boxMat);
            selectableObjects.push(box);
            box.position.z = 0;
            box.position.x = posCounter * 150 + 850;
            posCounter++;
            box.rotation.x -= 0.3;
            box.userData.type = 'contactBox';
            //box.material.emissive.setHex(0xf3a2b5);
            box.userData.link = contactLinks[i];

            if (Math.random() > 0.5) {
                box.rotDirX = 1;
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
            contactBoxes.push(box);
            scene.add(box);
        } 
    } else {
        setTimeout(setupRightScene, 1000);
    }
}
function removeRightScene() {
    console.log('should remove right scene');
    for (var i = 0; i < contactBoxes.length; i++) {
       scene.remove(contactBoxes[i]); 
    }
    contactBoxes = [];
    posCounter = 0;
    console.log(scene.children);
}
function setupLeftScene() {
   console.log('should setup left scene');
   // About balls

}
function removeLeftScene() {
    console.log('should remove left scene');

}

var githubTexture;
var facebookTexture;
var emailTexture;
var linkedinTexture;
var textureCounter = 0;
function init() {

    $('#contactinfo').css('left',windowHalfX - $('#contactinfo').width()/2 + 'px');
    $('#contactinfo').css('top',window.innerHeight - $('#contactinfo').height() - 20 + 'px');

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

    container = document.getElementById('threejsContainer');

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.z = 800;
    camera.position.y = 300;
    //cameraPos0 = camera.position.clone();
    //cameraUp0 = camera.up.clone();
    //cameraZoom = camera.position.z;
    //console.log(camera);

    scene = new THREE.Scene();
    


    particles = [];

    var light = new THREE.AmbientLight(  0xffffff);
    light.position.set( 1, 1, 1 ).normalize();
    scene.add(light);
    var dirlight = new THREE.DirectionalLight(0xffffff,0.5);
    dirlight.position.set(0,1,0).normalize();
    scene.add(dirlight);

    // pick as many random numbers as there are projects
    var randNumbers = [];
    for (var i = 0; i < projects.length; i++) {
        var n = Math.floor(Math.random() * AMOUNTX*AMOUNTY);
        // if the new random number is already contained in randNumbers, then don't add it
        // instead redo this iteration of the loop
        if ($.inArray(n, randNumbers) === -1) {
            randNumbers.push(n); 
        } else {
            i -=1;      // sets loop counter back one
            continue;   // ends this iteration of the loop and starts the next
        }
    }

    var i = 0;
    var projectCount = 0;

    // Loop through desired number of balls
    for (var ix = 0; ix < AMOUNTX; ix++) {
        for (var iy = 0; iy < AMOUNTY; iy++) {
            
            // Group to hold particle and line and text altogether
            var singleParticleGroup = new THREE.Group();

            // position groups according to separation and number of balls
            singleParticleGroup.position.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
            singleParticleGroup.position.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
            singleParticleGroup.userData.type = 'particleGroup';

            // Create particle sphere 
            var particleMaterial = new THREE.MeshLambertMaterial({ color: ballColors[i] });
            var particleGeometry = new THREE.SphereGeometry(5,32,32);
            particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.userData.type = 'particle';

            // Hold reference to spheres specifically to be used for raycasting selection
            //particles.push(particle);
            //selectableObjects.push(particle);


            // Add a line to the group if index matches our random number array
            // Should use a three.js SHAPE or something else I think
            // TODO: figure out how to make the shape I want
            var shape;
            var line;
            if ($.inArray(i, randNumbers) !== -1) {

                // Hold reference to this particle to be selectable
                //selectableObjects.push(singleParticleGroup);

                // add a halo to particles that should contain a project
                var haloGeo = new THREE.SphereGeometry(12,32,32);
                var haloMat = new THREE.MeshLambertMaterial({color: ballColors[i], transparent: true, opacity: 0.5});
                var haloMesh = new THREE.Mesh(haloGeo, haloMat);
                haloMesh.userData.type = 'particle';
                haloMesh.userData.project = projects[projectCount];
                particle.add(haloMesh);

                selectableObjects.push(haloMesh);

                // associate a project with this particle
                particle.userData.project = projects[projectCount];
                projectCount++;

                // create annotation lines and text
                var m = new THREE.LineBasicMaterial({ color: ballColors[i], linewidth: 2 });
                var g = new THREE.Geometry();
                g.vertices.push(
                    new THREE.Vector3(0,0,0),
                    new THREE.Vector3(30,30,30),
                    new THREE.Vector3(50,50,50)
                );
                line = new THREE.Line(g, m);
                //particle.add(line);

            }

            singleParticleGroup.add(particle);
            groups.push(singleParticleGroup);

            scene.add(singleParticleGroup);
            i++;

        }
    }

    //var downArrowGeo = new THREE.SphereGeometry(5,32,32);
    //var downArrowMat = new THREE.MeshLambertMaterial({color:0x000000});
    //var downArrow = new THREE.Mesh(downArrowGeo, downArrowMat);
    //downArrow.position.z = 0;
    //downArrow.position.y = 600;
    //downArrow.scrollDir = 'down';
    //scene.add(downArrow);
    //selectableObjects.push(downArrow);

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();
    //renderer = new THREE.CanvasRenderer();
    //renderer.domElement.style.position = 'absolute';
    //renderer.domElement.style.top = 0;
    //renderer.domElement.style.left = 0;
    //renderer.domElement.style.zIndex = 1;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x333333);
    renderer.sortObjects = false;
    document.body.appendChild( renderer.domElement );




    camera.lookAt(scene.position);
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    positionArrows();

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

                // Move camera upwards
                setupTween(camera.position, projectPos, 5000, function() {
                    isTweening = false;
                    console.log('tween done');
                    //$('#projectToHomeDownArrow').show();
                    $('#projectToHomeDownArrow').fadeIn(1000);
                    $('#projectRightArrow').fadeIn(1000);
                    //$('#projectLeftArrow').fadeIn(1000);
                });
                
            }
        } 

        if (INTERSECTED.userData.type === 'contactBox') {
            console.log('box clicked');
            window.open(INTERSECTED.userData.link);

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

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    TWEEN.update();

    camera.updateMatrixWorld();

    // Particle motion
    waveParticles();
    // Box motion
    wobbleBoxes();
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
            console.log('particle');
        } else if (intersects[0].object.userData.type === 'contactBox') {
            console.log('contactBox');
        }


        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) {
                if (INTERSECTED.userData.type === 'particle') {
                    INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                    INTERSECTED = null;
                }
                if (INTERSECTED.userData.type === 'contactBox') {
                    //INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                    INTERSECTED = null;
                }
            }

            INTERSECTED = intersects[ 0 ].object;
            //console.log(INTERSECTED);
            
            if (INTERSECTED.userData.type === 'particle') {
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 );
                INTERSECTED.parent.parent.holdPosition = true;
                INTERSECTED.scale.x = 1.5;
                INTERSECTED.scale.y = 1.5;
                INTERSECTED.scale.z = 1.5;

                console.log(INTERSECTED.parent.parent);
                showDetailPopup(INTERSECTED.parent.parent, INTERSECTED.parent.userData.project);
            } else if (INTERSECTED.userData.type === 'contactBox') {
                console.log('contact box in');
            }
        }
    } else {
        if (INTERSECTED) {
            if (INTERSECTED.userData.type === 'particle') {
                console.log('particle out');
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED.parent.parent.holdPosition = false;
                INTERSECTED.scale.x = 1;
                INTERSECTED.scale.y = 1;
                INTERSECTED.scale.z = 1;
            } else if (INTERSECTED.userData.type === 'contactBox') {
                console.log('contact box out');
            }
        }
        INTERSECTED = null;
        removeDetailPopup();
    }

}

// Move the particles in the home position in a wave motion
function waveParticles() {
    var i = 0;
    for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
        for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

            particle = groups[i];
            i++;
            if (!particle.holdPosition) {
                particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 10 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 10 );
            } 
        }
    }
    count += 0.1;
}

// Wobble the contact boxes
function wobbleBoxes() {
    if (contactBoxes.length > 0) {
        for (var i = 0; i < contactBoxes.length; i++) {
            var box = contactBoxes[i];
            if (box.rotation.y >= 0.3) {
                box.rotDirY = -1;
            } else if (box.rotation.y <= -0.5) {
                box.rotDirY = 1;
            }
            if (box.rotation.x >= 0.15) {
                box.rotDirX = -1;
            } else if (box.rotation.x <= -0.3) {
                box.rotDirX = 1;
            }
            if (box.rotation.z >= 0.2) {
                box.rotDirZ = -1;
            } else if (box.rotation.z <= -0.2) {
                box.rotDirZ = 1;
            }
            box.rotation.y += 0.003*box.rotDirY;
            box.rotation.x += 0.003*box.rotDirX;
            box.rotation.z += 0.003*box.rotDirZ;
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
    console.log(obj.position);
    console.log(data);
    console.log($('#projectPopup'));


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
                console.log(isTweening);
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
	}

	this.setSpectrumByArray = function (array)
	{
		setColours(array);
		return this;
	}

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
	}

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
	}
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
	}

	this.setNumberRange = function (minNumber, maxNumber)
	{
		if (maxNumber > minNumber) {
			minNum = minNumber;
			maxNum = maxNumber;
		} else {
			throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
		}
	}

	this.colourAt = function (number)
	{
		return calcHex(number, startColour.substring(0,2), endColour.substring(0,2)) 
			+ calcHex(number, startColour.substring(2,4), endColour.substring(2,4)) 
			+ calcHex(number, startColour.substring(4,6), endColour.substring(4,6));
	}
	
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
	}
}

