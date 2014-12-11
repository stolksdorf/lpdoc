var express = require("express");
var recoil = require('recoil');
var app = express();

require('node-jsx').install();

app.use(express.static('./build'));



app.get("*", function (req, res) {
	recoil.render({
		page: './build/lpdoc/bundle.hbs',
		initialProps: {
			url: req.originalUrl
		},
	}, function (err, page) {
		return res.send(page)
	});
});


app.listen(8000);
console.log('Listening on 8000');