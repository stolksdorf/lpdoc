var express = require("express");
var app = express();
var fs = require('fs');
app.use(express.static(__dirname + '/build'));

app.get("*", function (req, res) {
	return res.send(fs.readFileSync('./build/lpdoc/index.html', 'utf8'));
});

app.listen(5000);
