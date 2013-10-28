if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer;
var video, texture, material, mesh;
var composer;
var renderModel, effectBloom, effectHue, effectCopy;

var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var videoPlayer = document.getElementById('videoplayer');
var videoInput = document.getElementById('video');
videoInput.load();
videoInput.loop = true;
var canvasInput = document.getElementById('compare');
var videoObject;

var audio = [];
audio.playlist = [];
var audioplayer = document.getElementById('audio');
var audioisplaying = false;
var video = [];
video.playlist = [];
var videoisplaying = false;
var dancer = new Dancer();	

var dropZone = document.getElementById('drop_zone');
var readFiles = document.getElementById('read_files');  
var dropZoneVideo = document.getElementById('video_drop');
var readFilesVideo = document.getElementById('read_video');

var initComplete = false;
var webcamEnabled = false;
var hex;

camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.z = 3600;
window.URL = window.URL || window.webkitURL;

var gui;
//Init DAT GUI control panel
var	ruttEtraParams = {
		bass: 0.0,
		mid: 0.0,
		treble: 0.0,
		mousex: mouseX,
		mousey: mouseY,
		shape: null,
	//	dimX: 100.0,
	//	dimY: 100.0,
	//	dimZ: 100.0,
	//	segX: 100.0,
	//	segY: 100.0,
	//	segZ: 100.0,
		wireframe: true,
		camerax: 0.0,
		cameray: 0.0,
		cameraz: -30.0,
		scale : 1.0,
		multiplier :  12.0,
		displace : 6.0,
		opacity : 0.8,
		originX : 0.0,
		originY: 0.0,
		originZ : -2000.0,
		//bloom: 1.8,
		hue: 0.0,
		saturation: 0.1,
		background: "#000",
		webcam: true
		
	}


var pointer = [];
pointer.push(ruttEtraParams.bass);
pointer.push(ruttEtraParams.mid);
pointer.push(ruttEtraParams.treble);
pointer.push(ruttEtraParams.mousex);
pointer.push(ruttEtraParams.mousey);
var setting = [];
setting.push('');
setting.push('');
setting.push('');
setting.push('');
setting.push('');

container = document.getElementById( 'canvas' );
document.body.appendChild( container );

scene = new THREE.Scene();

texture = new THREE.Texture( videoInput );
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.format = THREE.RGBFormat;
//texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//texture.repeat.set( 720, 480 );
texture.generateMipmaps = true;


videoMaterial = new THREE.ShaderMaterial( {
    uniforms: {
        "tDiffuse": { type: "t", value: texture },
        "multiplier":  { type: "f", value: 66.6 },
    	"displace":  { type: "f", value: 33.3 },
    	"opacity":  { type: "f", value: 1.0 },
    	"originX":  { type: "f", value: 0.0 },
    	"originY":  { type: "f", value: 0.0 },
    	"originZ":  { type: "f", value: -2000.0 }
    },

    vertexShader: RuttEtraShader.vertexShader,
    fragmentShader: RuttEtraShader.fragmentShader,
    depthWrite: true,
    depthTest: true,
    wireframe: false, 
    transparent: true,
    overdraw: false
   
});
videoMaterial.renderToScreen = true;
videoMaterial.wireframe = true;
geometry = new THREE.PlaneGeometry(720, 480, 720, 480);
geometry.overdraw = false;
geometry.dynamic = true;
geometry.verticesNeedUpdate = true;

mesh = new THREE.Mesh( geometry, videoMaterial );

mesh.position.x = 0;
mesh.position.y = 0;


mesh.visible = true;
mesh.scale.x = mesh.scale.y = 1.0;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;
container.appendChild( renderer.domElement );

// postprocessing
composer = new THREE.EffectComposer( renderer );

renderModel = new THREE.RenderPass( scene, camera );
composer.addPass( renderModel );	

effectBloom = new THREE.BloomPass( 2.0, 20, 4.0, 256 );
composer.addPass( effectBloom );

