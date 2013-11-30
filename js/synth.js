/*synth v175*/
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
video.playlist.push('vid/wavves-1280x720-2500kbps.mp4');
var videoisplaying = false;
var dancer = new Dancer();	

var dropZone = document.getElementById('drop_zone');
var readFiles = document.getElementById('read_files');  
var dropZoneVideo = document.getElementById('video_drop');
var readFilesVideo = document.getElementById('read_video');

var initComplete = false;
var webcamEnabled = false;
var hex;

var controls = false;

camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.z = 3600;
window.URL = window.URL || window.webkitURL;

var gui;
var pointer = [];
var setting = [];
//Init DAT GUI control panel
var	params = function() {

		this.bass = 0.0;
		this.mid = 0.0;
		this.treble = 0.0;
		this.mousex = mouseX;
		this.mousey = mouseY;
		this.shape = 'plane';
		this.wireframe = false;
		this.camerax = 0.0;
		this.cameray = -1130.0;
		this.cameraz = 1680.0;
		this.scale = 6.0;
		this.multiplier =  16.0;
		this.displace = -6.0;
		this.opacity = 0.2;
		this.originX = 0.0;
		this.originY = 0.0;
		this.originZ = -2000.0;
		this.hue = 0.0;
		this.saturation = 0.5;
		this.background = '#090000';
		this.webcam = false;
		
		pointer.push(this.bass);
		pointer.push(this.mid);
		pointer.push(this.treble);
		pointer.push(this.mousex);
		pointer.push(this.mousey);
		
		setting.push('');
		setting.push('');
		setting.push('');
		setting.push('');
		setting.push('');
		
		onParamsChange();
};


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
videoMaterial.wireframe = false;
geometry = new THREE.PlaneGeometry(640, 360, 640, 360);
geometry.overdraw = false;
geometry.dynamic = true;
geometry.verticesNeedUpdate = true;

mesh = new THREE.Mesh( geometry, videoMaterial );
mesh.doubleSided = true;
mesh.position.x = 0;
mesh.position.y = 0;
mesh.visible = true;
mesh.scale.x = mesh.scale.y = 6.0;

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;
container.appendChild( renderer.domElement );

// postprocessing
composer = new THREE.EffectComposer( renderer );

renderModel = new THREE.RenderPass( scene, camera );
composer.addPass( renderModel );	

effectBloom = new THREE.BloomPass( 3.3, 20, 4.0, 256 );
composer.addPass( effectBloom );

effectHue = new THREE.ShaderPass( THREE.HueSaturationShader  );
effectHue.renderToScreen = true;
effectHue.uniforms[ 'hue' ].value = 0.0;
effectHue.uniforms[ 'saturation' ].value = 0.0;
composer.addPass( effectHue );

