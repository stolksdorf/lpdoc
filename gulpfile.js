
var recoil = require("recoil");
var gulp = require("gulp");

var gulp = recoil.tasks(gulp, {
	entryPoints: ["./client/lpdoc"],
	DEV: true,
	buildPath: "./build/",

	pageTemplate: "./client/template.hbs",

	projectModules: [],
	assetExts: ["*.svg", "*.png", "*.jpg", "*.pdf", "*.ico", "*.bmp", '*.ttf'],

	serverWatchPaths: ["server"],
	serverScript: "./server.js",

	cdn: {
		"react": ["window.React", "<script src='//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react-with-addons.js'></script>"],
		"jquery": ["window.jQuery", "<script src='//code.jquery.com/jquery-1.11.0.min.js'></script>"],
		"underscore": ["window._", "<script src='//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js'></script>"],
		"moment": ["window.moment", "<script src='//cdnjs.cloudflare.com/ajax/libs/moment.js/2.7.0/moment.min.js'></script>"],
	},
	libs: [],
});
