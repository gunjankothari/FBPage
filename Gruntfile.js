module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> Assignment by LS. <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'dist/app.js',
        dest: 'dist/app.min.js'
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['js/helper/listener.js', 'js/helper/common.js', 'js/helper/model.js', 'js/helper/view.js', 'js/helper/collectionView.js', 'js/app.js'],
        //src: ['js/**/*.js'],
        dest: 'dist/app.js',
      },
    },
    watch: {
      scripts: {
        files: ['js/app.js'],
        tasks: ['default']
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat','uglify']);
  grunt.registerTask('watch', ['watch']);

};