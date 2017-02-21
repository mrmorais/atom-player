var express = require('express');
var route = express.Router();

var mongoose = require('mongoose');
var config = require('../config');

var podcastSchema = require('../models/Podcast');
var podcast = mongoose.model('Podcast', podcastSchema);

route.get("/", function(req, res) {
	res.render('index');
});

route.get("/share/:id", function(req, res) {
	var id = req.params.id;

	podcast.findOne({srcId: id}).exec(function(err, doc) {
		if(!doc) {
			res.end("Podcast não encontrado");
		} else {
			res.render("share", {
				srcId: id,
				title: doc.title,
				image: doc.image
			});
		}
	});
});

route.get("/download/chrome", function(req, res) {
	res.render("download/chrome");
});

route.get("/page/terms", function(req, res) {
	res.render("terms");
});

route.get("/page/licenses", function(req, res) {
	res.render("licenses");
});

module.exports = route;
