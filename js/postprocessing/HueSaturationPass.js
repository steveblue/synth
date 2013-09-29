/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.HueSaturationPass = function ( hue, saturation ) {

	if ( THREE.HueSaturationPass === undefined )
		console.error( "THREE.HueSaturationPass relies on THREE.HueSaturationShader" );

	var shader = THREE.HueSaturationShader;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( hue !== undefined ) this.uniforms[ "hue" ].value = hue;
	if ( saturation !== undefined ) this.uniforms[ "saturation" ].value = saturation;

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;

};

THREE.HueSaturationPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ "hue" ].value = THREE.HueSaturationPass.hue;
		this.uniforms[ "saturation" ].value = THREE.HueSaturationPass.saturation;
		//this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

		THREE.EffectComposer.quad.material = this.material;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );


	}

};
