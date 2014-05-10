/*synth v185*/
var Synth = function() {	
	var that = this;
	this.container;
	this.camera;
	this.scene;
	this.renderer;
	this.texture;
	this.material;
	this.mesh;
	this.light;
	this.directionalLightFill;
	this.composer;
	this.renderModel; 
	this.effectBloom;
	this.effectHue;
	this.effectCopy;
	this.mouseX = 0;
	this.mouseY = 0;
	this.windowHalfX = window.innerWidth / 2;
	this.windowHalfY = window.innerHeight / 2;
	this.videoPlayer = document.getElementById('videoplayer');
	this.videoInput = document.getElementById('video');
	this.videoInput.current = 0;
	this.canvasInput = document.getElementById('compare');
	this.videoObject;
	this.videoisplaying = false;
	this.vplaylist = [];
	this.aplaylist = [];
	this.audioInput = document.getElementById('audio');
	this.audioInput.current = 0;
	this.audioisplaying = false;
	this.dancer = new Dancer();		
	this.dropZone = document.getElementById('drop_zone');
	this.readFiles = document.getElementById('read_files');  
	this.dropZoneVideo = document.getElementById('video_drop');
	this.readFilesVideo = document.getElementById('read_video');	
	this.initComplete = false;
	this.webcamEnabled = false;
	this.menusEnabled = true;
	this.hex = '#090000';	
	this.controls = false;	
	this.gui;
	this.pointer = [];
	this.pointTo = 0;
	this.setting = [];
	this.bass = 0.0;
	this.mid = 0.0;
	this.treble = 0.0;
	this.mousex = that.mouseX;
	this.mousey = that.mouseY;
	this.shape = 'plane';
	this.wireframe = false;
	this.camerax = 0.0;
	this.cameray = -1130.0;
	this.cameraz = 1680.0;
	this.scale = 6.0;
	this.multiplier =  16.0;
	this.displace = -6.0;
	this.transparency = 0.2;
	this.originX = 0.0;
	this.originY = 0.0;
	this.originZ = -2000.0;
	this.hue = 0.0;
	this.saturation = 0.5;
	this.background = '#090000';
	this.webcam = false;
	this.guiSetup = false;	
	this.f1;
	this.f2;
	this.f3;
	this.f4;
	this.f5;
	this.guiContainer;		
	this.pointer.push(this.bass);
	this.pointer.push(this.mid);
	this.pointer.push(this.treble);
	this.pointer.push(this.mousex);
	this.pointer.push(this.mousey);		
	this.setting.push('');
	this.setting.push('');
	this.setting.push('');
	this.setting.push('');
	this.setting.push('');	
}

