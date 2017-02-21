var mongoose = require('mongoose');

var podcastSchema = new mongoose.Schema({
	srcId: String,
	feedUrl: String,
	title: String,
	image: String,
	source: String,
	views: Number,
	verified: {type: Boolean, default: false},
	lastUpdate: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Podcast', podcastSchema);