//	effectCopy = new THREE.ShaderPass( THREE.CopyShader  );
//	effectCopy.renderToScreen = true;
//	composer.addPass( effectCopy );
var guiSetup = false;
var synthParams = new params();
var guiContainer = document.getElementById('gui_container');
$.getJSON( "default.json", function( response ) {	

gui = new dat.GUI({load: response, preset: 'Default', autoPlace: false});
gui.remember(synthParams);
gui.revert();

var f1 = gui.addFolder('Audio');
f1.add(synthParams, 'bass', 0.0,1.0).step(0.01).listen().name("Bass").onChange(audioChange);
f1.add(synthParams, 'mid', 0.0,1.0).step(0.01).listen().name("Mid").onChange(audioChange);
f1.add(synthParams, 'treble', 0.0,1.0).step(0.01).listen().name("Treble").onChange(audioChange);
f1.open();	

var f2 = gui.addFolder('Mouse');
f2.add(synthParams, 'mousex', -960.0,960.0).step(1.0).listen().name("Mouse X").onChange(onParamsChange);
f2.add(synthParams, 'mousey', -540.0,540.0).step(1.0).listen().name("Mouse Y").onChange(onParamsChange);
f2.open();	

var f3 = gui.addFolder('Camera');
f3.add(synthParams, 'cameraz', -3600.0,3600.0).step(10.0).listen().name("Zoom").onChange(onParamsChange);
f3.add(synthParams, 'camerax', -3600.0,3600.0).step(10.0).listen().name("Camera X").onChange(onParamsChange);
f3.add(synthParams, 'cameray', -3600.0,3600.0).step(10.0).listen().name("Camera Y").onChange(onParamsChange);
f3.open();

var f4 = gui.addFolder('Synthesizer');
f4.add(synthParams, 'displace', -100.0, 100.0).step(0.1).listen().name("Displace").onChange(onParamsChange);
f4.add(synthParams, 'multiplier', -100.0, 100.0).step(0.1).name("Amplify").listen().onChange(onParamsChange);
f4.add(synthParams, 'originX', -2000.0, 2000.0).step(1.0).listen().name("Distort X").onChange(onParamsChange);
f4.add(synthParams, 'originY', -2000.0, 2000.0).step(1.0).listen().name("Distort Y").onChange(onParamsChange);
f4.add(synthParams, 'originZ', -2000.0, 2000.0).step(1.0).listen().name("Distort Z").onChange(onParamsChange);
f4.add(synthParams, 'opacity', 0.0,1.0).step(0.01).listen().name("Opacity").onChange(onParamsChange);
f4.add(synthParams, 'hue', 0.0,360.0).step(0.1).name("Hue").onChange(onParamsChange);
f4.add(synthParams, 'saturation', -1.0,0.87).step(0.01).name("Saturation").onChange(onParamsChange);
f4.addColor(synthParams, 'background').name("Background Color").onChange(onParamsChange);
f4.open();	

var f5 = gui.addFolder('Geometry');
f5.add(synthParams, 'shape', [ 'plane', 'sphere', 'cube', 'cylinder', 'torus' ] ).listen().name("Shape").onChange(meshChange);
f5.add(synthParams, 'scale', 0.1, 20.0).step(0.1).listen().name("Scale").onChange(onParamsChange);
f5.add(synthParams, 'wireframe').onChange(onToggleWireframe);
f5.add(synthParams, 'webcam').onChange(onToggleWebcam);
f5.open();

gui.close();
guiContainer.appendChild(gui.domElement);

$('.save-row select').on('change',function(){
	if(webcamEnabled === false){

	}
	
});

guiSetup = true;


});
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
			synthParams.bass = this.getFrequency( 140 ) * 100;
			synthParams.mid = this.getFrequency( 210 ) * 100;
			synthParams.treble = this.getFrequency( 460 ) * 100;
			
		}).load( audioplayer );		
		audioplayer.play();
		dancer.play();
		audioisplaying = true; 
		$('#playlist').children('li').css('background-color','rgba(10,10,10,0.7)');
	    $('#playlist').children('li').eq(playlistId).css('background-color','rgba(10,10,10,0.9)');
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
		videoInput.muted = true;
		videoInput.play();
		videoisplaying = true; 
		$('#videoplaylist').children('li').css('background-color','rgba(10,10,10,0.7)');
	    $('#videoplaylist').children('li').eq(playlistId).css('background-color','rgba(10,10,10,0.9)');
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
  $('#drop_zone').css('background', 'transparent');
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
				   	  		playVideo(index+1);/*temp fix for default video, must be +1 because default video is in the 0 slot*/
				   	  		videoInput.current = index;
				   	  		videoInput.addEventListener('ended', continueVideoPlay, false);
				   	  		$('#close_drop').trigger('click');
				   	  	}
  });

  document.querySelector('#playlist').appendChild(fragment);
  $('#video_drop').css('background', 'transparent');
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

	var light = new THREE.SpotLight(0xffffff);
	light.position.set( 0, 0, 1000 ).normalize();
	light.target = mesh;
	//light.shadowCameraVisible = true;
	//light.shadowDarkness = 0.25;
	light.intensity = 1200;
	light.castShadow = true;
	scene.add( light );
	

	
	var directionalLightFill = new THREE.SpotLight(0xffffff);
	directionalLightFill.position.set(0, 0, -1000).normalize();
	directionalLightFill.target = mesh;
	//directionalLightFill.shadowCameraVisible = true;
	//directionalLightFill.shadowDarkness = 0.25;
	directionalLightFill.intensity = 1200;
	directionalLightFill.castShadow = true;
	scene.add(directionalLightFill);
	

	mesh.position.z = scene.position.z;
	scene.add( mesh );
			
	var pointTo = 0;
	
	if (Modernizr.getusermedia) {
		 $('header h2').text('Click "allow" to start webcam.');
		  setTimeout(function(){
		     $('header h2').text('Drag and drop up to 1GB of web audio and video to the playlists.');
		    setTimeout(function(){
				 $('header h2').text('Control the distortion.');
				 $('header h2').next('a').text('Watch the video to learn more').attr('href','http://kineticvideo.co/info/synth-early-alpha-available-now/');
					if(controls === false){
					 $('.close-button').trigger('click');   
					}
				  		setTimeout(function(){
				  		
					  			$('header h2').text('Audio and mouse control the Synthesizer.');
					  		//	$('.property-name').addClass('highlight');
					  				setTimeout(function(){
					  			//	$('.property-name').removeClass('highlight');
					  			//	$('.save-row select').addClass('highlight');
					  				$('header h2').text('Save presets for later.');
					  				
					  					setTimeout(function(){
					  				//	$('.save-row select').removeClass('highlight');
					  					$('header p,header h2,header h1,header a').fadeOut(2000);
					  					},5000);
					  				
					  				  
					  				},5000);
					  	
				 	},5000);
				 
		    },5000);
		   },3000);
		    
		    
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
		        synthParams.webcam = true; //meant to select the input
		        videoObject = vendorURL.createObjectURL(stream);
				videoInput.src = videoObject;
		    }
		
		
		    
		}, function(error) {
		    prompt.innerHTML = 'Unable to capture WebCam. Please reload the page or try with Google Chrome.';
		});
	}
	else{
		$('header h2').text('Synth requires WebRTC & HTML5 Filesystem. Try it out with Google Chrome.');
	}


	$('.property-name').on('click',function() {
	
		
	
		
	    
	
		
		if($(this).text() === 'Bass') {
			pointer[0] = synthParams.bass;
			pointTo = 0;
			console.log(pointer[0]);

		}
		if($(this).text() === 'Mid') {
			pointer[1] = synthParams.mid;
			pointTo = 1;
			console.log(pointer[1]);

		}
		if($(this).text() === 'Treble') {
			pointer[2] = synthParams.treble;
			pointTo = 2;
			console.log(pointer[2]);

		}
		if($(this).text() === 'Mouse X') {
			pointer[3] = mouseX;
			pointTo = 3;
			console.log(pointer[3]);
	
		}
		if($(this).text() === 'Mouse Y') {
			pointer[4] = mouseY;
			pointTo = 4;
			console.log(pointer[4]);
		
		}
		if($(this).text() === 'Zoom') {	
			setting[pointTo] = 'synthParams.cameraz = pointer[i] * 4';	
		//	synthParams.cameraz = setting[pointTo];
		}
		if($(this).text() === 'Camera X') {
			setting[pointTo] = 'synthParams.camerax = pointer[i] * 2';	
			//synthParams.camerax = setting[pointTo];
		}
		if($(this).text() === 'Camera Y') {
			setting[pointTo] = 'synthParams.cameray = pointer[i] * 10';
			//synthParams.cameray = setting[pointTo];
		}
		if($(this).text() === 'Displace') {
			setting[pointTo] = 'synthParams.displace = pointer[i] * 100';
			//synthParams.displace = setting[pointTo];
		}
		if($(this).text() === 'Amplify') {
			setting[pointTo] = 'synthParams.multiplier = pointer[i] * 100';
			//synthParams.multiplier = setting[pointTo];
		}
		if($(this).text() === 'Distort X') {
			setting[pointTo] = 'synthParams.originX = pointer[i] * 100';
			//synthParams.originX = setting[pointTo];
		}
		if($(this).text() === 'Distort Y') {
			setting[pointTo] = 'synthParams.originY = pointer[i] * 100';
			//synthParams.originY = setting[pointTo];
		}
		if($(this).text() === 'Distort Z') {
			setting[pointTo] = 'synthParams.originZ = pointer[i]';
			//synthParams.originZ = setting[pointTo];	
		}
		if($(this).text() === 'Opacity') {
			setting[pointTo] = 'synthParams.opacity = pointer[i]';
			//synthParams.opacity = setting[pointTo];
		}
		if( $(this).text() === 'Scale' || $(this).text() === 'X Dimension' || $(this).text() === 'Y Dimension' || $(this).text() === 'Z Dimension' || $(this).text() === 'X Segments' || $(this).text() === 'Y Segments' || $(this).text() === 'Z Segments' ) {
		}
		 
		if( !$(this).hasClass('active') ){
		$(this).addClass('active');
		$(this).parent('div').children('.c').children('.slider').prepend('<div class="cancel" data-pointer="'+pointTo+'"></div>');
		}
		$(this).parent('div').children('.c').children('.slider').children('.cancel').on('click',function(){	
		
	
			setting[ $(this).data('pointer') ] = "";
				
			
			$(this).parent('li').children('div:first-child').children('.property-name').removeClass('active');
			$(this).remove();
	
		});
	
		
		
	});
	

