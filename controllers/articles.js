/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/
/*					REQUIRE ALL LANGUAGES			/
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/

var express 	= require('express'),
	router		= express.Router(),
	Article		= require('../models/article.js'),
	Vote 		= require('../models/vote.js');

/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/
/*				        ROUTES				    	/
/*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*/

/*~*~*~*~*~*~*~~*~*~*/
/*		  INDEX	     /
/*~*~*~*~*~*~**~*~*~*/

router.get('/', function(req, res) {
	Article.find({}, function(err, articlesArray) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('articles/index', {articles: articlesArray});
		};
	});
});

/*~*~*~*~*~*~*~~*~*~*/
/*		  NEW        /
/*~*~*~*~*~*~**~*~*~*/

router.get('/new', function(req, res) {
	res.render('articles/new');
});

/*~*~*~*~*~*~*~~*~*~*/
/*	   CREATE        /
/*~*~*~*~*~*~**~*~*~*/

router.post('/', function(req, res) {
	var newArticle = new Article(req.body.article);
	newArticle.author = req.session.currentUser;
	newArticle.save(function(err, article) {
		if(err) {
			console.log(err);
		}
		else {
			console.log(article);
			res.redirect(301, '/articles');
		}
	});
});

/*~*~*~*~*~*~*~~*~*~*/
/*	     SHOW        /
/*~*~*~*~*~*~**~*~*~*/

router.get('/:id', function(req, res) {
	var mongoId = req.params.id;
	Article.findOne({_id: mongoId}, function(err, foundArticle) {
		if(err) {
			console.log(err);
		}
		else {
			Vote.findOne({ article: mongoId, author: req.session.currentUser }, function (err, vote) {
				res.locals.currentUserHasNotVoted = !vote;
				res.render('articles/show', {article: foundArticle});
			})
		};
	});
});

/*~*~*~*~*~*~*~~*~*~*/
/*	     VOTE        /
/*~*~*~*~*~*~**~*~*~*/

router.post('/:id/vote', function(req, res) {
	var mongoId = req.params.id;
	var num = parseInt(req.body.article.vote);
	console.log(num);
	Vote.findOne({ article: mongoId, author: req.session.currentUser }, function(err, vote){
		if(vote) {
			res.redirect(301, 'articles/show');
		} 
		else {	
			Article.update({_id: mongoId}, {$inc : {vote: num}}, function(err, articleItem) {
				if (err) {
					console.log(err);
				} else {
					Vote.create({
						article: mongoId,
						author: req.session.currentUser, 
					}, function (err, vote) {
						if (err) {
							console.log(err);
						} else {
							console.log(articleItem);
							res.redirect(301, '/articles/' + mongoId);
						}
					});
				}
			});
		}
	});
});

/*~*~*~*~*~*~*~~*~*~*/
/*	   DELETE        /
/*~*~*~*~*~*~**~*~*~*/

router.delete('/:id', function(req,res) {
	var mongoId = req.params.id;
	Article.remove({_id: mongoId}, function(err, foundArticle) {
	 	res.redirect(301, '/articles');
	});
});

/*~*~*~*~*~*~*~~*~*~*/
/*	     EDIT        /
/*~*~*~*~*~*~**~*~*~*/

router.get('/:id/edit', function(req, res) {
	var mongoId = req.params.id;
	Article.findOne({_id: mongoId}, function(err, foundArticle) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('articles/edit', {article: foundArticle});
		}
	});
});

/*~*~*~*~*~*~*~~*~*~*/
/*	    PATCH        /
/*~*~*~*~*~*~**~*~*~*/

router.patch('/:id', function(req,res) {
	var mongoId = req.params.id;
	var updated = req.body.article;

	Article.update({_id: mongoId}, updated, function(err, articleItem) {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect(301, '/articles/' + mongoId);
		}
	});
});

module.exports = router;