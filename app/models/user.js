var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
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
      // create salt and add to model
      // model.set( 'salt', Date.now().toString().concat(Math.random().toString(36).slice(2))); // threw "Invalid salt version"
      var salt = bcrypt.genSaltSync(10);
      model.set('salt', salt);
      // add hashed and salted password to model
      model.set( 'password', bcrypt.hashSync( model.get( 'password' ), salt ) );
      console.log( "creating user", model.get('username') );
    });
  }
});

module.exports = User;
