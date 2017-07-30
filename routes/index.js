var express = require('express');
var router = express.Router();

var isLogin = false;
var checkLoginStatus = function(req, res){
	isLogin = false;
	if(req.signedCookies.userid && req.signedCookies.password){
		isLogin = true;
	}
};

router.get('/', function(req, res, next) {
    res.render('index');
});
router.get('/login', function(req, res, next) {
    res.render('login');
});
router.post('/login', function(req, res, next) {
    checkLoginStatus(req, res);
    res.cookie('userid', req.body['username'], { path: '/', signed: true});
	res.cookie('password', req.body['password'], { path: '/', signed: true });
    res.render( 'index', {
		loginStatus : isLogin
    });
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
	   "password" : password
   }, function (err, doc) {
	   if (err) {
		   // If it failed, return error
		   res.send("There was a problem adding the information to the database.");
	   }
	   else {
		   // If it worked, set the header so the address bar doesn't still say /adduser
		   res.location("/signup");
		   // And forward to success page
		   res.redirect("/");
	   }
   });
});
module.exports = router;