effectHue = new THREE.ShaderPass( THREE.HueSaturationShader  );
effectHue.renderToScreen = true;
effectHue.uniforms[ 'hue' ].value = 0.0;
effectHue.uniforms[ 'saturation' ].value = 0.0;
composer.addPass( effectHue );

//	effectCopy = new THREE.ShaderPass( THREE.CopyShader  );
//	effectCopy.renderToScreen = true;
//	composer.addPass( effectCopy );
	
gui = new dat.GUI({autoPlace: false});
var guiContainer = document.getElementById('gui_container');
guiContainer.appendChild(gui.domElement);
gui.remember(ruttEtraParams);

var f1 = gui.addFolder('Audio');

f1.add(ruttEtraParams, 'bass', 0.0,1.0).step(0.01).listen().name("Bass").onChange(audioChange);
f1.add(ruttEtraParams, 'mid', 0.0,1.0).step(0.01).listen().name("Mid").onChange(audioChange);
f1.add(ruttEtraParams, 'treble', 0.0,1.0).step(0.01).listen().name("Treble").onChange(audioChange);
f1.open();	

var f2 = gui.addFolder('Mouse');

f2.add(ruttEtraParams, 'mousex', -960.0,960.0).step(1.0).listen().name("Mouse X").onChange(onParamsChange);
f2.add(ruttEtraParams, 'mousey', -540.0,540.0).step(1.0).listen().name("Mouse Y").onChange(onParamsChange);
f2.open();	

var f3 = gui.addFolder('Camera');

f3.add(ruttEtraParams, 'cameraz', -12000.0,12000.0).step(1.0).listen().name("Zoom").onChange(onParamsChange);
f3.add(ruttEtraParams, 'camerax', -3600.0,3600.0).step(1.0).listen().name("Camera X").onChange(onParamsChange);
f3.add(ruttEtraParams, 'cameray', -3600.0,3600.0).step(1.0).listen().name("Camera Y").onChange(onParamsChange);
f3.open();

var f4 = gui.addFolder('Synthesizer');

f4.add(ruttEtraParams, 'displace', -100.0, 100.0).step(0.1).listen().name("Displace").onChange(onParamsChange);
f4.add(ruttEtraParams, 'multiplier', -100.0, 100.0).step(0.1).name("Amplify").listen().onChange(onParamsChange);
f4.add(ruttEtraParams, 'originX', -2000.0, 2000.0).step(100.0).listen().name("Distort X").onChange(onParamsChange);
f4.add(ruttEtraParams, 'originY', -2000.0, 2000.0).step(100.0).listen().name("Distort Y").onChange(onParamsChange);
f4.add(ruttEtraParams, 'originZ', -2000.0, 2000.0).step(100.0).listen().name("Distort Z").onChange(onParamsChange);
f4.add(ruttEtraParams, 'opacity', 0.0,1.0).step(0.01).listen().name("Opacity").onChange(onParamsChange);
f4.add(ruttEtraParams, 'hue', -1.0,1.0).step(0.01).name("Hue").onChange(onParamsChange);
f4.add(ruttEtraParams, 'saturation', -1.0,0.87).step(0.01).name("Saturation").onChange(onParamsChange);
f4.addColor(ruttEtraParams, 'background').name("Background Color").onChange(onParamsChange);
//f4.add(ruttEtraParams, 'bloom', 0.0,120.0).step(0.1).name("Bloom").onChange(onParamsChange);
f4.open();	

var f5 = gui.addFolder('Geometry');
f5.add(ruttEtraParams, 'shape', [ 'plane', 'sphere', 'cube', 'cylinder', 'torus' ] ).listen().name("Shape").onChange(meshChange);
f5.add(ruttEtraParams, 'scale', 0.1, 20.0).step(1.0).listen().name("Scale").onChange(onParamsChange);
//f5.add(ruttEtraParams, 'dimX', 1.0,720.0).step(1.0).listen().name("X Dimension");
//f5.add(ruttEtraParams, 'dimY', 1.0,720.0).step(1.0).listen().name("Y Dimension");
//f5.add(ruttEtraParams, 'dimZ', 1.0,720.0).step(1.0).listen().name("Z Dimension");
//f5.add(ruttEtraParams, 'segX', 1.0,720.0).step(1.0).listen().name("X Segments");
//f5.add(ruttEtraParams, 'segY', 1.0,720.0).step(1.0).listen().name("Y Segments");
//f5.add(ruttEtraParams, 'segZ', 1.0,720.0).step(1.0).listen().name("Z Segments");
f5.add(ruttEtraParams, 'wireframe').onChange(onToggleWireframe);
f5.add(ruttEtraParams, 'webcam').onChange(onToggleWebcam);
f5.open();

