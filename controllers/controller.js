var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

// Index Page Render (first visit to the site) forces the inital scrape
router.get('/', function (req, res){
  res.redirect('/scrape');
});


// Articles Page Render
router.get('/articles', function (req, res){
  Article.find().sort({_id: -1})
    .populate('comments')
    .exec(function(err, doc){
      if (err){
        console.log(err);
      }
      else {
        var hbsObject = {articles: doc}
        res.render('index', hbsObject);
      };
    });
});


// Web Scrape Route
router.get('/scrape', function(req, res) {
  request('http://www.theonion.com/', function(error, response, html) {
    var $ = cheerio.load(html);
    //mongo is too slow to update to check as we pull with cerrio so we use titlesArray to makes sure we don't have duplicates
    var titlesArray = [];
    $('article .inner').each(function(i, element) {
        var result = {};
        result.title = $(this).children('header').children('h2').text().trim() + "";
        result.link = 'http://www.theonion.com' + $(this).children('header').children('h2').children('a').attr('href').trim();
        result.summary = $(this).children('div').text().trim() + "";
        if(result.title !== "" &&  result.summary !== ""){

          // BUT we must also check within each scrape since the Onion has duplicate articles...
          // Due to async, moongoose will not save the articles fast enough for the duplicates within a scrape to be caught
          if(titlesArray.indexOf(result.title) == -1){
            titlesArray.push(result.title);
            Article.count({ title: result.title}, function (err, test){
              if(test == 0){
                var entry = new Article (result);
                entry.save(function(err, doc) {
                  if (err) {
                    console.log(err);
                  }
                  else {
                    console.log(doc);
                  }
                });
              }
              else{
                console.log('Redundant Database Content. Not saved to DB.')
              }
            });
        }
        else{
          console.log('Redundant Onion Content. Not Saved to DB.')
        }

      }
      // Log that scrape is working, just the content was missing parts (I got bored and did a ot of edge cases)
      else{
        console.log('Empty Content. Not Saved to DB.')
      }

    });
    // Redirect to the Articles Page, done at the end of the request for proper scoping
    res.redirect("/articles");
  });
});



// Add a Comment Route - **API**
router.post('/add/comment/:id', function (req, res){
  var articleId = req.params.id;
  var commentAuthor = req.body.name;
  var commentContent = req.body.comment;
  // "result" object has the exact same key-value pairs of the "Comment" model
  var result = {
    author: commentAuthor,
    content: commentContent
  };
  var entry = new Comment (result);

  // Save the entry to the database
  entry.save(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else {
      Article.findOneAndUpdate({'_id': articleId}, {$push: {'comments':doc._id}}, {new: true})
      .exec(function(err, doc){
        if (err){
          console.log(err);
        } else {
          res.sendStatus(200);
        }
      });
    }
  });
});

// Delete a Comment Route
router.post('/remove/comment/:id', function (req, res){
  var commentId = req.params.id;
  Comment.findByIdAndRemove(commentId, function (err, todo) {
    if (err) {
      console.log(err);
    }
    else {
      res.sendStatus(200);
    }
  });
});

// Export Router to Server.js
module.exports = router;
