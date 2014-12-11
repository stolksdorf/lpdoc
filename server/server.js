var fs      = require('fs'),
	_       = require('underscore'),
	express = express = require("express"),
	app     = express(),
	connect = require('connect'),
	renderJsx = require('lpdoc/renderJsx');

require('node-jsx').install();
app.use(connect.urlencoded())
app.use(connect.json())
app.use(express.static('./build'));

app.get('*', function(req, res){
	renderJsx({
		page          : './client/main.jsx',
		template      : './client/template.hbs',
		prerenderHtml : false,
		startProps    : {
			url : req.originalUrl
		},
		callback : function(pageHtml){
			return res.send(pageHtml)
		}
	});
});



module.exports = {
	app : app,
	start : function(){
		console.log('Listening on 8000');
		app.listen(8000);
	}
}