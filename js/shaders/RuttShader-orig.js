    
    RuttEtraShader = {
    
    	uniforms: {
    
    		"tDiffuse": { type: "t", value: null },
    		"opacity":  { type: "f", value: 1.0 }
    	},
    	
    
    
    	vertexShader: [
    
    	'uniform sampler2D tDiffuse;',
        'varying vec3 vColor;',
        "varying vec2 vUv;",
        
    
        'void main() {',
            'vec4 newVertexPos;',
            'vec4 dv;',
            'float df;',
    		"vUv = uv;",
            'dv = texture2D( tDiffuse, vUv.xy );',
            'df = 6.33*dv.x + 6.33*dv.y + 6.33*dv.z;',
            'newVertexPos = vec4( normalize( position ) * df * 1.2, 0.0 ) + vec4( position, 1.0 );', 
            'vColor = vec3( dv.x, dv.y, dv.z );',
    
            'gl_Position = projectionMatrix * modelViewMatrix * newVertexPos;',
        '}'
    
    	].join("\n"),
    
    	fragmentShader: [
    		
    	  'varying vec3 vColor;',

		  'void main() {',
		      'gl_FragColor = vec4( vColor.rgb, 1.0 );',
		  '}'
    		
    		
    
    	].join("\n")
    
    };
