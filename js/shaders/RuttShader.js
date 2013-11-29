

    
    RuttEtraShader = {
    
    	uniforms: {
		
    		"tDiffuse": { type: "t", value: null },
    		"multiplier":  { type: "f", value: 13.3 },
    		"displace":  { type: "f", value: 7.3 },
    		"opacity":  { type: "f", value: 1.0 },
			"originX":  { type: "f", value: 0.0 },
			"originY":  { type: "f", value: 0.0 },
			"originZ":  { type: "f", value: 0.0 }

    	},
    	
    
    
    	vertexShader: [
    
    	'uniform sampler2D tDiffuse;',
        'varying vec3 vColor;',
        'varying vec2 vUv;',
        'uniform float displace;',
		'uniform float multiplier;',
		'uniform float originX;',
		'uniform float originY;',
		'uniform float originZ;',
		
        'void main() {',
            'vec4 newVertexPos;',
            'vec4 dv;',
            'float df;',
    		'vUv = uv;',
    		'vec3 origin = vec3 (originX,originY,originZ);',
            'dv = texture2D( tDiffuse, vUv.xy );',
            'df = multiplier*dv.x + multiplier*dv.y + multiplier*dv.z;',
            'newVertexPos = vec4( normalize(position - origin) * df * vec3 (1.0, 1.0, displace), 0.0 ) + vec4( position, 1.0 );', 
            'vColor = vec3( dv.x, dv.y, dv.z );',
			
            'gl_Position = projectionMatrix * modelViewMatrix * newVertexPos;',
        '}'
    
    	].join("\n"),
    
    	fragmentShader: [
    			
		'varying vec3 vColor;',
		'uniform float opacity;',

		  'void main() {',
		 
		      'gl_FragColor = vec4( vColor.rgb, opacity );',
		  '}'
    
    	].join("\n")
    
    };
