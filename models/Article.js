//we need momment and mongoose npm packages
var moment = require("moment");
var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;


var ArticleSchema = new Schema({
  // this attributes are self explaitory for the article that is scrapped
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  updated : {
    type: String,
    default: moment().format('MMMM Do YYYY, h:mm A')
  },
  // `Comment` is an object that stores a Comment id
  // The ref property links the ObjectId to the Comment model
  // This allows us to populate the Article with an associated comment
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
