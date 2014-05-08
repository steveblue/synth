/*synth v185*/
if ( ! Detector.webgl ) { Detector.addGetWebGLMessage(); } else {

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
	this.hex;	
	this.controls = false;	
	this.gui;
	this.pointer = [];
	this.pointTo = 0;
	this.setting = [];
	this.guiSetup = false;	
	this.f1;
	this.f2;
	this.f3;
	this.f4;
	this.f5;
	this.guiContainer;
	this.params = function() {
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
		this.opacity = 0.2;
		this.originX = 0.0;
		this.originY = 0.0;
		this.originZ = -2000.0;
		this.hue = 0.0;
		this.saturation = 0.5;
		this.background = '#090000';
		this.webcam = false;		
		that.pointer.push(this.bass);
		that.pointer.push(this.mid);
		that.pointer.push(this.treble);
		that.pointer.push(this.mousex);
		that.pointer.push(this.mousey);		
		that.setting.push('');
		that.setting.push('');
		that.setting.push('');
		that.setting.push('');
		that.setting.push('');		
	};
	this.synthParams = new this.params();
}

Synth.prototype = {

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
	//texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	//texture.repeat.set( 720, 480 );
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
	
	

	this.guiContainer = document.getElementById('gui_container');
	var guiContainer = this.guiContainer;
	$.getJSON( "default.json", function( response ) {	
	
	that.gui = new dat.GUI({load: response, preset: 'Default', autoPlace: false});
	that.gui.remember(that.synthParams);
	that.gui.revert();
	var gui = that.gui;
	that.f1 = that.gui.addFolder('Audio');
	that.f1.add(that.synthParams, 'bass', 0.0,1.0).step(0.01).listen().name("Bass").onChange(that.audioChange);
	that.f1.add(that.synthParams, 'mid', 0.0,1.0).step(0.01).listen().name("Mid").onChange(that.audioChange);
	that.f1.add(that.synthParams, 'treble', 0.0,1.0).step(0.01).listen().name("Treble").onChange(that.audioChange);
	that.f1.open();	
	
	that.f2 = that.gui.addFolder('Mouse');
	that.f2.add(that.synthParams, 'mousex', -960.0,960.0).step(1.0).listen().name("Mouse X").onChange(that.onParamsChange);
	that.f2.add(that.synthParams, 'mousey', -540.0,540.0).step(1.0).listen().name("Mouse Y").onChange(that.onParamsChange);
	that.f2.open();	
	
	that.f3 = that.gui.addFolder('Camera');
	that.f3.add(that.synthParams, 'cameraz', -3600.0,3600.0).step(10.0).listen().name("Zoom").onChange(that.onParamsChange);
	that.f3.add(that.synthParams, 'camerax', -3600.0,3600.0).step(10.0).listen().name("Camera X").onChange(that.onParamsChange);
	that.f3.add(that.synthParams, 'cameray', -3600.0,3600.0).step(10.0).listen().name("Camera Y").onChange(that.onParamsChange);
	that.f3.open();
	
	that.f4 = that.gui.addFolder('Synthesizer');
	that.f4.add(that.synthParams, 'displace', -100.0, 100.0).step(0.1).listen().name("Displace").onChange(that.onParamsChange);
	that.f4.add(that.synthParams, 'multiplier', -100.0, 100.0).step(0.1).name("Amplify").listen().onChange(that.onParamsChange);
	that.f4.add(that.synthParams, 'originX', -2000.0, 2000.0).step(1.0).listen().name("Distort X").onChange(that.onParamsChange);
	that.f4.add(that.synthParams, 'originY', -2000.0, 2000.0).step(1.0).listen().name("Distort Y").onChange(that.onParamsChange);
	that.f4.add(that.synthParams, 'originZ', -2000.0, 2000.0).step(1.0).listen().name("Distort Z").onChange(that.onParamsChange);
	that.f4.add(that.synthParams, 'opacity', 0.0,1.0).step(0.01).listen().name("Opacity").onChange(that.onParamsChange);
	that.f4.add(that.synthParams, 'hue', 0.0,360.0).step(0.1).name("Hue").onChange(that.onParamsChange);
	that.f4.add(that.synthParams, 'saturation', -1.0,0.87).step(0.01).name("Saturation").onChange(that.onParamsChange);
	that.f4.addColor(that.synthParams, 'background').name("Background Color").onChange(that.onParamsChange);
	that.f4.open();	
	
	that.f5 = that.gui.addFolder('Geometry');
	that.f5.add(that.synthParams, 'shape', [ 'plane', 'sphere', 'cube', 'cylinder', 'torus' ] ).listen().name("Shape").onChange(function(){that.meshChange(that)});
	that.f5.add(that.synthParams, 'scale', 0.1, 20.0).step(0.1).listen().name("Scale").onChange(that.onParamsChange);
	that.f5.add(that.synthParams, 'wireframe').onChange(function(){that.onToggleWireframe(that)});
	that.f5.add(that.synthParams, 'webcam').onChange(function(){that.onToggleWebcam(that)});
	that.f5.open();
	
	that.gui.close();
	that.guiContainer.appendChild(gui.domElement);
	that.guiSetup = true;
	
	$('.property-name').on('click',function() {
		console.log($(this).text());
		if($(this).text() === 'Bass') {
			that.pointer[0] = that.synthParams.bass;
			that.pointTo = 0;
			console.log(that.pointer[0]);

		}
		if($(this).text() === 'Mid') {
			that.pointer[1] = that.synthParams.mid;
			that.pointTo = 1;
			console.log(that.pointer[1]);

		}
		if($(this).text() === 'Treble') {
			that.pointer[2] = that.synthParams.treble;
			that.pointTo = 2;
			console.log(that.pointer[2]);

		}
		if($(this).text() === 'Mouse X') {
			that.pointer[3] = that.mouseX;
			that.pointTo = 3;
			console.log(that.pointer[3]);
	
		}
		if($(this).text() === 'Mouse Y') {
			that.pointer[4] = that.mouseY;
			that.pointTo = 4;
			console.log(that.pointer[4]);
		
		}
		if($(this).text() === 'Zoom') {	
			that.setting[that.pointTo] = 'that.synthParams.cameraz = that.pointer[i] * 4';	
		//	synthParams.cameraz = setting[pointTo];
		}
		if($(this).text() === 'Camera X') {
			that.setting[that.pointTo] = 'that.synthParams.camerax = that.pointer[i] * 2';	
			//synthParams.camerax = setting[pointTo];
		}
		if($(this).text() === 'Camera Y') {
			that.setting[that.pointTo] = 'that.synthParams.cameray = that.pointer[i] * 10';
			//synthParams.cameray = setting[pointTo];
		}
		if($(this).text() === 'Displace') {
			that.setting[that.pointTo] = 'that.synthParams.displace = that.pointer[i] * 100';
			//synthParams.displace = setting[pointTo];
		}
		if($(this).text() === 'Amplify') {
			that.setting[pointTo] = 'that.that.synthParams.multiplier = that.pointer[i] * 100';
			//synthParams.multiplier = setting[pointTo];
		}
		if($(this).text() === 'Distort X') {
			that.setting[pointTo] = 'that.synthParams.originX = that.pointer[i] * 100';
			//synthParams.originX = setting[pointTo];
		}
		if($(this).text() === 'Distort Y') {
			that.setting[pointTo] = 'that.synthParams.originY = that.pointer[i] * 100';
			//synthParams.originY = setting[pointTo];
		}
		if($(this).text() === 'Distort Z') {
			that.setting[pointTo] = 'that.synthParams.originZ = that.pointer[i]';
			//synthParams.originZ = setting[pointTo];	
		}
		if($(this).text() === 'Opacity') {
			that.setting[pointTo] = 'that.synthParams.opacity = that.pointer[i]';
			//synthParams.opacity = setting[pointTo];
		}
		if( $(this).text() === 'Scale' || $(this).text() === 'X Dimension' || $(this).text() === 'Y Dimension' || $(this).text() === 'Z Dimension' || $(this).text() === 'X Segments' || $(this).text() === 'Y Segments' || $(this).text() === 'Z Segments' ) {
		}
		 
		if( !$(this).hasClass('active') ){
		$(this).addClass('active');
		$(this).parent('div').children('.c').children('.slider').prepend('<div class="cancel" data-pointer="'+that.pointTo+'"></div>');
		}
		$(this).parent('div').children('.c').children('.slider').children('.cancel').on('click',function(){	
		
	
			that.setting[ $(this).data('pointer') ] = "";
				
			
			$(this).parent('li').children('div:first-child').children('.property-name').removeClass('active');
			$(this).remove();
	
		});
	
		
		
	});
	
	
	
	});
	//this.checkLoad();
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
	//directionalLightFill.shadowCameraVisible = true;
	//directionalLightFill.shadowDarkness = 0.25;
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
			that.synthParams.bass = this.getFrequency( 140 ) * 100;
			that.synthParams.mid = this.getFrequency( 210 ) * 100;
			that.synthParams.treble = this.getFrequency( 460 ) * 100;
			
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
	this.synthParams.bass = this.getFrequency( 140 ) * 100;
    this.synthParams.mid = this.getFrequency( 210 ) * 100;
    this.synthParams.treble = this.getFrequency( 460 ) * 100;
    }
},
onParamsChange: function(){
 	var that = this;

if(this.guiSetup===true){

	that.mesh.scale.x = that.mesh.scale.y = parseFloat(that.synthParams.scale);
	
	that.synthParams.mousex = that.mouseX;   
	that.synthParams.mousey = that.mouseY;
	
	that.camera.position.x = parseFloat(that.synthParams.camerax);
	that.camera.position.y = parseFloat(that.synthParams.cameray);
	that.camera.position.z = parseFloat(that.synthParams.cameraz);
	
	that.videoMaterial.uniforms[ "displace" ].value = that.synthParams.displace;
	that.videoMaterial.uniforms[ "multiplier" ].value = that.synthParams.multiplier;
	that.videoMaterial.uniforms[ "opacity" ].value =  parseFloat(that.synthParams.opacity);
	that.videoMaterial.uniforms[ "originX" ].value =  parseFloat(that.synthParams.originX);
	that.videoMaterial.uniforms[ "originY" ].value =  parseFloat(that.synthParams.originY);
	that.videoMaterial.uniforms[ "originZ" ].value =  parseFloat(that.synthParams.originZ);


	that.effectHue.uniforms[ 'hue' ].value = that.synthParams.hue;
	that.effectHue.uniforms[ 'saturation' ].value = that.synthParams.saturation;
	
	$('#canvas').css( 'background-color', that.synthParams.background );
	that.hex = that.synthParams.background;
	that.hex = parseInt(that.hex.replace('#','0x'));
	that.renderer.setClearColor( that.hex , 1.0 );
	
	that.pointer[0] = that.synthParams.bass;
	that.pointer[1] = that.synthParams.mid;
	that.pointer[2] = that.synthParams.treble;
	that.pointer[3] = that.synthParams.mousex;
	that.pointer[4] = that.synthParams.mousey;
	
	for(var i=0; i<=4; i++){
	
	eval(that.setting[i]);
	
	}
	var gui = that.gui;
	for (var i in gui.__controllers) {
	  gui.__controllers[i].updateDisplay();
	}
	
}
	

},
meshChange: function(context){
		var that = context;
		that.scene.remove(that.mesh);
		var shape = that.synthParams.shape;
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
					that.geometry = new THREE.CylinderGeometry( that.synthParams.scale, that.synthParams.scale, 240, 360, 240, false );
					that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		break;
		
		case 'torus':
					that.geometry = new THREE.TorusGeometry( that.synthParams.scale, 360, 360, 360 );
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
		that.mesh.scale.x = that.mesh.scale.y = that.synthParams.scale;	
		that.synthParams.shape = shape;
		that.scene.add(that.mesh);	
},
onToggleWireframe: function(context) {
  var that = this;
  if( that.synthParams.wireframe === false && that.videoMaterial.wireframe === false ){
    	
    	that.videoMaterial.wireframe = true;

    	
    }
   else{
    
	  	that.videoMaterial.wireframe = false;

    }	
},
onToggleWebcam: function(context) {
	var that = context;
    if( that.webcamEnabled === false  ){
    	
		that.videoInput.src = that.videoObject;
		that.webcamEnabled = true;
		that.synthParams.webcam = true; 

	
    }
    else{
    	
    	that.playVideo(that.currentVideo);
    	that.webcamEnabled = false;
    	that.synthParams.webcam = false; 
	    	
    }   	
},
onToggleMenus: function() {
	var that = this;
    if( that.menusEnabled === false  ){
    	
		$('#close_drop,.close-button,#topfill').show();
		that.menusEnabled = true;
	
    }
    else{
    
    	$('#close_drop,.close-button,#topfill').hide();
		that.menusEnabled = false;
    }
 	
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

},

animate: function(){
		
		requestAnimationFrame( animate );
		this.render();
}


} // end prototype

var s = new Synth();
	s.defaultVideo('vid/wavves-1280x720-2500kbps.mp4');
	s.init();
	function animate() {
		requestAnimationFrame( animate );
		s.render();	
	}
} // end else for webgl detection