gui.close();

onParamsChange();

function checkLoad() {
        if (videoInput.readyState === 4) {
           init();
           animate();
        } else {
            setTimeout(checkLoad, 100);
        }
    }

checkLoad();





function playAudio(playlistId){
    	audioisplaying = false;
    	audioplayer.pause();
    	audioplayer.remove();
    	audioplayer = container.appendChild(document.createElement("audio"));
    	if($('#close_drop').is('.active')){
	    	$('audio').hide();
    	}
    	else{
	    	$('audio').show();
    	}
    	
    	audioplayer.id = 'audio';
    	audioplayer.controls = true;
		audioplayer.src = audio.playlist[playlistId];  
		dancer.after( 0, function() {
			// After 0s, let's get this real and map a frequency to displacement of mesh
			// Note that the instance of dancer is bound to "this"
			ruttEtraParams.bass = this.getFrequency( 140 ) * 100;
			ruttEtraParams.mid = this.getFrequency( 210 ) * 100;
			ruttEtraParams.treble = this.getFrequency( 460 ) * 100;
			
		}).load( audioplayer );		
		audioplayer.play();
		dancer.play();
		audioisplaying = true; 
		$('#playlist').children('li').css('background-color','#010101');
	    $('#playlist').children('li').eq(playlistId).css('background-color','#232323');
}	
function continueAudioPlay(){
		audio.current++;
		var playlist = audio.playlist;
		var length = playlist.length;
		if(audio.current == length){
		    audio.current = 0;
		    playAudio(audio.current);
		}
		else{
		    playAudio(audio.current);
		}
}
function continueVideoPlay(){
		videoInput.current++;
		var playlist = video.playlist;
		var length = playlist.length;
		if(videoInput.current == length){
		    videoInput.current = 0;
		    playVideo(videoInput.current);
		}
		else{
		    playVideo(videoInput.current);
		}
}
function playVideo(playlistId){
    		   	  		
    	videoInput.pause();
    	videoisplaying = false;
		videoInput.src = video.playlist[playlistId];
		videoInput.loop = false; 
		//videoInput.currentTime = 0;
		videoInput.muted = true;
		videoInput.play();
		videoisplaying = true; 
		$('#videoplaylist').children('li').css('background-color','#010101');
	    $('#videoplaylist').children('li').eq(playlistId).css('background-color','#232323');
}

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

if (window.File && window.FileReader && window.FileList && window.Blob) {
window.requestFileSystem  =  window.requestFileSystem || window.webkitRequestFileSystem; 
}
function errorHandler(err){
 var msg = 'An error occured: ';
 
  switch (err.code) { 
    case FileError.NOT_FOUND_ERR: 
      msg += 'File or directory not found'; 
      break;
 
    case FileError.NOT_READABLE_ERR: 
      msg += 'File or directory not readable'; 
      break;
 
    case FileError.PATH_EXISTS_ERR: 
      msg += 'File or directory already exists'; 
      break;
 
    case FileError.TYPE_MISMATCH_ERR: 
      msg += 'Invalid filetype'; 
      break;
 
    default:
      msg += 'Unknown Error'; 
      break;
  };
 
 console.log(msg);
};

