var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var async = require("async");
var parsePodcast = require('node-podcast-parser');

var config = require('../config');
var api = express.Router();

var podcast = require('../models/Podcast');
var user = require('../models/User');

mongoose.connect(config.connection);

var search = "https://itunes.apple.com/search?entity=podcast&country=BR&limit=10&"; //encodeURIComponent()
var lookup = "https://itunes.apple.com/lookup/?id=";

api.get('/', function(req, res) {
	res.json({
		success: false,
		response: "Atom Player, man!"
	});
});

api.post('/search', function(req, res) {
	var query = req.body.query;
	query = encodeURIComponent(query);
	var url = search+"term="+query;
	request(url, function(err, response, body) {
		if(!err && response.statusCode == 200) {
			var itunesResponse = JSON.parse(body);
			var podcasts = [];
			if(itunesResponse.resultCount > 0) {
				for (var i = 0; i < itunesResponse.resultCount; i++) {
					var temp = itunesResponse.results[i];
					podcasts.push({
						srcId: temp.collectionId,
						name: temp.collectionName,
						src: 'itunes',
						rssFeed: temp.feedUrl,
						art100: temp.artworkUrl100,
						art600: temp.artworkUrl600,
						genre: temp.primaryGenreName
					});
				}
			}
			res.json(podcasts);
		}
	});
});

api.get('/podcast', function(req, res) {
	var id = req.query.id;
	podcast.findOne({srcId:id}).exec(function(err, pod) {
		if(err) {
			res.json({error: "Erro de banco de dados"});
		} else {
			if(pod != undefined) {
				request(pod.feedUrl, function(errFeed, responseFeed, bodyFeed) {
					if(!errFeed && responseFeed.statusCode == 200) {
						parsePodcast(bodyFeed, (errPod, data) =>{
							if(!errPod) {
								res.json(data);
							} else {
								res.json({error: "RSS inválido"});
							}
						});
					} else {
						res.json({error: "URL inacessivel"});
					}
				});
			} else {
				var url = lookup+id;
				request(url, function(erro, response, body) {
					if(!erro && response.statusCode == 200) {
						var itunesObj = JSON.parse(body);

						var feedUrl = itunesObj.results[0].feedUrl;
						request(feedUrl, function(errFeed, responseFeed, bodyFeed) {
							if(!errFeed && responseFeed.statusCode == 200) {
								parsePodcast(bodyFeed, (errPod, data) => {
									if(!errPod) {
										var new_pod = new podcast({
											srcId: id,
											feedUrl: feedUrl,
											title: data.title,
											image: data.image,
											source: "itunes",
											views: 0
										});
										new_pod.save(function(errSave) {
											if(!errSave) {
												res.json(data);
											} else {
												res.json({error: "Erro ao salvar"});
											}
										});

									} else {
										res.json({error: "RSS inválido"});
									}
								});
							} else {
								res.json({error: "URL inacessivel"});
							}
						});
					} else {
						res.json({error: "API iTunes não responde"});
					}
				});
			}
		}
	});
});

api.post('/user', function(req, res) {
	user.findOne({email: req.body.email}).exec(function(err, usr) {
		if(usr) {
			res.json({success: false, response: 'Já existe um usuário com este e-mail'});
		} else {
			var facebook_id = "0";
			var source = "athom";

			var pass = req.body.pass;
			var cipher = crypto.createCipher(config.pass_algorithm, config.pass_secret);
			var crypted_pass = cipher.update(pass, 'utf8', 'hex');
			crypted_pass += cipher.final('hex');

			if(req.body.facebook_id) {
				facebook_id = req.body.facebook_id;
				source = "facebook";
				pass = null;
			}
			var new_usr = new user({
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				facebook_id: facebook_id,
				source: source,
				email: req.body.email,
				pass: crypted_pass
			});
			new_usr.save(function(errSave) {

				if(!errSave) {
					res.json({
						success: true
					});
				} else {
					res.json({
						success: false,
						response: "Erro ao cadastrar"
					});
				}
			});
		}
	});
});

api.post('/userfb/auth', function(req, res) {
	user.findOne({
		facebook_id:req.body.fb_id
	}, function(err, usr) {
		if(err) throw err;
		if(!usr) {
			var n_user = new user({facebook_id: req.body.fb_id, source: "facebook"});

			n_user.save(function(errSave, saved) {
				if(!errSave) {
					var token = jwt.sign({
						_id:saved._id
					}, config.secret, {
						expiresIn: "24h"
					});
					res.json({
						success: true,
						response: token
					});
				} else {
					res.json({success: false, response: "Erro desconhecido"});
				}
			});
		} else {
			var token = jwt.sign({
				_id:usr._id
			}, config.secret, {
				expiresIn: "24h"
			});
			res.json({
				success: true,
				response: token
			});
		}
	});
});

