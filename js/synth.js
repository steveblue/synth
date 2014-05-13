/*synth v185*/
var Synth = function(control,cam) {	
	var that = this;
	this.control = control;
	this.cam = cam;
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
	this.audiostream = [];
	this.dancer = new Dancer();		
	this.dropZone = document.getElementById('drop_zone');
	this.readFiles = document.getElementById('read_files');  
	this.dropZoneVideo = document.getElementById('video_drop');
	this.readFilesVideo = document.getElementById('read_video');	
	this.initComplete = false;
	this.webcamEnabled = false;
	this.menusEnabled = true;
	this.hex = '#000000';	
	this.controls = false;	
	this.gui;
	this.pointer = [];
	this.setting = [];
	this.trigger = null;
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
	this.guiContainer;		
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);	
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.pointer.push(0);
	this.setting.current = 0;			
//	this.setting.push('');
//	this.setting.push('');
//	this.setting.push('');
//	this.setting.push('');
//	this.setting.push('');	
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
get oX(){
	return this.originX;
},
set oX(pos){
	this.cameraX = parseFloat(pos);
},
get oY(){
	return this.originY;
},
set oY(pos){
	this.originY = parseFloat(pos);
},
get oZ(){
	return this.originZ;
},
set oZ(pos){
	this.originZ = parseFloat(pos);
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
get camX(){
	return this.camera.position.x;
},
set camX(pos){
	this.camerax = this.camera.position.x = parseFloat(pos);
},
get camY(){
	return this.camera.position.y;
},
set camY(pos){
	this.cameray = this.camera.position.y = parseFloat(pos);
},
get camZ(){
	return this.camera.position.y;
},
set camZ(pos){
	this.cameraz = this.camera.position.z = parseFloat(pos);
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
    	
		$('#close_drop,#gui_drop,.close-button,#topfill').show();
		this.menusEnabled = true;
	
    }
    else{
    
    	$('#close_drop,#gui_drop,.close-button,#topfill').hide();
		this.menusEnabled = false;
    }
 	
},
init: function() {
    var that = this;
    
    window.URL = window.URL || window.webkitURL;
	this.container = document.getElementById( 'canvas' );
	document.body.appendChild( that.container );
	

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

	
	function onWindowResize() {

	that.camera.aspect = window.innerWidth / window.innerHeight;
	that.camera.updateProjectionMatrix();

	that.renderer.setSize( window.innerWidth, window.innerHeight );
	that.composer.reset();

	}
	window.addEventListener( 'resize', onWindowResize, false );
	
	if(this.control === true){	
	this.initControls();
	}
	if(this.cam === true){	
	this.initWebcam();
	}
	
	that.initComplete = true;
	
	animate();
	
    function animate() {
	  requestAnimationFrame( animate );
	  that.render();	
	}
	
	
},
initWebcam: function(){
	var that = this;
	if (Modernizr.getusermedia) {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
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
		   $('header h2').text('Unable to capture WebCam. Please reload the page or try with Google Chrome.');
		});
	}
	else{
		$('header h2').text('Synth requires WebRTC & HTML5 Filesystem. Try it out with Google Chrome.');
	}

	if(that.webcamEnabled === false){
		that.playVideo(0);
	}
},
convertToRange: function(value, srcRange, dstRange){
	  // value is outside source range return
	  if (value < srcRange[0] || value > srcRange[1]){
	    return NaN; 
	  }
	
	  var srcMax = parseFloat(srcRange[1]) - parseFloat(srcRange[0]),
	      dstMax = parseFloat(dstRange[1]) - parseFloat(dstRange[0]),
	      adjValue = parseFloat(value) - parseFloat(srcRange[0]);
	
	  return (parseFloat(adjValue) * parseFloat(dstMax) / parseFloat(srcMax)) + parseFloat(dstRange[0]);
	
},
convertTo3dCoords: function(x,y,w,h,m) {
 
        var nx = m * x / w - 1;
        var ny = - m * y / h + 1;
		console.log( nx + ' ' + ny );

       return {
       		x: nx,
       		y: ny       
       }
     
		
},
initControls: function(){
	var that = this;
 //   var canvas = document.getElementById('bgpicker').getContext('2d');	
 //   $('#bgpicker').width($(this).parent('width'));
 //	$('#bgpicker').height($(this).parent('width'));
 //   var img = new Image();
 //	img.src = 'img/hue.jpg';
 //	
 //	
 //	$(img).load(function(){
 //		canvas.drawImage(img,0,0,40,$('#bgpicker').height());
 //	});
    
    $('#gui_container').show(); //make more dynamic
	$('#container').show();
   
   
   	// http://www.javascripter.net/faq/rgbtohex.htm
	function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
	function toHex(n) {
	  n = parseInt(n,10);
	  if (isNaN(n)) return "00";
	  n = Math.max(0,Math.min(n,255));
	  return "0123456789ABCDEF".charAt((n-n%16)/16)  + "0123456789ABCDEF".charAt(n%16);
	}
    	

	
	function updateValue(obj,val){
	
				obj.html(val);
				
				console.log(val);
		
	}
	var value, value2, round, start, end, width, height, control, key1, key2, json, coords;

	$('.xy').draggable({ 
		containment: "parent",
		start: function() {
			key1 =  $(this).data('key1');
			key2 =  $(this).data('key2');
			value = $(this).data('value');
		   	start =  $(this).data('start');
		   	width = $(this).parent('.wrapper').parent('.joystick').width();
		   	height = $(this).parent('.wrapper').parent('.joystick').height();
		   	end = $(this).data('end');
	
		},
		drag: function() {
			   control = $(this).position();
			   if(control.top < height && control.top > 0 ){
			 		 value = that.convertToRange(control.top, [0,height], [start,end]);
			 		 
			 	  //	 value = value.toString();
			 		// json = '{ "'+key1+'" : '+value+' }';
			 		// console.log('that.'+key1+'='+value+'');
			 		 // eval('that.'+key1+'='+value+'');	
			 		

			  }
			  if(control.left < width && control.left > 0){
			  	 value2 = that.convertToRange(control.left, [0,width], [start,end]);
			  	 //json = '{ "'+key2+'" : '+value2+' }';
			  	 // console.log('that.'+key2+'='+value2+'');
			  	 // eval('that.'+key2+'='+value+'');
			  }	
			   coords = that.convertTo3dCoords(value,value2,window.innerWidth,window.innerHeight,$(this).data('multiply'));
			   eval('that.'+key1+'='+coords.x+'');
			   eval('that.'+key2+'='+coords.y+'');	
			   
			   console.log(	'that.'+key1+'='+coords.x+'' + 'that.'+key2+'='+coords.y+'');
			 
				  	 
		},
		stop: function() {
			   control = $(this).position();
			   if(control.top < height && control.top > 0 ){
			 		 value = that.convertToRange(control.top, [0,height], [start,end]);
			 	//	 json = '{ "'+key1+'" : '+value+' }';
			 			
			  }
			  if(control.left < width && control.left > 0){
			  	 value2 = that.convertToRange(control.left, [0,width], [start,end]);
			  	 //json = '{ "'+key2+'" : '+value2+' }';
			  }	
			   coords = that.convertTo3dCoords(value,value2,window.innerWidth,window.innerHeight,$(this).data('multiply'));
			   eval('that.'+key1+'='+coords.x+'');
			   eval('that.'+key2+'='+coords.y+'');	
			  
			
		}
	});
	var scale,posX,posY;
    // pinch to zoom goes here
    $('.vert').on('click',function(){
       var control;
       $(this).parent('.wrapper').parent('.fader').addClass('input');
	   if(that.trigger = true){
		   control = $(this).position();
		   control.top = that.setting.current;
	   } 
    });
	$('.vert').draggable({ 
		axis: "y", 
		containment: "parent",
		start: function() {
			key =  $(this).data('key');
			value = $(this).data('value');
		   	start =  $(this).data('start');
		   	width = $(this).parent('.wrapper').parent('.fader').height() - $(this).height();
		   	end = $(this).data('end');
		},
		drag: function() {
			  control = $(this).position();
			  if(control.top < width && control.top >= 0){
			 		 value = that.convertToRange(control.top, [0,width], [start,end]);
			 		// round = Math.round(value);
			 		 //round = round.toString();
			 		 json = '{ "'+key+'" : '+value+' }';
			 		// console.log('that.'+key+'='+value+'');
			 		 eval('that.'+key+'='+value+'');

			  }
		},
		stop: function() {
			 control = $(this).position();
			 value = that.convertToRange(control.top, [0,width], [start,end]);
			// round = Math.round(value);
			// round = round.toString();
				   	json = '{ "'+key+'" : '+value+' }';
					// console.log('that.'+key+'='+value+'');
			 		 eval('that.'+key+'='+value+'');

		}
	});

////	$('#bgpicker').click(function(event){
////	  // getting user coordinates
////	  var x = event.pageX - this.offsetLeft;
////	  var y = event.pageY - this.offsetTop;
////	  // getting image data and RGB values
////	  var img_data = canvas.getImageData(x, y, 1, 1).data;
////	  var R = img_data[0];
////	  var G = img_data[1];
////	  var B = img_data[2];  
////	  var rgb = R + ',' + G + ',' + B;
////	  console.log(rgb);
////	  // convert RGB to HEX
////	  var hex = rgbToHex(R,G,B);
////	  var key = 'hex';
////	  // making the color the value of the input
////	 // $('#rgb input').val(rgb);
////	 // $('#hex input').val('#' + hex);
////	  console.log('that.'+key+'='+'"#'+hex+'"');
////	  eval('that.'+key+'='+'"#'+hex+'"');
////	});
	$('.hor').draggable({ 
		axis: "x", 
		containment: "parent",
		start: function() {
			key =  $(this).data('key');
			value = $(this).data('value');
		   	start =  $(this).data('start');
		   	width = $(this).parent('.wrapper').parent('.fader').width() - $(this).height();
		   	end = $(this).data('end');
		},
		drag: function() {
			  control = $(this).position();
			  if(control.left < width && control.left >= 0){
			 		 value = that.convertToRange(control.left, [0,width], [start,end]);
			 		 //round = Math.round(value);
			 		 //round = round.toString();
			 		 json = '{ "'+key+'" : '+value+' }';
			 		// console.log('that.'+key+'='+value+'');
			 		 eval('that.'+key+'='+value+'');

			  }
		},
		stop: function() {
			  control = $(this).position();
			  if(control.left < width && control.left >= 0){
			 		 value = that.convertToRange(control.left, [0,width], [start,end]);
			 		// round = Math.round(value);
			 		 //round = round.toString();
			 		 json = '{ "'+key+'" : '+value+' }';
			 		// console.log('that.'+key+'='+value+'');
			 		 eval('that.'+key+'='+value+'');

			  }
		}
	});
	
	$('.toggle.model').on('click',function(){
		
		if(!$(this).hasClass('active')){
		
			$('.toggle.model').removeClass('active');
			$(this).addClass('active');
			console.log("that.model='"+$(this).children('control').data('key')+"'");
			eval("that.model='"+$(this).children('control').data('key')+"'");
			
		}
	
		
		
	});
	$('.toggle.wire').on('click',function(){
		
		if(!$(this).hasClass('active')){
		
			
			$(this).addClass('active');
			eval("that.wire = true");
			
		}
		else{
			$(this).removeClass('active');
			eval("that.wire = false");
		}
	
		
		
	});	
	
	$('.bars li').on('click',function(){
		if(!$(this).hasClass('controller') && that.audioisplaying===true){
		that.trigger = true;
		eval(that.setting.current = $(this).index());
		that.setting.push($(this).index());
		console.log(that.setting);	
		$(this).attr('data-index',that.setting.length);
		setTimeout(function(){
			that.trigger = false;
		},5000);
		$(this).addClass('controller');
		}
		else{
		$(this).removeClass('controller');	
		}
	});
	$('.control').on('click',function(){
			if(that.trigger === true && !$(this).hasClass('controller')){
				$(this).css('top',that.pointer[that.setting.current]+'px');
				console.log('top',that.pointer[that.setting.current]+'px');
				$(this).attr('data-index',that.setting.current);
				$(this).addClass('controlled');
				$(this).parent().prepend('<div class="close red"></div>');
				$(this).parent().children('.close').on('click',function(){
					$(this).parent().children('.control').removeClass('controlled');
					$('.bars li:eq('+$(this).parent().children('.control').data("index")+')').removeClass('controller');
					$(this).remove();
				});

			}

	});
	$(document).on('click',function(){
		that.trigger = false;
	});
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
	 
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	window.requestFileSystem  =  window.requestFileSystem || window.webkitRequestFileSystem; 
	}
	

		$('<div id="close_drop"><p>Close Playlist</p></div>').insertAfter('audio');
		$('<div id="gui_drop"><p>Close Controls</p></div>').insertBefore('#container');
	
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
			    $('audio').css('top','318px');
				$(this).css('top', '298px');
				$(this).children('p').text('Close Playlist');
			}
		});
		
	    $('#gui_drop').on('click',function(){
			$(this).toggleClass('active');
			$('header').fadeOut(8000);
			if($(this).is('.active')){
				$('#container').hide();
				$(this).css('bottom', '0px');
				$(this).children('p').text('Open Controls');
			}
			else if($(this).not('.active')){
			    $('#container').show();
				$(this).css('bottom', '33%');
				$(this).children('p').text('Close Controls');
			}
		});
	}
	else{
		$('#close_drop,#video_drop,#drop_zone,audio').hide();
	}	
	
	
	document.addEventListener( 'mousemove', that.onDocumentMouseMove, false );
	
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
       that.webcam('true')
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
        $('#close_drop').trigger('click');
	    $('#gui_drop').trigger('click');
       
    });
    keypress.combo("m", function() {
      
      	if(that.menu = true){
		  that.menu(false);
		  }
		  else{
		  that.menu(true);  
		  }
       
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

			that.audiostream[0] = Math.round(this.getFrequency( 30 )*600);
			that.audiostream[1] = Math.round(this.getFrequency( 60 )*600);
			that.audiostream[2] = Math.round(this.getFrequency( 90 )*600);
			that.audiostream[3] = Math.round(this.getFrequency( 120 )*600);
			that.audiostream[4] = Math.round(this.getFrequency( 150 )*600);
			that.audiostream[5] = Math.round(this.getFrequency( 180 )*600);
			that.audiostream[6] = Math.round(this.getFrequency( 210 )*600);
			that.audiostream[7] = Math.round(this.getFrequency( 240 )*600);
			that.audiostream[8] = Math.round(this.getFrequency( 270 )*600);
			that.audiostream[9] = Math.round(this.getFrequency( 300 )*600);												
			that.audiostream[10] = Math.round(this.getFrequency( 330 )*600);

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
				   	  	
				   	  	this.vplaylist.push( url ); 	
				   	  	this.videoInput.load();
				   	  	this.videoInput.loop = true;
	
	
				   	  	var li = document.createElement('li');
				   	  	var name = 'default-video.mp4';
				   	  	var correctName = 'default-video.mp4';
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
	 // console.log(playlist);
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
		  				that.vplaylist.push( fileEntry.toURL() ); 
		  				
		  				}
		  				if(type === 'audio'){
		  				that.aplaylist.push( fileEntry.toURL() ); 
		  				}
		  				that.readFileSelect(evt,type);
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
		$('header h2').text('Change controls to achieve stunning new looks.');
	    $('header').delay(8000).fadeOut(2000);	    
	});	
},
handleDragOver: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
},
paramsChange: function(){
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
	
	if(that.audioisplaying === true){
	$('.in1').css('height',that.audiostream[0]+'%');
	eval(that.pointer[$('.in1').index()] = $('.in1').height());
	$('.in2').css('height',that.audiostream[1]+'%');
	eval(that.pointer[$('.in2').index()] = $('.in2').height());
	$('.in3').css('height',that.audiostream[2]+'%');
	eval(that.pointer[$('.in3').index()] = $('.in3').height());
	$('.in4').css('height',that.audiostream[3]+'%');
	eval(that.pointer[$('.in4').index()] = $('.in4').height());
	$('.in5').css('height',that.audiostream[4]+'%');
	eval(that.pointer[$('.in5').index()] = $('.in5').height());
	$('.in6').css('height',that.audiostream[5]+'%');
	eval(that.pointer[$('.in6').index()] = $('.in6').height());
	$('.in7').css('height',that.audiostream[6]+'%');
	eval(that.pointer[$('.in7').index()] = $('.in7').height());
	$('.in8').css('height',that.audiostream[7]+'%');
	eval(that.pointer[$('.in8').index()] = $('.in8').height());
	$('.in9').css('height',that.audiostream[8]+'%');
	eval(that.pointer[$('.in9').index()] = $('.in9').height());
	$('.in10').css('height',that.audiostream[9]+'%');
	eval(that.pointer[$('.in10').index()] = $('.in10').height());
	$('.control.controlled').each(function(){
		
		var control = $(this).position();
		control.top = $('.bars li:eq('+$(this).data('index')+')').height();		
		var value = that.convertToRange(control.top, [0,$(this).parent('.wrapper').parent('.fader').height() - $(this).height()], [$(this).data('start'),$(this).data('end')]);
		var key = $(this).data('key');
		eval('that.'+key+'='+value+'');
		
	});
	}
	 
//	that.pointer[0] = that.bass;
//	that.pointer[1] = that.mid;
//	that.pointer[2] = that.treble;
//	that.pointer[3] = that.mousex;
//	that.pointer[4] = that.mousey;
	
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
		 		 	that.geometry = new THREE.PlaneGeometry(640, 360, 640, 360);
		 		 	that.mesh = new THREE.Mesh( that.geometry, that.videoMaterial );
		 		 
		break;
		
		case 'sphere':
		 			that.geometry = new THREE.SphereGeometry(120, 120, 120);
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
	this.paramsChange();
	//renderer.clear();
	this.composer.render();
}
} // end prototype

