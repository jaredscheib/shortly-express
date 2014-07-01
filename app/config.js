var Bookshelf = require('bookshelf');
var path = require('path');

var db = Bookshelf.initialize({
  client: 'sqlite3',
  connection: {
    host: '127.0.0.1',
    user: 'your_database_user',
    password: 'password',
    database: 'shortlydb',
    charset: 'utf8',
    filename: path.join(__dirname, '../db/shortly.sqlite')
    // filename: path.join(__dirname, '../db/test.sqlite')
  }
});

db.knex.schema.hasTable('urls').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('urls', function (link) {
      link.increments('id').primary();
      link.string('url', 255);
      link.string('base_url', 255);
      link.string('code', 100);
      link.string('title', 255);
      link.integer('visits');
      link.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }else{
    console.log('Table urls already exists.');
  }
});

db.knex.schema.hasTable('clicks').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('clicks', function (click) {
      click.increments('id').primary();
      click.integer('link_id');
      click.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

/************************************************************/
// Add additional schema definitions below
/************************************************************/

//check if table 'users' exists
db.knex.schema.hasTable('users').then(function(exists) {
  //if not, create it
  if (!exists){
    //set the schema for it (fields and data types)
    db.knex.schema.createTable('users', function(user){
      user.increments('id').primary();
      //username: string, min-length 4, not null
      user.string('username', 255).notNullable();
      //password string, min-length 8, not null
      user.string('password', 255).notNullable();
      //session token (string), default to null
      user.string('sessionToken', 255);
      //salt
      user.string('salt', 255);
      user.timestamps();
    }).then(function (table){
      //if created, log success
      console.log('Created Table', table);
    }).catch(function(error){
      //else log failure
      console.log('Failed to create Table', error);
    });
  }else{
    console.log('Table users already exists');
  } //else nothing
});

module.exports = db;