if (Modernizr.filesystem) {
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
}
else{
	$('#close_drop,#video_drop,#drop_zone,audio').hide();
}	
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
    var mouseView = true;

    keypress.combo("x", function() {
      
       if($('#close_drop').not('.active')){
	        $('#close_drop').trigger('click');
       }
       if($('.close-button').not('.active')){
	        $('.close-button').trigger('click');
       }
       
    });
	$('.close-button').on('click',function(){
		if(controls === false){
		controls = true;
		$('.close-button').addClass('active');
		}
		else{
		controls = false;	
		$('.close-button').removeClass('active');
		}
	});
	if(webcamEnabled === false){
		playVideo(0);
	}
	initComplete = true;
	animate();
}

function audioChange(){
	if(guiSetup===true && audioisplaying===true){
	synthParams.bass = this.getFrequency( 140 ) * 100;
    synthParams.mid = this.getFrequency( 210 ) * 100;
    synthParams.treble = this.getFrequency( 460 ) * 100;
    }
}

function onParamsChange(){
	if(guiSetup===true){
	mesh.scale.x = mesh.scale.y = parseFloat(synthParams.scale);
	
	synthParams.mousex = mouseX;   
	synthParams.mousey = mouseY;
	
	camera.position.x = parseFloat(synthParams.camerax);
	camera.position.y = parseFloat(synthParams.cameray);
	camera.position.z = parseFloat(synthParams.cameraz);
	
	videoMaterial.uniforms[ "displace" ].value = synthParams.displace;
	videoMaterial.uniforms[ "multiplier" ].value = synthParams.multiplier;
	videoMaterial.uniforms[ "opacity" ].value =  parseFloat(synthParams.opacity);
	videoMaterial.uniforms[ "originX" ].value =  parseFloat(synthParams.originX);
	videoMaterial.uniforms[ "originY" ].value =  parseFloat(synthParams.originY);
	videoMaterial.uniforms[ "originZ" ].value =  parseFloat(synthParams.originZ);


	effectHue.uniforms[ 'hue' ].value = synthParams.hue;
	effectHue.uniforms[ 'saturation' ].value = synthParams.saturation;
	
	$('#canvas').css( 'background-color', synthParams.background );
	hex = synthParams.background;
	hex = parseInt(hex.replace('#','0x'));
	renderer.setClearColor( hex , 1.0 );
	
	pointer[0] = synthParams.bass;
	pointer[1] = synthParams.mid;
	pointer[2] = synthParams.treble;
	pointer[3] = synthParams.mousex;
	pointer[4] = synthParams.mousey;
	
	for(var i=0; i<=4; i++){
	
	eval(setting[i]);
	
	}
	
	for (var i in gui.__controllers) {
	   gui.__controllers[i].updateDisplay();
	}
	}
	
	

}

