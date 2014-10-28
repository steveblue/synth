Synth v.191


For news and changelog visit http://kineticvideo.co/info/

Play with the latest alpha build of Synth at http://kineticvideo.co


Webcam + Music + HTML5 + WebGL = Synth

Synth is a HTML5 video synthesizer that distorts 3d geometry with video and amplifies that distortion using audio.


Synth underwent a complete refactor with release v.185. Before this release, Synth was a proof of concept and used a modified dat.gui to control the interface. A whole new GUI was written from the ground up for this release. The core of Synth was completely rewritten and given a Prototypal architecture that allows the video synthesizer to be extended with greater ease. This allows anyone to create custom controllers for the 3D effects. I have included a default interface that in subsequent releases will be refined.

With version .185 Synth now utilizes a prototypal archtiecture that allows anyone familiar with Javscript to extend Synth much easier than before.


To use Synth, you must create a new Object that inherits the properties of the Synth.prototype.

```
var s = new Synth(document.getElementById( 'canvas' ),true,true,[{
        "camera": "0.0,-1130.0,1680.0",
        "shape": "plane",
        "detail": 480,
        "scale" : 10.0,
        "wireframe": false,
        "multiplier": 15.0,
        "displace": 3.3,
        "origin": "0,0,-2000.0",
        "opacity": 0.3,
        "hue": 0,
        "saturation": 0.7,
        "bgColor": "#000"
    }]);
```

Where the two attributes initialize the controls and optional webcam support, which by default is set to false.

Various properties of Synth can be set dynamically including container, control init, webcam init, shape, wireframe, scale, multiplier, displacement, opacity, hue, sat, and background color. In the example above, the default video is set with the defaultVideo method. Another example woud be to change the background color of Synth (which is currently not supported in the gui).

```
s.bgColor = '#FF0000';

```


To instantiate Synth, the source must currently follow strict conventions. Plans are in place to abstract the container and display properties of Synth. Would you like to see a feature or report a bug in Synth? Tweet to @iplayitofflegit.


Synth is a modern day Rutt Etra. After getting to use a Wobbulator at the Experimental Television Center, I became fascinated with the ethos behind Nam June Paik's work. I wanted to make something that was accessible for everyone, like how Paik's performances were accessible to anyone watching PBS. I don't see any sense in trying to reproduce the original aesthetic of the analog synthesizer in an Internet Browser. Synth is referential of the Analog synthesizers, but technically it it much different.  Synth distorts 3D geometries with a live video feed and then amplifies that distortion with audio. The current release is an alpha build of the project and over the next year Synth will gain more features as I continue to develop it. Anyone with Google Chrome and a webcam on a desktop computer can use this synthesizer. Synth is free and licensed under GNU.

