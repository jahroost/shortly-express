var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session')
var crypto = require('crypto');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var favicon = require('serve-favicon');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'whatever you want',
  resave: false,
  saveUninitialized: true,
}))
app.use(favicon(__dirname + '/public/images/favicon.webp'));

app.get('/', function(req, res) {
  console.log(req.sessionID, req.session.loggedIn)
  res.render('index');
});

app.get('/create', function(req, res) {
  res.render('index');
});

app.get('/links',/*middleware,*/ function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', function(req, res) {
  var uri = req.body.url;


  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
// app.get('/login', function(req,res){
//
//   res.render('login');
//
// });
//
// app.post('/login', function(req, res) {
//   req.session.loggedIn = true
//   res.redirect('/')
// })

app.get('/signup', function(req,res){

  res.render('signup');

});

app.post('/signup', function(req, res) {
  console.log('user info /signup: ',  req.body)
  var user = req.body.username
  var pass = req.body.password

      new User({username: user}).fetch().then(function(found) {
        console.log(found);
        if (found) {
          console.log('YYYYYYYYYYYYYYYOOOOOOOOOOOOOO IM PICKLE RICK!!')
          res.status(400);
          res.redirect('signup')
        } else {
          console.log('usrAttr', {
            username: user,
            password: pass
          })
          new User({
            username: user,
            password: pass
          })
          .save()
          .then(function() {
            res.redirect('/')
        })
      }
    })
  // res.end()
})

app.get('/login', function(req,res){

  res.render('login');

});

app.post('/login', function(req, res) {
  console.log('user info /login: ',  req.body)
  var user = req.body.username
  var pass = req.body.password
      new User({username: user, password: pass}).fetch().then(function(found) {
        console.log(found);
        if (found) {
          res.redirect('/')
        } else {
          res.status(400)
          res.redirect('signup')
        }
      })
  })
  // res.end()

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new User({ code: req.params[0] }).fetch().then(function(link) {
    if (!User) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