function meshChange(){
		scene.remove(mesh);
		var shape = synthParams.shape;
		geometry.verticesNeedUpdate = false;
		geometry.dynamic = false;

		switch (shape)
		{
		case 'plane':
		 		 	geometry = new THREE.PlaneGeometry(360, 180, 360, 180);
		 		 	mesh = new THREE.Mesh( geometry, videoMaterial );
		 		 
		break;
		
		case 'sphere':
		 			geometry = new THREE.SphereGeometry(360, 360, 360);
		 			mesh = new THREE.Mesh( geometry, videoMaterial );
		 		
		break;
		  
		case 'cube':
					geometry = new THREE.CubeGeometry(120, 120, 120, 120, 120, 120);
					mesh = new THREE.Mesh( geometry, videoMaterial );
		break;
		
		case 'cylinder':
					geometry = new THREE.CylinderGeometry( synthParams.scale, synthParams.scale, 240, 360, 240, false );
					mesh = new THREE.Mesh( geometry, videoMaterial );
		break;
		
		case 'torus':
					geometry = new THREE.TorusGeometry( synthParams.scale, 360, 360, 360 );
					mesh = new THREE.Mesh( geometry, videoMaterial );
		break;
		 
		default:
		  			geometry = new THREE.PlaneGeometry(640, 360, 640, 360);
		  			mesh = new THREE.Mesh( geometry, videoMaterial );
		
		}

		geometry.dynamic = true;
		geometry.verticesNeedUpdate = true;
		mesh.doubleSided = true;
		mesh.position.x = mesh.position.y = mesh.position.z = 0;
		mesh.scale.x = mesh.scale.y = synthParams.scale;	
		scene.add(mesh);


	
}



function onToggleWireframe() {

  if( synthParams.wireframe === false && videoMaterial.wireframe === false ){
    	
    	videoMaterial.wireframe = true;

    	
    }
   else{
    
	  	videoMaterial.wireframe = false;

    }
    
	
}

function onToggleWebcam() {

    if( synthParams.webcam === true  ){
    	
		synthParams.webcam = true;
		videoInput.src = videoObject;
	    	
    }
    else{
    	synthParams.webcam = false; 
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



