

    
    RuttEtraShader = {
    
    	uniforms: {
			"time": { type: "f", value: 0.0 },
    		"tDiffuse": { type: "t", value: null },
    		"lineTexture": { type: "t", value: null },
    		"multiplier":  { type: "f", value: 13.3 },
    		"displace":  { type: "f", value: 7.3 },
    		"opacity":  { type: "f", value: 1.0 },
			"grayscale":  { type: "i", value: 1 }
    	},
    	
    
    
    	vertexShader: [
    
    	'uniform sampler2D tDiffuse;',
        'varying vec3 vColor;',
        'varying vec2 vUv;',
        'uniform float displace;',
		'uniform float multiplier;',
		
        'void main() {',
            'vec4 newVertexPos;',
            'vec4 dv;',
            'float df;',
    		'vUv = uv;',
    		'vec3 origin = vec3 (0.0,0.0,-3000.0);',
            'dv = texture2D( tDiffuse, vUv.xy );',
            'df = multiplier*dv.x + multiplier*dv.y + multiplier*dv.z;',
            'newVertexPos = vec4( normalize(position - origin) * df * vec3 (1.0, 1.0, displace), 0.0 ) + vec4( position, 1.0 );', 
            'vColor = vec3( dv.x, dv.y, dv.z );',
			
            'gl_Position = projectionMatrix * modelViewMatrix * newVertexPos;',
        '}'
    
    	].join("\n"),
    
    	fragmentShader: [
    			
		'#ifdef GL_ES',
		'precision highp float;',
		'#endif',
		
		'uniform sampler2D tDiffuse;',
		'uniform sampler2D lineTexture;',
		
		'varying vec2 vUv;',
		
		'void main(void)',
		'{',
		    'vec3 c;',
		    'vec4 Ca = texture2D(lineTexture, vUv);',
		    'vec4 Cb = texture2D(tDiffuse, vUv);',
		    'c = Ca.rgb * Ca.a + Cb.rgb * Cb.a * (1.0 - Ca.a);',
		    'gl_FragColor= vec4(c, 1.0);',
		'}',
    
    	].join("\n")
    
    };
