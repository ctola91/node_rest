var express = require('express')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var app = express();

//------- database initialization
require('mongoose').Promise = require('q').Promise;
mongoose.connect('mongodb://localhost:27017/mean-auth');

//------- setting express middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

//------- importing models
var Users = require('./models/user.js')
var Posts = require('./models/posts.js')

//
app.use(require('./routes/users.js'))

//--------------------------------------------------------------
app.get('/users/:userId/posts', function (req, res) {
  var threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  var userId = req.params.userId
  var from = req.query.from || threeDaysAgo
  var to = req.query.to || new Date()

  Posts.find({userId: userId, createdAt: {"$gte": from, "$lt": to}})
    .then(function (result) {
      res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
});

app.get('/users/:userId/posts/:postId', function (req, res) {
  var postId = req.params.postId
  Posts.findOne({_id: postId})
    .then(function (result) {
      res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
});

app.post('/users/:userId/posts', function (req, res) {
  Posts.create(req.body)
    .then(function (result) {
      res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
})

app.put('/users/:userId/posts/:postId', function (req, res) {
  var postId = req.params.postId

  Posts.findByIdAndUpdate(postId, req.body, {new: true})
    .then(function (result) {
      res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
})

app.delete('/users/:userId/posts/:postId', function (req, res) {
  var postId = req.params.postId

  Posts.findByIdAndRemove(postId)
    .then(function (result) {
      res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
})

//--------------------------------------------------------------
app.get('/posts/:postId/comments', function (req, res) {
  var postId = req.params.postId

  Posts.findOne({_id: postId})
    .then(function (result) {
        res.send(result.comments)
    }).catch(function (err) {
      console.log(err)
    })
})

app.post('/posts/:postId/comments', function (req, res) {
  var postId = req.params.postId

  Posts.findByIdAndUpdate(postId, {$push: {"comments": req.body } }, { new: true })
    .then(function (result) {
        res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
})

app.put('/posts/:postId/comments/:commentId', function (req, res) {
  var postId = req.params.postId
  var commentId = req.params.commentId

  Posts.update({'comments._id': commentId }, { $set: { "comments.$.text": req.body.text } }, { new: true })
    .then(function (result) {
        res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
})

app.delete('/posts/:postId/comments/:commentId', function (req, res) {
  var postId = req.params.postId
  var commentId = req.params.commentId

  Posts.findByIdAndUpdate(postId, {$pull: {"comments": { _id: commentId } } }, { new: true })
    .then(function (result) {
        res.send(result)
    }).catch(function (err) {
      console.log(err)
    })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});