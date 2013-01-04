module.exports = function(grunt) {
    "use strict";
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-css');

    grunt.initConfig({
        jsbeautifier: {
            files: ['<config:lint.files>']
        },
        lint: {
            files: ['./*js', './src/js/Userscript.js', './src/js/Helper.js', './dist/*.js', './package.json', './test/*.js'],
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: false,
                immed: true,
                latedef: true,
                newcap: false,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true,
                expr: true,
                strict: false
            },
            globals: {
                describe: false,
                it: false,
                document: false,
                $: false,
                GM_getResourceText: false
            }
        },
        csslint: {
            base_theme: {
                src: ['./src/css/*.css'],
                rules: {
                    "import": false,
                    "overqualified-elements": 0, // 0 disable, 2 error, 1 is probably warning
                    "ids": false,
                    "important": false,
                    "adjoining-classes": false,
                    "qualified-headings": false,
                    "box-model": false,
                    "font-sizes": false
                }
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'default'
        }
    });
    // Default task.
    grunt.registerTask('default', 'jsbeautifier lint csslint');
};