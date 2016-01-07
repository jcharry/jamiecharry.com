var SEPARATION = 80, AMOUNTX = 7, AMOUNTY = 8;

var homePos = new THREE.Vector3(0,300,800);

var container;
var scene, renderer;
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

//var intersecting = false;

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
        createHTMLElements();
        init();
        animate();
    }
});

var $projectToHomeDownArrow;
var $projectRightArrow;
var $projectLeftArrow;
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

    positionArrows();

    $('#body').append($projectRightArrow);
    $('#body').append($projectLeftArrow);
}

function positionArrows() {
    $projectToHomeDownArrow.css('left', windowHalfX - $projectToHomeDownArrow.width()/2 + 'px');
    $projectToHomeDownArrow.css('top', window.innerHeight - 50 + 'px');
    $projectRightArrow.css('left', window.innerWidth - 50 + 'px');
    $projectRightArrow.css('top',windowHalfY);
    $projectLeftArrow.css('left', '20px');
    $projectLeftArrow.css('top',windowHalfY);

}

function arrowClicked(e) {
    switch ($(this)[0].id) {
        case 'projectToHomeDownArrow':
            $(this).fadeOut(1000);
            $('#projectRightArrow').fadeOut(1000);
            $('#projectLeftArrow').fadeOut(1000);
            setupTween(camera.position, homePos, 5000, function() {
                scene.remove(projectSurface);
                scene.remove(projectBackSurface);
                projectSurface = null;
                projectBackSurface = null;
                console.log('back to home');
            });
            break;
        case 'projectRightArrow':
            //$(this).off('click');
            console.log('should twist right');
            new TWEEN.Tween(projectSurface.rotation).to({y:-Math.PI}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
            new TWEEN.Tween(projectBackSurface.rotation).to({y:0}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
            $projectRightArrow.fadeOut(1000);
            $projectLeftArrow.fadeIn(1000);
            //setTimeout(function() {
                //$projectRightArrow.click(arrowClicked);
            //}, 1000);
            break;
        case 'projectLeftArrow':
            //$(this).off('click');
            new TWEEN.Tween(projectSurface.rotation).to({y:0}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
            new TWEEN.Tween(projectBackSurface.rotation).to({y:Math.PI}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
            $projectRightArrow.fadeIn(1000);
            $projectLeftArrow.fadeOut(1000);
            //setTimeout(function() {
                //$projectLeftArrow.click(arrowClicked);
            //}, 1000);
            break;
    }
} 

function init() {

    container = document.getElementById('threejsContainer');

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.z = 800;
    camera.position.y = 300;
    //cameraPos0 = camera.position.clone();
    //cameraUp0 = camera.up.clone();
    //cameraZoom = camera.position.z;
    //console.log(camera);

    scene = new THREE.Scene();
    camera.lookAt(scene.position);

    particles = [];

    var light = new THREE.AmbientLight(  0xffffff);
    light.position.set( 1, 1, 1 ).normalize();
    scene.add(light);

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
                selectableObjects.push(singleParticleGroup);

                // add a halo to particles that should contain a project
                var haloGeo = new THREE.SphereGeometry(10,32,32);
                var haloMat = new THREE.MeshLambertMaterial({color: ballColors[i], transparent: true, opacity: 0.3});
                var haloMesh = new THREE.Mesh(haloGeo, haloMat);
                haloMesh.userData.type = 'particle';
                particle.add(haloMesh);

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
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x333333);
    renderer.sortObjects = false;
    container.appendChild( renderer.domElement );

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
    if (INTERSECTED) {
        console.log(INTERSECTED);
        if (INTERSECTED.parent.parent.userData.type === 'particleGroup') {
            // get project info corresponding to clicked particle
            var proj = INTERSECTED.parent.userData.project;

            if (proj) {
                // Use projects.json to get image src and load the image
                var loader = new THREE.TextureLoader();
                loader.load(proj.imgsrc, function(texture) {

                    // When the loader is done, create the plane geometry,
                    // and map the image onto it
                    var projectSurfaceGeo = new THREE.PlaneGeometry(windowHalfY*1.7777,windowHalfY,3);
                    var projectSurfaceMat = new THREE.MeshPhongMaterial({map:texture});
                    projectSurface = new THREE.Mesh(projectSurfaceGeo, projectSurfaceMat);
                    projectSurface.position.z = 0;
                    projectSurface.position.y = 1000;
                    projectSurface.rotation.x -= 0.3;
                    projectSurface.userData.type = 'projectSurface';
                    scene.add(projectSurface);          // add it to the scene

                    var dynamicTexture = new THREEx.DynamicTexture(windowHalfY*1.777, windowHalfY);
                    dynamicTexture.context.font = '12px Verdana';
                    dynamicTexture.texture.anisotropy = renderer.getMaxAnisotropy();
                    dynamicTexture.clear('white');
                    var text = 'asdfasdfasdfasdfasdflajsdfkja asldkfj askld fals dfklajsdkfla lf as dfka wk ef a weg as dg asdfa sdf as dg as gda sekrj alksjd lkafj gsdlkfj alskjd glkasj dlkja glksjd glkasj dlkfj asldkj glkaj lwkejg asd';
                    dynamicTexture.drawText(text, 32, 256, 'red')
                    var projectBackSurfaceGeo = new THREE.PlaneGeometry(windowHalfY*1.7777, windowHalfY, 3);
                    var projectBackSurfaceMat = new THREE.MeshPhongMaterial({map: dynamicTexture.texture});
                    projectBackSurface = new THREE.Mesh(projectBackSurfaceGeo, projectBackSurfaceMat);
                    projectBackSurface.position.z = 0;
                    projectBackSurface.position.y = 1000;
                    projectBackSurface.rotation.x -= 0.3;
                    projectBackSurface.rotation.y = Math.PI;
                    scene.add(projectBackSurface);

                    //selectableObjects.push(projectSurface);

                    var projectPos = new THREE.Vector3(0,projectSurface.position.y + windowHalfY-150, 800);
                    

                    // Also, when the image is loaded, run the tween animation to move the camera
                    setupTween(camera.position, projectPos, 5000, function() {
                        console.log('tween done');
                        //$('#projectToHomeDownArrow').show();
                        $('#projectToHomeDownArrow').fadeIn(1000);
                        $('#projectRightArrow').fadeIn(1000);
                        //$('#projectLeftArrow').fadeIn(1000);
                    });
                });
                
                //video = document.getElementById('video');
                //var loader2 = new THREE.VideoTexture(video);
                //loader2.load('/images/pr.jpg');
            }
        } 
        //if (INTERSECTED)
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
    requestAnimationFrame( animate );
    render();
}

var logged = false;
function render() {
    TWEEN.update();

    if (logged === false) {
        logged= true;
    }

    camera.updateMatrixWorld();

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

    raycaster.setFromCamera(mouse,camera);
    var intersects = raycaster.intersectObjects(selectableObjects, true);

    if ( intersects.length > 0 ) {
        // check if intersected object is of type
        if (intersects[0].object.userData.type === 'particle') {
            console.log('particle');
        }

        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) {
                if (INTERSECTED.userData.type === 'particle') {
                    INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                    INTERSECTED = null;
                }
            }

            INTERSECTED = intersects[ 0 ].object;
            //console.log(INTERSECTED);
            
            if (INTERSECTED.userData.type === 'particle') {
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 );
                INTERSECTED.parent.parent.holdPosition = true;
                INTERSECTED.scale.x = 2;
                INTERSECTED.scale.y = 2;
                INTERSECTED.scale.z = 2;

                console.log(INTERSECTED.parent.parent);
                showDetailPopup(INTERSECTED.parent.parent, INTERSECTED.parent.userData.project);
            }
        }
    } else {
        //if (INTERSECTED.userData.type) {
            
            //console.log('particle');

        //}
        if (INTERSECTED) {
            if (INTERSECTED.userData.type === 'particle') {
                console.log('particle out');
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED.parent.parent.holdPosition = false;
                INTERSECTED.scale.x = 1;
                INTERSECTED.scale.y = 1;
                INTERSECTED.scale.z = 1;
            }
        }
        INTERSECTED = null;
        removeDetailPopup();
    }

    renderer.render(scene, camera);
    count += 0.1;
}

function createHTMLElements() {
    //var text2 = document.createElement('div');
    //text2.style.position = 'absolute';
    ////text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    //text2.style.width = 100;
    //text2.style.height = 100;
    //text2.style.backgroundColor = "blue";
    //text2.innerHTML = "hi there!";
    //text2.style.top = 200 + 'px';
    //text2.style.left = 200 + 'px';
    //document.body.appendChild(text2);
}

//var $('#projectPopup') = $('#projectPopup');

//var $('#projectPopup') = $("<div data-role='popup' id='myPop3' class='ui-content' data-arrow='r'>");
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
            })
        .onComplete(callback)
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

// Camera animation help from - http://stackoverflow.com/questions/18401213/how-to-animate-the-camera-in-three-js-to-look-at-an-object
function moveCamera(euler, zoom)
{
    // reset everything
    endQ = new THREE.Quaternion();
    iniQ = new THREE.Quaternion().copy(camera.quaternion);
    curQ = new THREE.Quaternion();
    vec3 = new THREE.Vector3();
    tweenValue = 0;

    endQ.setFromEuler(euler);
    TweenLite.to(this, 5, { tweenValue:1, cameraZoom:zoom, onUpdate:onSlerpUpdate });
}

// on every update of the tween
function onSlerpUpdate()
{
    // interpolate quaternions with the current tween value
    THREE.Quaternion.slerp(iniQ, endQ, curQ, 1);//tweenObj.value);

    // apply new quaternion to camera position
    vec3.x = cameraPos0.x;
    vec3.y = cameraPos0.y;
    vec3.z = cameraZoom;
    vec3.applyQuaternion(curQ);
    camera.position.copy(vec3);

    // apply new quaternion to camera up
    vec3 = cameraUp0.clone();
    vec3.applyQuaternion(curQ);
    camera.up.copy(vec3);
}
