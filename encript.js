var crypto = require('crypto');
var mongoose = require('mongoose');
var async = require('async');
var user = require('./models/User');
var config = require('./config');
mongoose.connect(config.connection);

user.find({}).exec(function (err, docs) {
  if(!err) {
    async.each(docs, function(user, callback) {
      if(user.pass !== null) {

        var cipher = crypto.createCipher(config.pass_algorithm, config.pass_secret);
        var crypted_pass = cipher.update(user.pass, 'utf8', 'hex');
        crypted_pass += cipher.final('hex');

        user.pass = crypted_pass;
        user.save(function(err) {
          if(err) throw err;
        });
      }
      callback();
    });
  }
});
