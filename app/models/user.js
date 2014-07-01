var db = require('../config');
// var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');
var Link = require('./link');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  links: function() {
    return this.hasMany(Link);
  },
  initialize: function( reqBody ) {
    this.on( 'creating', function( model, attrs, options) {
      // salt & hash password
      var shasum = crypto.createHash('sha1');
      console.log(shasum);
      shasum.update( model.get('password') );
      //TO DO: add a pinch of salt
      // add hashed password to model
      model.set( 'password', shasum.digest( 'hex' ) );
    });
  }
});

module.exports = User;