function listAudioResults(entries) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
   						audio.playlist.push( entry.toURL() ); 
				   	  	
				   	  	var li = document.createElement('li');
				   	  	var name = unescape(entry.name);
				   	  	var correctName = unescape(entry.name);
				   	  	if(correctName.length > 30) correctName = correctName.substring(0,30);
				   	  	li.innerHTML = ['<a class="track" href="#" data-href="',entry.toURL(),
				   	  	                  '" data-title="', correctName, '">', correctName, '</a>'].join('');
				   	  	document.getElementById('playlist').insertBefore(li, null);
				   	  	
				   	  	var nodeList = Array.prototype.slice.call( document.getElementById('playlist').children );
				   	  	var index = nodeList.indexOf( li );
				   	  	
				   	  	li.onclick=function(){
				   	  		playAudio(index);
				   	  		audio.current = index;
				   	  		audioplayer.addEventListener('ended', continueAudioPlay, false);
				   	  		$('#close_drop').trigger('click');
				   	  	}
  });

  document.querySelector('#playlist').appendChild(fragment);
  $('#read_files').fadeOut(1000);
}
function listVideoResults(entries) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
   						video.playlist.push( entry.toURL() ); 
				   	  	
				   	  	var li = document.createElement('li');
				   	  	var name = unescape(entry.name);
				   	  	var correctName = unescape(entry.name);
				   	  	if(correctName.length > 30) correctName = correctName.substring(0,30);
				   	  	li.innerHTML = ['<a class="track" href="#" data-href="',entry.toURL(),
				   	  	                  '" data-title="', correctName, '">', correctName, '</a>'].join('');
				   	  	document.getElementById('videoplaylist').insertBefore(li, null);
				   	  	
				   	  	var nodeList = Array.prototype.slice.call( document.getElementById('videoplaylist').children );
				   	  	var index = nodeList.indexOf( li );
				   	  	
				   	  	li.onclick=function(){
				   	  		playVideo(index);
				   	  		videoInput.current = index;
				   	  		videoInput.addEventListener('ended', continueVideoPlay, false);
				   	  		$('#close_drop').trigger('click');
				   	  	}
  });

  document.querySelector('#playlist').appendChild(fragment);
  $('#read_video').fadeOut(1000);
}

function readAudioFileSelect(evt) {

	evt.stopPropagation();
    evt.preventDefault();
	
	window.requestFileSystem(window.TEMPORARY, 800*1024*1024, function(fs) {
	
				
		fs.root.getDirectory('audio', {}, function(dirEntry){		
		var dirReader = dirEntry.createReader();
		var entries = [];

		var readEntries = function() {
		   dirReader.readEntries (function(results) {
		    if (!results.length) {
		      listAudioResults(entries.sort());
		    } else {
		      entries = entries.concat(toArray(results));
		      readEntries();
		    }
		  }, errorHandler);
		};
		
		readEntries(); // Start reading dirs.


		});
  
   });
}
 
function readVideoFileSelect(evt) {

	evt.stopPropagation();
    evt.preventDefault();
	
	window.requestFileSystem(window.TEMPORARY, 800*1024*1024, function(fs) {
	
				
		fs.root.getDirectory('video', {}, function(dirEntry){		
		var dirReader = dirEntry.createReader();
		var entries = [];

		var readEntries = function() {
		   dirReader.readEntries (function(results) {
		    if (!results.length) {
		      listVideoResults(entries.sort());
		    } else {
		      entries = entries.concat(toArray(results));
		      readEntries();
		    }
		  }, errorHandler);
		};
		
		readEntries(); // Start reading dirs.


		});
  
   });
}
 

function handleAudioFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
	
	var files = evt.dataTransfer.files;

	window.requestFileSystem(window.TEMPORARY, 800*1024*1024, function(fs) {
	    // Duplicate each file the user selected to the app's fs.
	    
	  //    alert("Welcome to Filesystem!"); // Just to check if everything is OK :)
	    fs.root.getDirectory('audio', {create: true}, function(dirEntry) {

		}, errorHandler);  
	      
	    for (var i = 0, file; file = files[i]; ++i) {
	
	     
	      (function(f) {
	        
	        fs.root.getFile('/audio/'+f.name, {create: true, exclusive: true}, function(fileEntry) {
	          	  fileEntry.createWriter(function(fileWriter) {
	          		  fileWriter.write(f); 
	          	  }, errorHandler);
	          
	              fileEntry.file(function(file) {
			   	  var reader = new FileReader();
			   	
			   	  reader.onloadend = function(e) {
				   	 	audio.playlist.push( fileEntry.toURL() ); 
				   	  	
				   	  	var li = document.createElement('li');
				   	  	var name = unescape(fileEntry.name);
				   	  	var correctName = unescape(fileEntry.name);
				   	  	if(correctName.length > 30) correctName = correctName.substring(0,30);
				   	  	li.innerHTML = ['<a class="track" href="#" data-href="',fileEntry.toURL(),
				   	  	                  '" data-title="', correctName, '">', correctName, '</a>'].join('');
				   	  
				   	  	document.getElementById('playlist').insertBefore(li, null);
				   	  	var nodeList = Array.prototype.slice.call( document.getElementById('playlist').children );
				   	  	var index = nodeList.indexOf( li );
				   	  	li.onclick=function(){
				   	  		playAudio(index);
				   	  		$('#close_drop').trigger('click');
				   	  	}

			   	  };
			   	
			   	  reader.readAsDataURL(file);
			   	}, errorHandler);

	        }, errorHandler);
			   	
	      })(file);
	     
	
	    }

	    $('header').delay(8000).fadeOut(2000);

	    
	    
	});


	
}
function handleVideoFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
	
	var files = evt.dataTransfer.files;

	window.requestFileSystem(window.TEMPORARY, 800*1024*1024, function(fs) {
	    // Duplicate each file the user selected to the app's fs.
	    
	  //    alert("Welcome to Filesystem!"); // Just to check if everything is OK :)
	      
	    fs.root.getDirectory('video', {create: true}, function(dirEntry) {

		}, errorHandler);
	    for (var i = 0, file; file = files[i]; ++i) {
	
	     
	      (function(f) {
	        
	        fs.root.getFile('/video/'+f.name, {create: true, exclusive: true}, function(fileEntry) {
	          	  fileEntry.createWriter(function(fileWriter) {
	          		  fileWriter.write(f); 
	          	  }, errorHandler);
	          
	              fileEntry.file(function(file) {
			   	  var reader = new FileReader();
			   	
			   	  reader.onloadend = function(e) {
				 
				   	    video.playlist.push( fileEntry.toURL() ); 
				   	   
				  	
				   	  	var li = document.createElement('li');
				   	  	var name = unescape(fileEntry.name);
				   	  	var correctName = unescape(fileEntry.name);
				   	  	if(correctName.length > 30) correctName = correctName.substring(0,30);
				   	  	li.innerHTML = ['<a class="track" href="#" data-href="',fileEntry.toURL(),
				   	  	                  '" data-title="', correctName, '">', correctName, '</a>'].join('');
				   	  
				   	  	document.getElementById('videoplaylist').insertBefore(li, null);
				   	  	var nodeList = Array.prototype.slice.call( document.getElementById('videoplaylist').children );
				   	  	var index = nodeList.indexOf( li );
				   	  	li.onclick=function(){
				   	  		playVideo(index);
				   	  		console.log(index);
				   	  		$('#close_drop').trigger('click');
				   	  	}
	
			   	  };
			   	
			   	  reader.readAsDataURL(file);
			   	}, errorHandler);

	        }, errorHandler);
			   	
	      })(file);
	     
	
	    }
		//$('header h2').text('Change controls to achieve stunning new looks.');
	    $('header').delay(8000).fadeOut(2000);
	    
	    
	});


	
}
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

