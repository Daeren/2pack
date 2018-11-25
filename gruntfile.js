//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

"use strict";

//-----------------------------------------------------

module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);
    require("time-grunt")(grunt);

    grunt.initConfig({
        wrap: {
            basic: {
                src: ["index.js"],
                dest: "build/2packES6.js",
                options: {
                    wrapper: [
                        "const packer = (function(module) {",
                        "return module.exports; })({});"
                    ]
                }
            }
        },

        babel: {
            options: {
                sourceMap: true,
                sourceMapTarget: "build/2pack.min.map",
                presets: ["es2015", "es2016", "es2017"]
            },
            dist: {
                files: {
                    "build/2pack.js": "build/2packES6.js"
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    "build/2pack.min.js": ["build/2pack.js"]
                }
            }
        }
    });

    grunt.registerTask("default", ["wrap", "babel", "uglify"]);
};