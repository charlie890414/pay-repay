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
	//console.log(req.signedCookies.id);
	res.render( 'index', {
		'loginStatus' : isLogin,
		'username' : name
	});
});
router.get('/login', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = undefined;
	if(isLogin == true) res.redirect('/');
    else res.render( 'login', {
		'loginStatus' : isLogin,
		'username' : name
	});
});
router.post('/login', function(req, res, next) {
	var db = req.db;

	// Get our form values. These rely on the "name" attributes
    var email = req.body.email;
    var password = req.body.password;
    // Set our collection
    var collection = db.get('users');
	collection.findOne({'email':email}, function(err, doc) {
  		console.log(doc.password);
		if(doc==null||!bcrypt.compareSync(password, doc.password)){
			res.redirect('login');
		}
		else{
			res.cookie('id', doc._id, { path: '/', signed: true , maxAge: 86400000});
		    res.cookie('userid', doc.username, { path: '/', signed: true , maxAge: 86400000});
			res.cookie('password', req.body['password'], { path: '/', signed: true , maxAge: 86400000});
		    res.redirect('/');
		}
	})
});
router.get('/signup', function(req, res, next) {
	var name = undefined;
	if(isLogin == true) res.redirect('/');
    else res.render( 'signup', {
		'loginStatus' : isLogin,
		'username' : name
	});
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
		   res.cookie('id', doc._id, { path: '/', signed: true , maxAge: 86400000});
		   res.cookie('userid', doc.username, { path: '/', signed: true , maxAge: 86400000});
		   res.cookie('password', req.body['password'], { path: '/', signed: true , maxAge: 86400000});
		   res.location("/signup");
		   // And forward to success page
		   res.redirect("/");
	   }
   });
});
router.get('/logout', function(req, res, next) {
	res.clearCookie('id');
	res.clearCookie('userid');
	res.clearCookie('password');
	isLogin=false;
	res.redirect('/');
});

router.get('/pay', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	var id = req.signedCookies.id;
	// Set our internal DB variable
    var db = req.db;
	var collection = db.get('trans');
	collection.find({"fromid":id,"toconfirm":false},function(e,confirm){
        console.log(confirm);
		collection.find({"fromid":id,"toconfirm":true},function(e,docs){
	        console.log(docs);
			res.render( 'pay', {
				'loginStatus' : isLogin,
				'username' : name,
				'docs' : docs,
				'confirm' : confirm
			});
	    });
    });
});

router.get('/repay', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	var id = req.signedCookies.id;
	// Set our internal DB variable
    var db = req.db;
	var collection = db.get('trans');
	collection.find({"toid":id,"toconfirm":false},function(e,confirm){
        console.log(confirm);
		collection.find({"toid":id,"toconfirm":true},function(e,docs){
	        console.log(docs);
			res.render( 'repay', {
				'loginStatus' : isLogin,
				'username' : name,
				'docs' : docs,
				'confirm' : confirm
			});
	    });
    });
});

router.put('/confirm/:id', function(req, res, next) {
    var db = req.db;
	var collection = db.get('trans');
	collection.findOne({"_id":req.params.id},function(e,confirm){
		console.log(confirm);
		collection.update({"_id":req.params.id},{$set:{"toconfirm" : true}},function(e,docs){
	        console.log(docs);
	    });
    });
});

router.get('/newtranspay', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	var db = req.db;

    // Set our collection
    var collection = db.get('users');
	collection.find({},function(e,docs){

	  	var list = [];
        var objKey = Object.keys(docs);
        objKey.forEach(function(objectid){
          var itemkeys = Object.keys(docs[objectid]);
          itemkeys.forEach(function(itemkey) {
            var itemvalue =docs[objectid][itemkey];
            console.log(objectid+': '+itemkey+' = '+itemvalue);
            if (itemkey == "username") {
              list.push(itemvalue.toString());
            }
          })
        })
        console.log(list);

  	  	res.render( 'newtranspay', {
  	  		'loginStatus' : isLogin,
  	  		'username' : name,
  	  		'list' : list
  	  	});
    });
});

router.get('/newtransrepay', function(req, res, next) {
	checkLoginStatus(req, res);
	var name = req.signedCookies.userid;
	var db = req.db;

    // Set our collection
    var collection = db.get('users');
	collection.find({},{},function(e,docs){

      var list = [];
      var objKey = Object.keys(docs);
      objKey.forEach(function(objectid){
        var itemkeys = Object.keys(docs[objectid]);
        itemkeys.forEach(function(itemkey) {
          var itemvalue =docs[objectid][itemkey];
          console.log(objectid+': '+itemkey+' = '+itemvalue);
          if (itemkey == "username") {
            list.push(itemvalue.toString());
          }
        })
      })
      console.log(list);
	  	res.render( 'newtransrepay', {
	  		'loginStatus' : isLogin,
	  		'username' : name,
	  		'list' : list
	  	});
    });
});

router.post('/newtranspay', function(req, res, next) {
	// Set our internal DB variable
   var db = req.db;
   // Get our form values. These rely on the "name" attributes
   var from = req.body.from;
   var to = req.body.to;
   var money = req.body.money;
   var comment = req.body.comment;
   // Set our collection
   var collection = db.get('users');
   collection.findOne({'username':from},function(e,doc){
	   var fromid=doc._id.toString();
	   collection.findOne({'username':to},function(e,doc){
		   var toid=doc._id.toString();
		   // Set another collection
		   collection = db.get('trans');
		   collection.insert({
			   "fromid" : fromid,
			   "toid" : toid,
			   "from" : from,
			   "to" : to,
			   "money" : money,
			   "comment" : comment,
			   "fromconfirm" : false,
			   "toconfirm" : false
		   }, function (err, doc) {
			   if (err) {
				   // If it failed, return error
				   res.send("There was a problem adding the information to the database.");
			   }
			   else {
				   res.redirect("/pay");
			   }
		   });
	   });
   });
});
router.post('/newtransrepay', function(req, res, next) {
	// Set our internal DB variable
   var db = req.db;
   // Get our form values. These rely on the "name" attributes
   var from = req.body.from;
   var to = req.body.to;
   var money = req.body.money;
   var comment = req.body.comment;
   // Set our collection
   var collection = db.get('users');
   collection.findOne({'username':from},function(e,doc){
	   var fromid=doc._id.toString();
	   collection.findOne({'username':to},function(e,doc){
		   var toid=doc._id.toString();
		   // Set another collection
		   collection = db.get('trans');
		   collection.insert({
			   "fromid" : fromid,
			   "toid" : toid,
			   "from" : from,
			   "to" : to,
			   "money" : money,
			   "comment" : comment,
			   "fromconfirm" : false,
			   "toconfirm" : false
		   }, function (err, doc) {
			   if (err) {
				   // If it failed, return error
				   res.send("There was a problem adding the information to the database.");
			   }
			   else {
				   res.redirect("/repay");
			   }
		   });
	   });
   });
});
module.exports = router;