if (Modernizr.filesystem) {
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleAudioFileSelect, false);
readFiles.addEventListener('mousedown', readAudioFileSelect, false); 
dropZoneVideo.addEventListener('dragover', handleDragOver, false);
dropZoneVideo.addEventListener('drop', handleVideoFileSelect, false);
readFilesVideo.addEventListener('mousedown', readVideoFileSelect, false); 
} 
else{

} 
function init() {

	var light = new THREE.PointLight( 0xffffff );
	light.position.set( 1000, 1000, 1000 ).normalize();
	light.shadowCameraVisible = true;
	light.shadowDarkness = 0.25;
	light.intensity = 12;
	light.castShadow = true;
	scene.add( light );
	
	var directionalLightFill = new THREE.DirectionalLight(0xffffff);
	directionalLightFill.position.set(-1000, 1000, 2000).normalize();
	directionalLightFill.shadowCameraVisible = true;
	directionalLightFill.shadowDarkness = 0.25;
	directionalLightFill.intensity = 6;
	directionalLightFill.castShadow = true;
	scene.add(directionalLightFill);
	

	mesh.position.z = scene.position.z;
	scene.add( mesh );
			
	var pointTo = 0;
	
	if (Modernizr.getusermedia) {
		 $('header h2').text('Click "allow" to start webcam.');
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		//get webcam
		navigator.getUserMedia({
		    video: true,
		    audio: false
		}, function(stream) {
		    //on webcam enabled
		    if (navigator.mozGetUserMedia) {
		        videoInput.mozSrcObject = stream;
		    } 
		    else {
		        var vendorURL = window.URL || window.webkitURL;
		        webcamEnabled = true;
		        videoObject = vendorURL.createObjectURL(stream);
				videoInput.src = videoObject;
		    }
		
		    $('header h2').text('Drag and Drop up to 1GB of MP3 to the Playlist.');
		    $('header p,header h2,header h1,header a').delay(8000).fadeOut(2000);
		}, function(error) {
		    prompt.innerHTML = 'Unable to capture WebCam. Please reload the page or try with Google Chrome.';
		});
	}
	else{
		$('header h2').text('Synth requires WebRTC & HTML5 Filesystem. Try it out with Google Chrome.');
	}


	$('.property-name').mousedown(function() {

	if( $(this).not('.active') ){
	
	    $(this).addClass('active');
	
		
		if($(this).text() === 'Bass') {
			pointer[0] = ruttEtraParams.bass;
			pointTo = 0;
			console.log(pointer[0]);
			return;
		}
		if($(this).text() === 'Mid') {
			pointer[1] = ruttEtraParams.mid;
			pointTo = 1;
			console.log(pointer[1]);
			return;
		}
		if($(this).text() === 'Treble') {
			pointer[2] = ruttEtraParams.treble;
			pointTo = 2;
			console.log(pointer[2]);
			return;
		}
		if($(this).text() === 'Mouse X') {
			pointer[3] = mouseX;
			pointTo = 3;
			console.log(pointer[3]);
			return;
		}
		if($(this).text() === 'Mouse Y') {
			pointer[4] = mouseY;
			pointTo = 4;
			console.log(pointer[4]);
			return;
		}
		if($(this).text() === 'Zoom') {	
			setting[pointTo] = 'ruttEtraParams.cameraz = pointer[i] * 4';	
		//	ruttEtraParams.cameraz = setting[pointTo];
		}
		if($(this).text() === 'Camera X') {
			setting[pointTo] = 'ruttEtraParams.camerax = pointer[i] * 2';	
			//ruttEtraParams.camerax = setting[pointTo];
		}
		if($(this).text() === 'Camera Y') {
			setting[pointTo] = 'ruttEtraParams.cameray = pointer[i] * 10';
			//ruttEtraParams.cameray = setting[pointTo];
		}
		if($(this).text() === 'Displace') {
			setting[pointTo] = 'ruttEtraParams.displace = pointer[i] * 100';
			//ruttEtraParams.displace = setting[pointTo];
		}
		if($(this).text() === 'Amplify') {
			setting[pointTo] = 'ruttEtraParams.multiplier = pointer[i] * 100';
			//ruttEtraParams.multiplier = setting[pointTo];
		}
		if($(this).text() === 'Distort X') {
			setting[pointTo] = 'ruttEtraParams.originX = pointer[i] * 100';
			//ruttEtraParams.originX = setting[pointTo];
		}
		if($(this).text() === 'Distort Y') {
			setting[pointTo] = 'ruttEtraParams.originY = pointer[i] * 100';
			//ruttEtraParams.originY = setting[pointTo];
		}
		if($(this).text() === 'Distort Z') {
			setting[pointTo] = 'ruttEtraParams.originZ = pointer[i] * 100';
			//ruttEtraParams.originZ = setting[pointTo];	
		}
		if($(this).text() === 'Opacity') {
			setting[pointTo] = 'ruttEtraParams.opacity = pointer[i]';
			//ruttEtraParams.opacity = setting[pointTo];
		}
		if( $(this).text() === 'Scale' || $(this).text() === 'X Dimension' || $(this).text() === 'Y Dimension' || $(this).text() === 'Z Dimension' || $(this).text() === 'X Segments' || $(this).text() === 'Y Segments' || $(this).text() === 'Z Segments' ) {
			return;
		}
		$(this).parent('div').children('.c').children('.slider').prepend('<div class="cancel" data-pointer="'+pointTo+'"></div>');

		$(this).parent('div').children('.c').children('.slider').children('.cancel').on('click',function(){	
		
	
			setting[ $(this).data('pointer') ] = "";
				
			
			$(this).parent('li').children('div:first-child').children('.property-name').removeClass('active');
			$(this).remove();
	
		});
	
		}
	});
	


	$('<div id="close_drop"><p>Close Playlist</p></div>').insertAfter('audio');

	$('#close_drop').on('click',function(){
		$(this).toggleClass('active');
		$('header').fadeOut(8000);
		if($(this).is('.active')){
			$('#drop_zone').hide();
			$('#video_drop').hide();
			$('audio').css('top','20px');
			$('audio').hide();
			$(this).css('top', '0px');
			$(this).children('p').text('Open Playlist');
		}
		else if($(this).not('.active')){
		    $('#drop_zone').show();
		    $('#video_drop').show();
		    $('audio').show();
		    $('audio').css('top','298px');
			$(this).css('top', '627px');
			$(this).children('p').text('Close Playlist');
		}
	});
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
	keypress.combo("1", function() {
	   playVideo(0);
    });
    keypress.combo("2", function() {
       playVideo(1);
    });
    keypress.combo("3", function() {
       playVideo(2);
    });
    keypress.combo("4", function() {
       playVideo(3);
    });
    keypress.combo("5", function() {
       playVideo(4);
    });
    keypress.combo("6", function() {
       playVideo(5);
    });
    keypress.combo("7", function() {
       playVideo(6);
    });
    keypress.combo("8", function() {
       playVideo(7);
    });
    keypress.combo("9", function() {
       playVideo(8);
    });
    keypress.combo("0", function() {
       onToggleWebcam();
    });
    keypress.combo("l", function() {
       if(videoInput.loop == false){
       videoInput.loop = true;
       }
       else{
	   videoInput.loop = false;    
       }
    });

	initComplete = true;
	animate();
}

