"use strict";

var gulp = require('gulp');
var recoil = require("recoil");

gulp = recoil.tasks(gulp, {
    entryPoints: ["./client/developer", "./client/consumer" ],
    DEV: true,
    buildPath: "./build/",
    pageTemplate: "./client/template.hbs",
    configPath : 'emerald/config',

    iconsPath: "./icons",

    projectModules: ["./node_modules/emerald", "./node_modules/palette"],
    assetExts: ["*.svg", "*.png", "*.jpg", "*.pdf"],

    serverWatchPaths: ["server"],
    serverScript: "./bin/run.js",

    cdn: {
        "react-addons": ["window.React.addons", ""],
        "react": ["window.React", "<script src='//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react-with-addons.js'></script>"],
        "jquery": ["window.jQuery", "<script src='//code.jquery.com/jquery-1.11.0.min.js'></script>"],
        "underscore": ["window._", "<script src='//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js'></script>"],
        "isotope": ["window.Isotope", "<script src='//cdn.jsdelivr.net/isotope/2.0.0/isotope.pkgd.min.js'></script>"],
        "moment": ["window.moment", "<script src='//cdnjs.cloudflare.com/ajax/libs/moment.js/2.7.0/moment.min.js'></script>"],
        "lightbox2": ["window.lightbox", "<script src='//cdnjs.cloudflare.com/ajax/libs/lightbox2/2.7.1/js/lightbox.min.js'></script>"],
    },
    libs: [
        "async", "accounting", "url-pattern", "md5", "jwt-simple",
        "emerald/libs/chart"
    ],
});