api.post('/user/auth', function(req, res) {
	user.findOne({email: req.body.email}, function(err, usr) {
		if(err) throw err;
		if(!usr) {
			res.json({success: false, response: "Usuário não existe"})
		} else {

			var decipher = crypto.createDecipher(config.pass_algorithm, config.pass_secret);
			var decrypted_pass = decipher.update(usr.pass, 'hex', 'utf8');
			decrypted_pass += decipher.final('utf8');

			if(decrypted_pass == req.body.pass) {
				var token = jwt.sign({
					_id: usr._id
				}, config.secret, {
					expiresIn: "24h"
				});
				res.json({
					success: true,
					response: token
				});
			} else {
				res.json({
					success: false,
					response: "Senha incorreta"
				});
			}
		}
	})
});

//Daqui em diante o Token será necessário

api.use(function(req,res, next) {
	var token = req.body.token || req.query.token;

	if(token) {
		jwt.verify(token, config.secret, function(err, decoded) {
			if(err) {
				return res.json({success: false, response: "Token inválido"});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).send({
			success: false,
			response: "Token não informado"
		});
	}
});

api.use(function(req, res, next) {
	user.findOne({_id:req.decoded._id}).exec(function (err, usr) {
		if(err) throw err;
		if(!usr) {
			res.json({
				success: false,
				response: "Usuário não localizado"
			});
		} else {
			next();
		}
	});
});

api.get('/user', function(req, res) {
	user.findOne({_id:req.decoded._id}).exec(function(err, usr) {
		if(err) throw err;
		res.json({
			success: true,
			response: {
				_id: usr._id,
				first_name: usr.first_name,
				last_name: usr.last_name,
				email: usr.email,
				source: usr.source,
				facebook_id: usr.facebook_id
			}
		});
	});
});

api.get('/user/podcasts', function(req, res) {
	user.findOne({_id:req.decoded._id}).populate('podcasts').exec(function(err, usr) {
		if(err) throw err;
		res.json({
			success: true,
			response: {
				podcasts: usr.podcasts
			}
		});
	});
})

api.post('/user/podcast', function(req, res) {
	var p_id = req.body.p_id;
	user.findOne({_id:req.decoded._id}).exec(function(err, usr) {
		if(err) throw err;
		podcast.findOne({srcId: p_id}).exec(function(errPod, pod) {
			if(errPod) throw errPod;

			if(!pod) {
				res.json({
					success: false,
					response: "Podcast não localizado"
				});
			} else {
				usr.podcasts.push(pod._id);
				usr.save(function(errSave) {
					res.json({
						success: true,
						response: pod
					});
				});
			}
		});

	});
});

api.delete('/user/podcast', function(req, res) {
	var p_id = req.query.p_id;
	user.findOne({_id:req.decoded._id}).populate('podcasts').exec(function(err, usr) {
		if(err) throw err;

		podcast.findOne({srcId: p_id}).exec(function(errPod, pod) {
			if(errPod) throw errPod;

			if(!pod) {
				res.json({
					success: false,
					response: "Podcast não localizado"
				});
			} else {
				usr.podcasts.pull(pod);
				usr.save(function(errSave) {
					res.json({
						success: true,
						response: pod
					});
				});
			}
		});

	});
});

api.get('/user/notifications', function(req, res) {
	user.findOne({_id: req.decoded._id}).populate('podcasts').exec(function(errUsr, usr) {
		if(errUsr) throw errUsr;

		var notifications = [];
		async.each(usr.podcasts, function(podcast, callback) {
			request(podcast.feedUrl, function(errFeed, responseFeed, bodyFeed) {
				if(!errFeed && responseFeed.statusCode == 200) {
					parsePodcast(bodyFeed, (errPod, data) =>{
						if(!errPod) {
							if(data.updated.getTime() !== podcast.lastUpdate.getTime()) {
								notifications.push({
									title: podcast.title,
									image: podcast.image,
									srcId: podcast.srcId
								});
								var index = usr.podcasts.indexOf(podcast);
								podcast.lastUpdate = data.updated;
								usr.podcasts.set(index, podcast);
								callback();
							} else {
								callback();
							}
						} else {
							callback(errPod);
						}
					});
				} else {
					callback(errFeed);
				}
			});
		}, function(err) {
			if(err) throw err;
			usr.save(function(errSave) {
				res.json({
					success: true,
					response: notifications
				});
			});
		});

	});
});

module.exports = api;
