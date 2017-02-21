var express = require('express');
var app = express();
var compression = require('compression');
var cors = require('cors');
var bodyparser = require('body-parser');
var device = require('express-device');

app.use(compression());
app.use(cors());

app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.set('view engine', 'ejs');
app.use(device.capture());

var home = require('./routers/home');
var api = require('./routers/api');

app.use('/', home);
app.use('/api', api);

app.get('/player*', function(req, res) {
	if(req.device.type !== "phone") {
		res.sendfile('./public/app/index.html');
	} else {
		res.render('no-mobile');
	}
});

app.use(function(req, res) {
	res.status(404);
	res.render('404');
});

app.listen(8080, function() {
	console.log("Express started at 8080");
});
