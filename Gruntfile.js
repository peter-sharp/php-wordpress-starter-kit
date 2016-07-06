/* global grunt, module, console, require*/
var fs = require('fs');


module.exports = function (grunt) {
    /* global grunt, module, console, require*/
    'use strict';
    //===========================================================================
    // settings
    //===========================================================================
    // To support SASS/SCSS or Stylus, just install
    // the appropriate grunt package and it will be automatically included
    // in the build process, Sass is included by default:
    //
    // * for SASS/SCSS support, run `npm install --save-dev grunt-contrib-sass`
    // * for Stylus/Nib support, `npm install --save-dev grunt-contrib-stylus`
    var publicDir = 'html';

    var npmDependencies = require('./package.json').devDependencies;
    var hasSass = npmDependencies['grunt-sass'] !== undefined;
    var hasLess = npmDependencies['grunt-contrib-less'] !== undefined;
    var hasStylus = npmDependencies['grunt-contrib-stylus'] !== undefined;

    // TODO
    hasLess = false;

    var filePaths = {
        theme: 'wp-content/themes/vintage-portfolio/',
        contactForm: 'wp-content/plugins/contact-form/',
        mediaLibrary: 'wp-content/plugins/media-library/'
    };

    // generates a css output path relative to the source
    function genStylePath(dest, src) {

      var ext = this.ext;
      var cwd = this.cwd;

      var srcPath =     src.split('/').slice(0, -2);
      var srcFile =     src.split('/').slice(-1);

      var srcFileName = srcFile[0].split('.')[0];

      // if main theme style file
      if( srcFileName === 'style' ) {
        var newLocation = __dirname + '/'+ cwd + '/' + srcPath.join('/') + '/' + srcFileName + ext;
      } else {
        var newLocation = __dirname + '/'+ cwd + '/' + srcPath.join('/') + '/'+ dest + '/' + srcFileName + ext;
      }

      console.log('compiling to location:', newLocation );
      try {
        fs.accessSync(newLocation, fs.F_OK);

      } catch (e) {
        console.log( newLocation + " not found");
      }



      return newLocation;
    }

    //===========================================================================
    // Project configuration.
    //===========================================================================
    var config = {
      pkg: grunt.file.readJSON('package.json'),
      publicDir: publicDir,
      webpackBasePath: './html/wp-content/plugins/wedding-tools/includes/js/',
      webpack: {
          rsvpApp: {
            entry: "<%= webpackBasePath %>/rsvp-app/source/app.js",
            output: {
              path: "<%= webpackBasePath %>/rsvp-app/",
              filename: "rsvp-app.js"
            }
          }
        },
      less: {
        dev: {
          files: {
            src : ['**/less/**/*.less', '!**/less/**/_*.less', '!**/node_modules/**/less/**/*.less'],
            cwd : '<%= publicDir %>',
            dest : 'css',
            ext : '.css',
            rename: genStylePath,
            expand : true
          }
        }
      },
      // generate various image sizes
      responsive_images: {
        thumbNails: {
          options: {
            sizes: [{
              name: 'thumb',
              width: '200'
            }]
          }
        },
        files: {
          expand: true,
          src: ['content/**.{jpg,png}'],
          cwd: './app/img/',
          dest: 'thumbs/'
        }
      },
      // compile svg icons into icon stylesheets
      grunticon: {
        vintageIcons: {
          options: {
          },
          files: [{
            expand: true,
            src: ['*.svg', '*.png']
          }]
        }
      },
      // JsHint your javascript
      jshint : {
        all : ['js/*.js', '!js/modernizr.js', '!js/*.min.js', '!js/vendor/**/*.js'],
        options : {
          browser: true,
          curly: false,
          eqeqeq: false,
          eqnull: true,
          expr: true,
          immed: true,
          newcap: true,
          noarg: true,
          smarttabs: true,
          sub: true,
          undef: false
        }
      },

      // Dev and production build for sass
      sass : {
        production : {
          files : [
            {
              src : ['**/scss/**/*.scss', '!**/scss/**/_*.scss'],
              cwd : '<%= publicDir %>/**/scss',
              dest : '<%= publicDir %>/**/css',
              ext : '.css',
              expand : true
            }
          ],
          options : {
            sourcemap: 'auto',
            style : 'compressed'
          }
        },
        dev : {
          files : [
            {
              src : ['**/scss/**/*.scss', '!**/scss/**/_*.scss', '!**/node_modules/**/scss/**/*.scss'],
              cwd : '<%= publicDir %>',
              dest : 'css',
              ext : '.css',
              rename: genStylePath,
              expand : true
            }
          ],
          options : {
            sourcemap: 'auto',
            style : 'expanded'
          }
        }
      },

      // Dev and production build for stylus
      stylus : {
        production : {
          files : [
            {
              src : ['**/*.styl', '!**/_*.styl'],
              cwd : 'stylus',
              dest : 'css',
              ext: '.css',
              expand : true
            }
          ],
          options : {
            compress : true
          }
        },
        dev : {
          files : [
            {
              src : ['**/*.styl', '!**/_*.styl'],
              cwd : 'stylus',
              dest : 'css',
              ext: '.css',
              expand : true
            }
          ],
          options : {
            compress : false
          }
        },
      },

      // Bower task sets up require config
      bower : {
        all : {
          rjsConfig : 'js/global.js'
        }
      },

      // Require config
      requirejs : {
        production : {
          options : {
            name : 'global',
            baseUrl : 'js',
            mainConfigFile : 'js/global.js',
            out : 'js/optimized.min.js'
          }
        }
      },

      // Image min
      imagemin : {
        production : {
          files : [
            {
              expand: true,
              cwd: 'images',
              src: '**/*.{png,jpg,jpeg}',
              dest: 'images'
            }
          ]
        }
      },

      // SVG min
      svgmin: {
        production : {
          files: [
            {
              expand: true,
              cwd: 'images',
              src: '**/*.svg',
              dest: 'images'
            }
          ]
        }
      },

      // copies bower files to correct directories
      bowercopy: {
         options: {
             // Task-specific options go here
             clean: false
         },
         vintage_portfolio: {
             // Target-specific file lists and/or options go here
            options: {
              destPrefix: '<%= publicDir %>/wp-content/themes/vintage-portfolio/js/vendor'
            },
            files: {
              'requirejs.js':                   'requirejs/require.js',
              'angular/angular-animate.min.js': 'angular-animate/angular-animate.min.js',
              'angular/angular-cookies.min.js': 'angular-cookies/angular-cookies.min.js',
              'angular/angular-resource.min.js':'angular-resource/angular-resource.min.js',
              'angular/angular-route.js':       'angular-route/angular-route.min.js',
              'angular/angular-ui-router.js':   'angular-ui-router/release/angular-ui-router.js'
            }
         },
         multimedia_plugin: {
             // Target-specific file lists and/or options go here
            options: {
              destPrefix: '<%= publicDir %>/wp-content/plugins/media-library/js/vendor'
            },
            files: {
              'requirejs.js':                           'requirejs/require.js',
              'angular/angular-masonry.min.js':         'angular-masonry/angular-masonry.js',
              'angular/masonry/jquery.bridget.js':      'jquery-bridget/jquery.bridget.js',
              'angular/masonry/get-style-property.js':  'get-style-property/get-style-property.js',
              'angular/masonry/get-size.js':            'get-size/get-size.js',
              'angular/masonry/EventEmitter.js':        'eventEmitter/EventEmitter.js',
              'angular/masonry/eventie.js':             'eventie/eventie.js',
              'angular/masonry/doc-ready.js':           'doc-ready/doc-ready.js',
              'angular/masonry/matches-selector.js':    'matches-selector/matches-selector.js',
              'angular/masonry/utils.js':               'fizzy-ui-utils/utils.js',
              'angular/masonry/item.js':                'outlayer/item.js',
              'angular/masonry/outlayer.js':            'outlayer/outlayer.js',
              'angular/masonry/masonry.js':             'masonry/masonry.js',
              'angular/masonry/imagesloaded.js':        'imagesloaded/imagesloaded.js'
            }
         },

      },
      // watches files for changes
      watch: {
        less: {
          files: ['**/less/**/*.less'],
          tasks: (hasLess) ? ['less:dev']: null,
          options: {
            spawn: false
          }
        },
        sass : {
          files : ['**/scss/**/*.scss', '!**/node_modules/**/scss/**/*.scss'],
          tasks : (hasSass) ? ['sass:dev'] : null
        },
        stylus : {
          files : ['**/stylus/**/*.styl'],
          tasks : (hasStylus) ? ['stylus:dev'] : null
        },
        css : {
          files : ['**/css/**/*.css'],
          options : {
            livereload : true
          }
        },
        js : {
          files : ['**/js/**/*.js', '!**/rsvp-app.js'],
          tasks : ['jshint', 'webpack'],
          options : {
            livereload : true
          }
        }
        // php : {
        //   files : ['**/*.php'],
        //   options : {
        //     livereload : true
        //   }
        // }
      }
    };

    // adding root paths to file locations
    config.grunticon.vintageIcons.files[0].cwd  = filePaths.theme + 'img/style/icons';
    config.grunticon.vintageIcons.files[0].dest  = filePaths.theme + 'img/style';
    grunt.initConfig(config);
    //===========================================================================
    // Tasks
    //===========================================================================


    // Default task
  	grunt.registerTask('default', ['preprocess-css','watch']);


  	// Build task
  	grunt.registerTask('build', function() {
  		var tasks = ['jshint'];

  		if (hasSass) {
  			tasks.push('sass:production');
  		}

  		if (hasStylus) {
  			tasks.push('stylus:production');
  		}
  		if (hasLess) {
  			tasks.push('less:production');
  		}

  		tasks.push('imagemin:production', 'svgmin:production', 'requirejs:production');

  		return grunt.task.run(tasks);
  	});

    // icons compile task
    grunt.registerTask('icon_compile', ['grunticon', 'preprocess-css']);

    //generate responsive images task
    grunt.registerTask('thumbnail', ['responsive_images']);

  	// preprocess-css
  	grunt.registerTask('preprocess-css', function() {
  		var tasks = [];

  		if (hasSass) {
  			tasks.push('sass:dev');
        console.log('sass task added');
  		}

  		if (hasStylus) {
  			tasks.push('stylus:dev');
        console.log('stylus task added');
  		}

  		if (hasLess) {
  			tasks.push('less:dev');
        console.log('less task added');
  		}


  		return grunt.task.run(tasks);
  	});
    console.log('adding setup task...');
  	// Template Setup Task
  	grunt.registerTask('setup', function() {
  		var tasks = ['bower-install'];

      tasks.push('bowercopy:multimedia_plugin');
  		tasks.push('bowercopy:vintage_portfolio');

      tasks.push('preprocess-css');
  		return grunt.task.run(tasks);
  	});

    // Run bower install
  	grunt.registerTask('bower-install', function() {
  		var done = this.async();
  		var bower = require('bower').commands;
  		bower.install().on('end', function(data) {
  			done();
  		}).on('data', function(data) {
  			console.log(data);
  		}).on('error', function(err) {
  			console.error(err);
  			done();
  		});
  	});

  	// Load up tasks
  	if (hasSass) {
  		grunt.loadNpmTasks('grunt-sass');
  	}

  	if (hasStylus) {
  		grunt.loadNpmTasks('grunt-contrib-stylus');
  	}
  	if (hasLess) {
  		grunt.loadNpmTasks('grunt-contrib-less');
  	}

    //grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //grunt.loadNpmTasks('grunt-grunticon');
    grunt.loadNpmTasks('grunt-webpack');
  	grunt.loadNpmTasks('grunt-contrib-jshint');
  	grunt.loadNpmTasks('grunt-bower-requirejs');
  	grunt.loadNpmTasks('grunt-bowercopy');
  	//grunt.loadNpmTasks('grunt-contrib-requirejs');
  	//grunt.loadNpmTasks('grunt-contrib-imagemin');
  	//grunt.loadNpmTasks('grunt-svgmin');

};
