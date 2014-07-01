// tupac would be OK with this
var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var auth = require('./lib/auth');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser())
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/create', function(req, res) {
  res.render('index');
});

app.get('/links', function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// route for /signup
app.get( '/signup', function( req, res ) {
//   if logged in
  if ( auth.userLoggedIn() ) {
//     route to /links
    res.redirect( '/links' );
//   else
  } else {
//     render & serve compiled signup page
    res.render( 'signup' );
  }
});


// route for /login
app.get( '/login', function( req, res ) {
//   if logged in
  if ( auth.userLoggedIn() ) {
//     route to /links
    res.redirect( '/links' );
//   else
  } else {
//    render & serve compiled login page
    res.render( 'login' );
  }
});

// route for post request sent to /login
app.post('/login', function(req, res){
  // getUserIfExists - returns promise
  new User({username: req.body.username}).fetch()
  //if user exists
  .then(function(user){
    console.log('login user', user);
    // if passwords match (sychronous)
    if( user == null ){
      // redirect to login with error
      res.redirect('/login'); // TO DO: send back index with "error" banner displayed
    }else{
      var hash = bcrypt.hashSync(req.body.password, user.get('salt'));
      // TO DO: cookie baking time - send token
      // redirect to links
      if ( hash === user.get('password') ) {
        res.redirect('/links');
      }else{
        res.redirect('/login'); //password incorrect
      }
    }
  });
});

//route for post request sent to /signup
app.post('/signup', function(req, res){
  //create new user instance
  new User({username: req.body.username}).fetch()
  //fetch user from database
  .then(function(user){
    console.log('signup user', user);
    //if fail (user exists)
    if( user ){
      console.log('user exists, redirecting to signup');
      //redirect to signup
      res.redirect('/signup'); // TO DO: add 'user already exists banner'
    }else{
      //create new user (as user instance and then in database)
      //redirect to links with success banner
      var tempObj = {};
      tempObj.originalPassword = req.body.password;
      new User(req.body).save()
      .then(function(user){
        res.redirect('/links');
        tempObj.password = user.get('password');
        console.log('Successfully signed up ', user, 'original password', tempObj.originalPassword, 'hashed password', tempObj.password);
      }); //TO DO: send session token to client (cookie-baking magic)
    }
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
