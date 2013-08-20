var crypto = require('crypto')
  , mongoose = require('mongoose')
  , config = require('../config.json');

// Token expiration in msecs
var tokenExpiration = config.server.token.expiration * 1000;

// Creates a new Mongoose Schema object
var Schema = mongoose.Schema; 

// Collection to hold users
var TokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, required: true },
    token: { type: String, required: true }
  },{ 
    versionKey: false 
  }
);

// Creates the Model for the User Schema
var Token = mongoose.model('Token', TokenSchema);

var deleteExpiredTokens = function(callback) {
  var expired = new Date(Date.now() -  tokenExpiration);
  var query = {timestamp: {$lt: expired}};
  Token.remove(query, function(err, number) {
    if (err) {
      console.log('could not remove expired tokens: ' + err);
    }

    callback(err, number);
  }); 
}

exports.getUserForToken = function(token, callback) {
  deleteExpiredTokens(function(err) {
    var conditions = {token: token};
    Token.findOne(conditions).populate('user').exec(function(err, token) {
      var user = null;

      if (!token || !token.user) {
        return callback(null, null);
      }

      token.user.populate('role', function(err, user) {
        return callback(err, user);
      });

    });
  });
}

exports.createTokenForUser = function(user, callback) {
  var seed = crypto.randomBytes(20);
  var token = crypto.createHash('sha1').update(seed).digest('hex');

  var query = {user: user._id};
  var update = {token: token, timestamp: new Date()};
  var options = {upsert: true};
  Token.findOneAndUpdate(query, update, options, function(err, newToken) {
    if (err) {
      console.log('Could not create token for user: ' + user.username);
    }

    callback(err, newToken);
  });
}

exports.removeTokenForUser = function(user, callback) {
  var conditions = {user: user._id};
  Token.remove(conditions, function(err, numberRemoved) {
    callback(err, numberRemoved);
  });
}