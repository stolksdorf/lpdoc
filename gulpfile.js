var vitreumTasks = require("vitreum/tasks");
var gulp = require("gulp");


var gulp = vitreumTasks(gulp, {
	entryPoints: [
		'./client/lpdoc',
	],

	DEV: true,
	buildPath: "./build/",
	pageTemplate: "./client/template.dot",
	projectModules: ["./shared/lpdoc"],
	additionalRequirePaths : ['./shared', './node_modules'],
	assetExts: ["*.svg", "*.png", "*.jpg", "*.pdf", "*.eot", "*.otf", "*.woff", "*.woff2", "*.ico", "*.ttf"],
	serverWatchPaths: ["server"],
	serverScript: "server.js",
	libs: [
		"react",
		"react-dom",
		"lodash",
		"classnames",
		"moment",
		"pico-flux"
	],
	clientLibs: [],
});

