var express = require('express');
var bcrypt   = require('bcrypt-nodejs');
var router = express.Router();

var isLogin = false;
var checkLoginStatus = function(req, res){
	isLogin = false;
	if(req.signedCookies.userid && req.signedCookies.password){
		isLogin = true;
	}
};

router.get('/', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	res.render( 'index', {
		'loginStatus' : isLogin,
		'username' : name
	});
});
router.get('/login', function(req, res, next) {
	checkLoginStatus(req, res);
	if(isLogin == true) res.redirect('/');
    else res.render('login');
});
router.post('/login', function(req, res, next) {
	var db = req.db;

	// Get our form values. These rely on the "name" attributes
    var email = req.body.email;
    var password = req.body.password;
    // Set our collection
    var collection = db.get('users');

	collection.findOne({'email':email}, function(err, docs) {
  		console.log(docs.password);
		if(docs==null||!bcrypt.compareSync(password, docs.password)){
			res.render('login');
		}
		else{
		    res.cookie('userid', docs.username, { path: '/', signed: true});
			res.cookie('password', req.body['password'], { path: '/', signed: true });
		    res.redirect('/');
		}
	})
});
router.get('/signup', function(req, res, next) {
    res.render('signup');
});
router.post('/signup', function(req, res, next) {
	// Set our internal DB variable
   var db = req.db;

   // Get our form values. These rely on the "name" attributes
   var username = req.body.name;
   var email = req.body.email;
   var password = req.body.password;
   // Set our collection
   var collection = db.get('users');

   // Submit to the DB
   collection.insert({
	   "username" : username,
	   "email" : email,
	   "password" : bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
   }, function (err, doc) {
	   if (err) {
		   // If it failed, return error
		   res.send("There was a problem adding the information to the database.");
	   }
	   else {
		   // If it worked, set the header so the address bar doesn't still say /adduser
		   res.cookie('userid', req.body['name'], { path: '/', signed: true});
		   res.cookie('password', req.body['password'], { path: '/', signed: true });
		   res.location("/signup");
		   // And forward to success page
		   res.redirect("/");
	   }
   });
});
router.get('/logout', function(req, res, next) {
	res.clearCookie('userid');
	res.clearCookie('password');
	isLogin=false;
	res.redirect('/');
});

router.get('/pay', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	res.render( 'pay', {
		'loginStatus' : isLogin,
		'username' : name
	});
});

router.get('/repay', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	res.render( 'repay', {
		'loginStatus' : isLogin,
		'username' : name
	});
});

router.get('/newtrans', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	res.render( 'newtrans', {
		'loginStatus' : isLogin,
		'username' : name
	});
});

module.exports = router;
