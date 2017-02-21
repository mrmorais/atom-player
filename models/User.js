var mongoose = require('mongoose');
var podcastSchema = require('./Podcast');

var userSchema = new mongoose.Schema({
	first_name: {type:String, default: null},
	last_name: {type:String, default: null},
	facebook_id: String,
	source: String,
	email: {type:String, default: null},
	pass: {type:String, default: null},
	podcasts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Podcast'
	}]
});

module.exports = mongoose.model('User', userSchema);
