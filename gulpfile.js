var vitreumTasks = require("vitreum/tasks");
var gulp = require("gulp");
var runSequence = require('run-sequence').use(gulp);


var gulp = vitreumTasks(gulp, {
	entryPoints: [
		'./client/lpdoc',
	],

	DEV: true,
	buildPath: "./build/",
	pageTemplate: "./client/template.dot",
	projectModules: ["./shared/lpdoc"],
	additionalRequirePaths : ['./shared', './node_modules'],
	assetExts: ["*.svg", "*.png", "*.jpg", "*.pdf", "*.eot", "*.otf", "*.woff", "*.woff2", "*.ico", "*.ttf", "*.gif"],
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

gulp.task('sprites', () => {
	gulp.src('./sprites/*.png')
		.pipe(gulp.dest('./build/sprites'));

})

gulp.task('full', (cb) => {
	runSequence('prod', 'sprites', cb);
})