function audioChange(){
	ruttEtraParams.bass = this.getFrequency( 140 ) * 100;
    ruttEtraParams.mid = this.getFrequency( 210 ) * 100;
    ruttEtraParams.treble = this.getFrequency( 460 ) * 100;
}

function onParamsChange(){

	mesh.scale.x = mesh.scale.y = ruttEtraParams.scale;
	
	ruttEtraParams.mousex = mouseX;   
	ruttEtraParams.mousey = mouseY;
	
	camera.position.x = ruttEtraParams.camerax;
	camera.position.y = ruttEtraParams.cameray;
	camera.position.z = ruttEtraParams.cameraz;
	
	videoMaterial.uniforms[ "displace" ].value = ruttEtraParams.displace;
	videoMaterial.uniforms[ "multiplier" ].value = ruttEtraParams.multiplier;
	videoMaterial.uniforms[ "opacity" ].value = ruttEtraParams.opacity;
	videoMaterial.uniforms[ "originX" ].value = ruttEtraParams.originX;
	videoMaterial.uniforms[ "originY" ].value = ruttEtraParams.originY;
	videoMaterial.uniforms[ "originZ" ].value = ruttEtraParams.originZ;


	effectHue.uniforms[ 'hue' ].value = ruttEtraParams.hue;
	effectHue.uniforms[ 'saturation' ].value = ruttEtraParams.saturation;
	
	$('#canvas').css( 'background-color', ruttEtraParams.background );
	hex = ruttEtraParams.background;
	hex = parseInt(hex.replace('#','0x'));
	renderer.setClearColor( hex , 1.0 );
	
	pointer[0] = ruttEtraParams.bass;
	pointer[1] = ruttEtraParams.mid;
	pointer[2] = ruttEtraParams.treble;
	pointer[3] = ruttEtraParams.mousex;
	pointer[4] = ruttEtraParams.mousey;
	
	for(var i=0; i<=4; i++){
	
	eval(setting[i]);
	
	}
	
	for (var i in gui.__controllers) {
	   gui.__controllers[i].updateDisplay();
	}
	

}

