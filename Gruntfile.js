module.exports = function( grunt ) {

  grunt.initConfig({

    uglify : {
      options : {
        mangle : false
      },

      my_target : {
        files : {
          'public/app/controller.js' : [ 'public/app/controller/BrowseCtrl.js',
                                         'public/app/controller/LogoutCtrl.js',
                                         'public/app/controller/LogSigCtrl.js',
                                         'public/app/controller/MenuCtrl.js',
                                         'public/app/controller/NotificationCtrl.js',
                                         'public/app/controller/PlayerCtrl.js',
                                         'public/app/controller/PodcastCtrl.js',
                                         'public/app/controller/PodcastsCtrl.js',
                                         'public/app/controller/StackCtrl.js' ],
          'public/app/app.min.js': ['public/app/app.js']
        }
      }
    } // uglify

  });


  // Plugins do Grunt
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );


  // Tarefas que serão executadas
  grunt.registerTask( 'default', [ 'uglify' ] );

};
