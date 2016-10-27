var express = require("express");
var app = express();
var fs = require('fs');
var vitreumRender = require('vitreum/render');
app.use(express.static(__dirname + '/build'));

const config = require('./lpdoc_config.json');

//Render Page
app.use((req, res) => {
	vitreumRender({
		page: './build/lpdoc/bundle.dot',
		globals:{

		},
		prerenderWith : './client/lpdoc/lpdoc.jsx',
		initialProps: {
			url: req.originalUrl,
			config : config,
			events : []
		},
		clearRequireCache : !process.env.PRODUCTION,
	}, (err, page) => {
		return res.send(page)
	});
});







app.listen(process.env.PORT || 8000);
console.log('Listening on port 8000');