function meshChange(geo){

//	newMesh(ruttEtraParams.shape, ruttEtraParams.dimX, ruttEtraParams.dimY, ruttEtraParams.dimZ, ruttEtraParams.segX, ruttEtraParams.segY, ruttEtraParams.segZ, ruttEtraParams.scale);

	newMesh(ruttEtraParams.shape, ruttEtraParams.scale);
	
}


//function newMesh(geo, sizeX, sizeY, sizeZ, segX, segY, segZ, scale){

function newMesh(geo,scale){

	scene.remove(mesh);
	
	if(geo === 'plane') {
		geometry = new THREE.PlaneGeometry(videoInput.videoWidth, videoInput.videoHeight, videoInput.videoWidth, videoInput.videoHeight);

	}
	
	else if (geo === 'sphere') {
	
		geometry = new THREE.SphereGeometry(videoInput.videoHeight/2, videoInput.videoHeight/2, videoInput.videoHeight/2);

	}
	
	else if (geo === 'cube') {
		geometry = new THREE.CubeGeometry(videoInput.videoHeight/3, videoInput.videoHeight/3, videoInput.videoHeight/3, videoInput.videoHeight/3, videoInput.videoHeight/3, videoInput.videoHeight/3);

	}
	
	else if (geo === 'cylinder') {
	
		geometry = new THREE.CylinderGeometry( scale*2, scale*2, videoInput.videoHeight/2, videoInput.videoWidth/2, videoInput.videoHeight/2, true );
		camera.position.z = ruttEtraParams.cameraz = 40;
	
	}
	
	else if (geo === 'torus') {
	//	geometry = new THREE.TorusKnotGeometry(videoInput.videoWidth, videoInput.videoHeight, videoInput.videoWidth, videoInput.videoHeight, videoInput.videoWidth, videoInput.videoWidth, scale);
		geometry = new THREE.TorusGeometry( scale*2, videoInput.videoHeight/2, videoInput.videoHeight/2, videoInput.videoHeight/2 );
	}
	drawNewMesh(geometry);
	
	
}

function drawNewMesh(geometry){
	geometry.overdraw = false;
	geometry.dynamic = true;
	geometry.verticesNeedUpdate = true;
	
	mesh = new THREE.Mesh( geometry, videoMaterial );

	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = scene.position.z;

	mesh.visible = true;
	//mesh.scale.x = mesh.scale.y = 16.0;
	mesh.scale.x = mesh.scale.y = ruttEtraParams.scale;
	scene.add(mesh);
}

function onToggleWireframe() {

  if( videoMaterial.wireframe === false ){
    	
    	videoMaterial.wireframe = true;
    	
    }
    else{
    
	  	videoMaterial.wireframe = false;
    	
    }
    
	
}

function onToggleWebcam() {

    if( ruttEtraParams.webcam === true  ){
    	
	
		videoInput.src = videoObject;
	    	
    }
    else{
    
	  	videoInput.src = video.nowPlaying;
    	
    }
    
	
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.reset();

}


function onDocumentMouseMove(event) {

	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY ) * 0.3;

}


function animate() {

	requestAnimationFrame( animate );
	render();
	//stats.update();
	
}


function render() {
	
	if ( videoInput.readyState === videoInput.HAVE_ENOUGH_DATA ) {
		if ( texture ) texture.needsUpdate = true;
		if ( videoMaterial ) videoMaterial.needsUpdate = true;
	}	
	camera.lookAt( scene.position );	
	onParamsChange();
	//renderer.clear();
	composer.render();

}



