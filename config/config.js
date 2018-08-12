var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
const fs = require('fs');

module.exports = function() {
	var app = express();
    var portNumber = process.env.PORT || 8080;

	app.set('view engine','ejs');
	app.set('views','./app/views');
	app.set('trust proxy', 1);
    app.set('portNumber',portNumber);
	app.set('fs',fs);
	app.use(express.static('./app/public'));
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(expressValidator());

    consign({cwd: 'app'})
		.include('drivers')
        .then('models')
	    .then('controllers')
	    .into(app);
    app.use(function(req,res,next){
			res.status(404).render('errors/404');
			next();
	});

	app.use(function(error, req,res,next){
		next(error);
	});

    return app;
}