Synth.prototype = {
get displacement(){
	return this.displace;
},
set displacement(val){
	this.displace = val;	
},
get multiply(){
	return this.multiplier;
},
set multiply(val){
	this.multiplier = val;	
},
get scaler(){
	return this.scale;
},
set scaler(val){
	//this.scale = val;
	this.mesh.scale.x = this.mesh.scale.y = this.scale = parseFloat(val);	
},
get originPos(){

	return this.originX+','+this.originY+','+this.originZ;

},
set originPos(pos){
	var coords = pos.split(',');
	this.originX = parseFloat(coords[0]);
	this.originY = parseFloat(coords[1]);
	this.originZ = parseFloat(coords[2]);
	
},
get cameraPos(){
	return this.camera.position.x+','+this.camera.position.y+','+this.camera.position.z;
},
set cameraPos(pos){
	var coords = pos.split(',');
	this.camerax = this.camera.position.x = parseFloat(coords[0]);
	this.cameray = this.camera.position.y = parseFloat(coords[1]);
	this.cameraz = this.camera.position.z = parseFloat(coords[2]);	
},
get model(){
	return this.shape;
},
set model(shape){
	if(shape === 'plane' || shape === 'cube' || shape === 'torus' || shape === 'sphere' || shape === 'cylinder'){
	this.shape = shape;
	this.meshChange(shape);
	}	
},
get color(){
	return this.hue;
},
set color(val){
	this.hue = val;	
},
get saturate(){
	return this.saturation;
},
set saturate(val){
	this.saturation = val;	
},
get opacity(){
	return this.transparency;
},
set opacity(val){
	this.transparency = val;	
},
get bg(){
	return this.hex;
},
set bg(val){
	var that = this;
	this.hex = val;
	console.log(this.hex);	
	$('#canvas').css( 'background-color', that.hex );	
	var newhex = parseInt(that.hex.replace('#','0x'));
	this.renderer.setClearColor( newhex , 1.0 );
	
},
get wire(){
	return this.wireframe;
},
set wire(val) {

  if( this.wireframe === false && this.videoMaterial.wireframe === false && val === true ){
    	
    	this.videoMaterial.wireframe = true;
    	this.wireframe = true;
    	
    }
   else{
    
	  	this.videoMaterial.wireframe = false;
	  	this.wireframe = false;

    }	
},
get channel(){
	return this.webcam;
},
set channel(val) {

    if( this.webcamEnabled === false && val === true ){
    	
		this.videoInput.src = this.videoObject;
		this.webcamEnabled = true;
		this.webcam = true; 

	
    }
    else{
    	
    	this.playVideo(this.currentVideo);
    	this.webcamEnabled = false;
    	this.webcam = false; 
	    	
    }   	
},
get menu(){

 return this.menusEnabled;
 
},
set menu(val){

    if( this.menusEnabled === false  && val === true ){
    	
		$('#close_drop,.close-button,#topfill').show();
		this.menusEnabled = true;
	
    }
    else{
    
    	$('#close_drop,.close-button,#topfill').hide();
		this.menusEnabled = false;
    }
 	
},
init: function() {
    var that = this;
    
    window.URL = window.URL || window.webkitURL;
	this.container = document.getElementById( 'canvas' );
	document.body.appendChild( that.container );
	
	this.vplaylist.push( 'vid/wavves-1280x720-2500kbps.mp4' ); 
	
	this.videoInput.load();
	this.videoInput.loop = true;
	
	this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 20000 );
	this.camera.position.z = 3600;
	
	
	this.scene = new THREE.Scene();	
	
	this.texture = new THREE.Texture( that.videoInput );
	this.texture.minFilter = THREE.LinearFilter;
	this.texture.magFilter = THREE.LinearFilter;
	this.texture.format = THREE.RGBFormat;
	this.texture.generateMipmaps = true;
	
	
	this.videoMaterial = new THREE.ShaderMaterial( {
	    uniforms: {
	        "tDiffuse": { type: "t", value: that.texture },
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
	this.videoMaterial.renderToScreen = true;
	this.videoMaterial.wireframe = false;
	this.geometry = new THREE.PlaneGeometry(640, 360, 640, 360);
	this.geometry.overdraw = false;
	this.geometry.dynamic = true;
	this.geometry.verticesNeedUpdate = true;
	
	this.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
	this.mesh.doubleSided = true;
	this.mesh.position.x = 0;
	this.mesh.position.y = 0;
	this.mesh.visible = true;
	this.mesh.scale.x = this.mesh.scale.y = 6.0;
	
	this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.renderer.autoClear = false;
	this.container.appendChild( that.renderer.domElement );
	
	// postprocessing
	this.composer = new THREE.EffectComposer( that.renderer );
	
	this.renderModel = new THREE.RenderPass( that.scene, that.camera );
	this.composer.addPass( that.renderModel );	
	
	this.effectBloom = new THREE.BloomPass( 3.3, 20, 4.0, 256 );
	this.composer.addPass( that.effectBloom );
	
	this.effectHue = new THREE.ShaderPass( THREE.HueSaturationShader  );
	this.effectHue.renderToScreen = true;
	this.effectHue.uniforms[ 'hue' ].value = 0.0;
	this.effectHue.uniforms[ 'saturation' ].value = 0.0;
	this.composer.addPass( that.effectHue );
	
	
	if (Modernizr.filesystem) {
	this.dropZone.context = this;
	this.readFiles.context = this;
	this.dropZoneVideo.context = this;
	this.readFilesVideo.context = this;
	
	this.dropZone.addEventListener('dragover', that.handleDragOver, false);
	this.dropZone.ondrop = function(evt){
		that.handleFileSelect(evt,'audio',that);
	}
	this.readFiles.onmousedown = function(evt){
		that.readFileSelect(evt,'audio');
		$('#read_files').fadeOut(1000);
	} 
	this.dropZoneVideo.addEventListener('dragover', that.handleDragOver, false);	
	this.dropZoneVideo.ondrop = function(evt){
		that.handleFileSelect(evt,'video',that);
	}
	this.readFilesVideo.onmousedown = function(evt){
		that.readFileSelect(evt,'video');
		$('#read_video').fadeOut(1000);
	}
	} 
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	window.requestFileSystem  =  window.requestFileSystem || window.webkitRequestFileSystem; 
	}

	this.light = new THREE.SpotLight(0xffffff);
	this.light.position.set( 0, 0, 1000 ).normalize();
	this.light.target = this.mesh;
	//light.shadowCameraVisible = true;
	//light.shadowDarkness = 0.25;
	this.light.intensity = 1200;
	this.light.castShadow = true;
	this.scene.add( that.light );
		
	this.directionalLightFill = new THREE.SpotLight(0xffffff);
	this.directionalLightFill.position.set(0, 0, -1000).normalize();
	this.directionalLightFill.target = this.mesh;

	this.directionalLightFill.intensity = 1200;
	this.directionalLightFill.castShadow = true;
	this.scene.add(that.directionalLightFill);
	

	this.mesh.position.z = this.scene.position.z;
	this.scene.add( that.mesh );
			
	this.pointTo = 0;
	
	if (Modernizr.getusermedia) {
		 $('header h2').text('Click "allow" to start webcam.');
		  setTimeout(function(){
		     $('header h2').text('Drag and drop up to 1GB of web audio and video to the playlists.');
		    setTimeout(function(){
				 $('header h2').text('Control the distortion.');
				 $('header h2').next('a').text('Watch the video to learn more').attr('href','http://kineticvideo.co/info/synth-early-alpha-available-now/');
					if(that.controls === false){
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
		        that.videoInput.mozSrcObject = stream;
		    } 
		    else {
		        var vendorURL = window.URL || window.webkitURL;
		        that.webcamEnabled = true;
		        that.videoObject = vendorURL.createObjectURL(stream);
				that.videoInput.src = that.videoObject;
		    }
		
		
		    
		}, function(error) {
		    prompt.innerHTML = 'Unable to capture WebCam. Please reload the page or try with Google Chrome.';
		});
	}
	else{
		$('header h2').text('Synth requires WebRTC & HTML5 Filesystem. Try it out with Google Chrome.');
	}
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
	document.addEventListener( 'mousemove', that.onDocumentMouseMove, false );
	function onWindowResize() {

	that.windowHalfX = window.innerWidth / 2;
	that.windowHalfY = window.innerHeight / 2;

	that.camera.aspect = window.innerWidth / window.innerHeight;
	that.camera.updateProjectionMatrix();

	that.renderer.setSize( window.innerWidth, window.innerHeight );
	that.composer.reset();

	}
	window.addEventListener( 'resize', onWindowResize, false );
	keypress.combo("1", function() {
	   that.playVideo(0);
    });
    keypress.combo("2", function() {
       that.playVideo(1);
    });
    keypress.combo("3", function() {
       that.playVideo(2);
    });
    keypress.combo("4", function() {
      that.playVideo(3);
    });
    keypress.combo("5", function() {
       that.playVideo(4);
    });
    keypress.combo("6", function() {
       that.playVideo(5);
    });
    keypress.combo("7", function() {
       that.playVideo(6);
    });
    keypress.combo("8", function() {
       that.playVideo(7);
    });
    keypress.combo("9", function() {
       that.playVideo(8);
    });
    keypress.combo("0", function() {
       that.onToggleWebcam(that);
    });
    keypress.combo("l", function() {
       if(that.videoInput.loop == false){
       that.videoInput.loop = true;
       }
       else{
	   that.videoInput.loop = false;    
       }
    });
    var mouseView = true;

    keypress.combo("x", function() {
      if(that.menusEnabled === true){
       if($('#close_drop').not('.active')){
	        $('#close_drop').trigger('click');
       }
       if($('.close-button').not('.active')){
	        $('.close-button').trigger('click');
       }
      }
       
    });
    keypress.combo("m", function() {
      
		  that.onToggleMenus();
       
    });
	$('.close-button').on('click',function(){
		if(that.controls === false){
		that.controls = true;
		$('.close-button').addClass('active');
		}
		else{
		that.controls = false;	
		$('.close-button').removeClass('active');
		}
	});
	if(that.webcamEnabled === false){
		that.playVideo(0);
	}
	
	that.initComplete = true;
	animate();
	
    function animate() {
	  requestAnimationFrame( animate );
	  that.render();	
	}
	
	
},
checkLoad: function() {
		var that = this;
        if (that.videoInput.readyState === 4) {
           that.init();
           animate();
        } else {
            setTimeout(that.checkLoad, 100);
        }
},
playAudio: function(playlistId){
		var that = this;
    	this.audioisplaying = false;
    	this.audioInput.pause();
    	this.audioInput.remove();
    	this.audioInput = that.container.appendChild(document.createElement("audio"));
    	if($('#close_drop').is('.active')){
	    	$('audio').hide();
    	}
    	else{
	    	$('audio').show();
    	}
    	
    	this.audioInput.id = 'audio';
    	this.audioInput.controls = true;
		this.audioInput.src = this.aplaylist[playlistId];  
		this.dancer.after( 0, function() {
			// After 0s, let's get this real and map a frequency to displacement of mesh
			// Note that the instance of dancer is bound to "this"
			that.bass = this.getFrequency( 140 ) * 100;
			that.mid = this.getFrequency( 210 ) * 100;
			that.treble = this.getFrequency( 460 ) * 100;
			
		}).load( that.audioInput );		
		this.audioInput.play();
		this.dancer.play();
		this.audioisplaying = true; 
		$('#playlist').children('li').css('background-color','rgba(10,10,10,0.7)');
	    $('#playlist').children('li').eq(playlistId).css('background-color','rgba(10,10,10,0.9)');
},	
continueAudioPlay: function(context){
		var that = context;
		
		that.audioInput.current++;
		var playlist = that.aplaylist;
		var length = that.aplaylist.length;
		if(that.audioInput.current == length){
		    that.audioInput.current = 0;
		    that.playAudio(that.audioInput.current);
		}
		else{
		    that.playAudio(that.audioInput.current);
		}
		console.log(that.audioInput.current);
},
continueVideoPlay: function(context){
		var that = context;
		console.log(that);
		that.videoInput.current++;
		var playlist = that.vplaylist;
		var length = that.vplaylist.length;
		if(that.videoInput.current == length){
		    that.videoInput.current = 0;
		    that.playVideo(that.videoInput.current);
		}
		else{
		    that.playVideo(that.videoInput.current);
		}
},
playVideo: function(playlistId){
		//var that = Synth.prototype;
		var that = this;
    	//this.currentVideo = this.videoInput.current = playlistId;	  	  		
    	this.videoInput.pause();
    	this.videoisplaying = false;
		this.videoInput.src = this.vplaylist[playlistId];
		this.videoInput.muted = true;
		this.videoInput.play();
		this.videoisplaying = true; 
		$('#videoplaylist').children('li').css('background-color','rgba(10,10,10,0.7)');
	    $('#videoplaylist').children('li').eq(playlistId).css('background-color','rgba(10,10,10,0.9)');
},
toArray:function(list) {
  return Array.prototype.slice.call(list || [], 0);
},
errorHandler: function(err){
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
},
defaultVideo: function(url){
						//vplaylist.push( url ); 
				   	  	var that = this;
				   	  	var li = document.createElement('li');
				   	  	var name = 'waves.mp4';
				   	  	var correctName = 'waves.mp4';
				   	  	if(correctName.length > 30) correctName = correctName.substring(0,30);
				   	  	li.innerHTML = ['<a class="track" href="#" data-href="',url,
				   	  	                  '" data-title="', correctName, '">', correctName, '</a>'].join('');
				   	  	document.getElementById('videoplaylist').insertBefore(li, null);
				   	  	
				   	  	var nodeList = Array.prototype.slice.call( document.getElementById('videoplaylist').children );
				   	  	var index = nodeList.indexOf( 0 ); 
				   	  	
				   	  	li.onclick=function(){
				   	  		that.videoInput.current = 0;
				   	  		that.playVideo(0);
				   	  		
				   	  		that.videoInput.addEventListener('ended', that.continueVideoPlay, false);
				   	  		$('#close_drop').trigger('click');
				   	  	}
},
listResults: function(entries,type,context) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  var fragment = document.createDocumentFragment();
  var that = context;
  function entryClickListener(index){
  						if(type === 'video'){
				   	  		context.playVideo(index);				   	  		
				  
				   	  		context.videoInput.onended = function(){
					   	  		context.continueVideoPlay(context);
				   	  		}
				   	  	}
				   	  	if(type === 'audio'){
				   	  		context.playAudio(index);
				   	  		
				   	  		context.audioInput.onended = function(){
					   	  		context.continueAudioPlay(context);
				   	  		}
				   	  			
				   	  	}
				   	  	$('#close_drop').trigger('click');
  }
  function entryListener(entry,playlist){
	  playlist.push( entry.toURL() ); 
	  console.log(playlist);
  }
  entries.forEach(function(entry, i) { 

				   	  	var li = document.createElement('li');
				   	  	var name = unescape(entry.name);
				   	  	var correctName = unescape(entry.name);
				   	  	if(correctName.length > 30) correctName = correctName.substring(0,30);
				   	  	li.innerHTML = ['<a class="track" href="#" data-href="',entry.toURL(),
				   	  	                  '" data-title="', correctName, '">', correctName, '</a>'].join('');
				   	  	if(type === 'video'){
				   	 	 	entryListener(entry,context.vplaylist);
				   	 	 	document.getElementById('videoplaylist').insertBefore(li, null);
				   	 	 	var nodeList = Array.prototype.slice.call( document.getElementById('videoplaylist').children );
				   	  	}
  				   	  	if(type === 'audio'){
  				   	 	 	entryListener(entry,context.aplaylist);
  				   	 	 	document.getElementById('playlist').insertBefore(li, null);
				   	 	 	var nodeList = Array.prototype.slice.call( document.getElementById('playlist').children );
  				   	  	}				   	  	
				   	  	var index = nodeList.indexOf( li ); // +1 to compensate for webcam in 0 slot
				   	  	li.onclick = function(){
				   	  	   entryClickListener(index);
				   	  	};
  });
  if(type === 'video'){
  document.querySelector('#videoplaylist').appendChild(fragment);
  
  }
  if(type === 'audio'){
  document.querySelector('#playlist').appendChild(fragment);
  
  }
  //$('#video_drop').css('background', 'transparent');
  //$('#read_video').fadeOut(1000);
},
readFileSelect: function(evt,type) {

	evt.stopPropagation();
    evt.preventDefault();
	var that = evt.target.context;

	window.requestFileSystem(window.TEMPORARY, 800*1024*1024, function(fs) {
	
				
		fs.root.getDirectory(type, {}, function(dirEntry){		
		var dirReader = dirEntry.createReader();
		var entries = [];

		var readEntries = function() {
		   dirReader.readEntries (function(results) {
		    if (!results.length) {
		   	
		   	that.listResults(entries.sort(),type,evt.target.context);

		    } else {
		      entries = entries.concat(evt.target.context.toArray(results));
		      readEntries();
		    }
		  }, evt.target.context.errorHandler);
		};
		
		readEntries(); // Start reading dirs.


		});
  
   });
},
handleFileSelect: function(evt,type,context) {
    evt.stopPropagation();
    evt.preventDefault();
    var that = context;
	var files = evt.dataTransfer.files;
	function loadEndHandler(context,fileEntry){
						if(type === 'video'){
		  				context.vplaylist.push( fileEntry.toURL() ); 
		  				
		  				}
		  				if(type === 'audio'){
		  				context.aplaylist.push( fileEntry.toURL() ); 
		  				}
		  				context.readFileSelect(evt,type);
	}
	window.requestFileSystem(window.TEMPORARY, 800*1024*1024, function(fs) {
	    fs.root.getDirectory(type, {create: true}, function(dirEntry) {

		}, that.errorHandler);
	    for (var i = 0, file; file = files[i]; ++i) {
	      (function(f) {
	        fs.root.getFile('/'+type+'/'+f.name, {create: true, exclusive: true}, function(fileEntry) {
	          	  fileEntry.createWriter(function(fileWriter) {
	          		  fileWriter.write(f); 
	          	  }, that.errorHandler);
	          
	              fileEntry.file(function(file) {
			   	  var reader = new FileReader();
			   	
			   	  reader.onloadend = function(e) {
		
				   	 loadEndHandler(context,fileEntry);
				   	 				   	   
				  	
				   	  	var li = document.createElement('li');
				   	  	var name = unescape(fileEntry.name);
				   	  	var correctName = unescape(fileEntry.name);
				   	  	if(correctName.length > 30) correctName = correctName.substring(0,30);
				   	  	li.innerHTML = ['<a class="track" href="#" data-href="',fileEntry.toURL(),
				   	  	                  '" data-title="', correctName, '">', correctName, '</a>'].join('');
				   	  if(type === 'video'){
				   	  	document.getElementById('videoplaylist').insertBefore(li, null);
				   	  	var nodeList = Array.prototype.slice.call( document.getElementById('videoplaylist').children );
				   	  	var index = nodeList.indexOf( li );
				   	  	li.onclick=function(){
				   	  		that.playVideo(index);
				   	  		$('#close_drop').trigger('click');
				   	  	}
				   	  }
				   	  if(type === 'audio'){
				   	  	document.getElementById('playlist').insertBefore(li, null);
				   	  	var nodeList = Array.prototype.slice.call( document.getElementById('playlist').children );
				   	  	var index = nodeList.indexOf( li );
				   	  	li.onclick=function(){
				   	  		that.playAudio(index);
				   	  		$('#close_drop').trigger('click');
				   	  	}
				   	  }

	
			   	  };   	
			   	  reader.readAsDataURL(file);
			   	}, that.errorHandler);

	        }, that.errorHandler);
			   	
	      })(file);
	    }
		//$('header h2').text('Change controls to achieve stunning new looks.');
	    $('header').delay(8000).fadeOut(2000);	    
	});	
},
handleDragOver: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
},
audioChange: function(){
	if(this.guiSetup===true && this.audioisplaying===true){
	this.bass = this.getFrequency( 140 ) * 100;
    this.mid = this.getFrequency( 210 ) * 100;
    this.treble = this.getFrequency( 460 ) * 100;
    }
},
onParamsChange: function(){
 	var that = this;
 	
	that.mesh.scale.x = that.mesh.scale.y = parseFloat(that.scale);
	
	that.mousex = that.mouseX;   
	that.mousey = that.mouseY;
	
	that.camera.position.x = parseFloat(that.camerax);
	that.camera.position.y = parseFloat(that.cameray);
	that.camera.position.z = parseFloat(that.cameraz);
	
	that.videoMaterial.uniforms[ "displace" ].value = that.displace;
	that.videoMaterial.uniforms[ "multiplier" ].value = that.multiplier;
	that.videoMaterial.uniforms[ "opacity" ].value =  parseFloat(that.transparency);
	that.videoMaterial.uniforms[ "originX" ].value =  parseFloat(that.originX);
	that.videoMaterial.uniforms[ "originY" ].value =  parseFloat(that.originY);
	that.videoMaterial.uniforms[ "originZ" ].value =  parseFloat(that.originZ);


	that.effectHue.uniforms[ 'hue' ].value = that.hue;
	that.effectHue.uniforms[ 'saturation' ].value = that.saturation;
	
	//that.hex = that.background;	
	$('#canvas').css( 'background-color', that.hex );	
	var newhex = parseInt(that.hex.replace('#','0x'));
	that.renderer.setClearColor( newhex , 1.0 );
	
	that.pointer[0] = that.bass;
	that.pointer[1] = that.mid;
	that.pointer[2] = that.treble;
	that.pointer[3] = that.mousex;
	that.pointer[4] = that.mousey;
	
	for(var i=0; i<=4; i++){
	
	eval(that.setting[i]);
	
	}
},
meshChange: function(shape){
		var that = this;
		that.scene.remove(that.mesh);
		that.shape = shape;
		that.geometry.verticesNeedUpdate = false;
		that.geometry.dynamic = false;
		console.log(shape);
		switch (shape)
		{
		case 'plane':
		 		 	that.geometry = new THREE.PlaneGeometry(360, 180, 360, 180);
		 		 	that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		 		 
		break;
		
		case 'sphere':
		 			that.geometry = new THREE.SphereGeometry(360, 360, 360);
		 			that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		 		
		break;
		  
		case 'cube':
					that.geometry = new THREE.CubeGeometry(120, 120, 120, 120, 120, 120);
					that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		break;
		
		case 'cylinder':
					that.geometry = new THREE.CylinderGeometry( that.scale, that.scale, 240, 360, 240, false );
					that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		break;
		
		case 'torus':
					that.geometry = new THREE.TorusGeometry( that.scale, 360, 360, 360 );
					that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		break;
		 
		default:
		  			that.geometry = new THREE.PlaneGeometry(640, 360, 640, 360);
		  			that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		
		}

		that.geometry.dynamic = true;
		that.geometry.verticesNeedUpdate = true;
		that.mesh.doubleSided = true;
		that.mesh.position.x = that.mesh.position.y = that.mesh.position.z = 0;
		that.mesh.scale.x = that.mesh.scale.y = that.scale;	
		that.shape = shape;
		that.scene.add(that.mesh);	
},
onDocumentMouseMove: function(event) {

	this.mouseX = ( event.clientX - this.windowHalfX );
	this.mouseY = ( event.clientY - this.windowHalfY ) * 0.3;

},
render: function() {
	var that = this;
	if ( this.videoInput.readyState === this.videoInput.HAVE_ENOUGH_DATA ) {
		if ( this.texture ) this.texture.needsUpdate = true;
		if ( this.videoMaterial ) this.videoMaterial.needsUpdate = true;
	}	
	this.camera.lookAt( that.scene.position );	
	this.onParamsChange();
	//renderer.clear();
	this.composer.render();

}
} // end prototype

