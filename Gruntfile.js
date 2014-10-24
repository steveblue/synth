module.exports = function(grunt) {
  grunt.initConfig({
  watch: {
      js: {
        files: ['js/*.js'],
        tasks: ['jsbeautifier','concat','uglify'],
        options: {
          livereload: true,
        }
      },
      css: {
        files: ['scss/*.scss'],
        tasks: ['compass','cmq','cssmin'],
        options: {
          livereload: true,
        }
      }
    },
    sass: {
    dist: {
      files: [{
        expand: true,
        cwd: 'scss',
        src: ['*.scss'],
        dest: 'css',
        ext: '.css',
      }],
    }
  },
    compass: {
     dist: {
       options: {
         config: 'config.rb'
       }
     }
    },
    cmq: {
      options: {
        log: true
      },
      your_target: {
        files: {
          'css': ['css/style.css']
        }
      }
    },
    jsbeautifier: {
      files: ['js/*.js'],
      options: {
          js: {
              braceStyle: "collapse",
              breakChainedMethods: false,
              e4x: false,
              evalCode: false,
              indentChar: " ",
              indentLevel: 0,
              indentSize: 2,
              indentWithTabs: false,
              jslintHappy: false,
              keepArrayIndentation: false,
              keepFunctionIndentation: false,
              maxPreserveNewlines: 10,
              preserveNewlines: true,
              spaceBeforeConditional: true,
              spaceInParen: false,
              unescapeStrings: false,
              wrapLineLength: 0
          }
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'js/libs/jquery.min.js',
          'js/libs/jquery.ui.min.js',
          'js/libs/jquery.ui.touch-punch.js',
          'js/libs/modernizr.custom.js',
          'js/libs/res.min.js',
          'js/libs/three.min.js',
          'js/libs/dancer.js',
          'js/libs/keypress-2.0.3.min.js',
          'js/Detector.js',
          'js/modifiers/ExplodeModifier.js',
          'js/shaders/RuttShader.js',
          'js/shaders/HueSaturationShader.js',
          'js/shaders/ConvolutionShader.js',
          'js/shaders/CopyShader.js',
          'js/postprocessing/EffectComposer.js',
          'js/postprocessing/RenderPass.js',
          'js/postprocessing/MaskPass.js',
          'js/postprocessing/BloomPass.js',
          'js/postprocessing/HueSaturationPass.js',
          'js/postprocessing/ShaderPass.js',
          'js/synth.js'],
        dest: 'js/dist/synth.js',
      },
    },
    uglify: {
      options: {
        mangle: false,
        sourceMap: true,
        sourceMapName: 'js/dist/synth.min.map'
      },
      my_target: {
        files: {
          'js/dist/synth.min.js': ['js/dist/synth.js']
        }
     }
    },
    prettysass: {
    options: {
       alphabetize: false,
       indent: 2
    },
    your_target: {
      src: ['scss/**/*.scss']
     },
  },
  cssmin: {
  combine: {
      files: {
        'css/style.min.css': ['css/style.css']
      }
    }
  }

  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-prettysass');
  grunt.loadNpmTasks('grunt-combine-media-queries');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['compass', 'watch']);
};
