var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({

  author: String,

  content: String
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
