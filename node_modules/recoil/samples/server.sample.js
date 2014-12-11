app.get('*', function (req, res) {
	recoil.render({
		page: './build/developer/bundle.hbs',
		prerenderWith : './client/developer/developer.jsx',
		initialProps: {
			url: req.originalUrl,
			user : getUserFromReq(req)
		},
	}, function (err, page) {
		return res.send(page)
	});
});