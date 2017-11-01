// Node Dependencies
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var logger = require('morgan'); // for debugging
var request = require('request'); // for web-scraping
var cheerio = require('cheerio'); // for web-scraping

var PORT = process.env.PORT || 3000;
// Initialize Express for debugging & body parsing
var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Express-Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// Connect to the Mongo DB and if it deployed to connect to the online verson
if(process.env.NODE_ENV == 'production'){
  mongoose.connect('');
}
else{
  mongoose.connect('mongodb://localhost/news-scraper');
}
var db = mongoose.connection;

// Show any Mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// Once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// Import the Comment and Article models
var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');

// Import Routes/Controller
var router = require('./controllers/controller.js');
app.use('/', router);


// Start the server

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
