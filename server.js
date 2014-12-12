var express = require("express");
//var recoil = require('recoil');
var app = express();
var fs = require('fs');
require('node-jsx').install();
app.use(express.static(__dirname + '/build'));




app.get("*", function (req, res) {
	return res.send(fs.readFileSync('./build/lpdoc/index.html', 'utf8'));
});

app.listen(8000);
console.log('Listening on 8000');