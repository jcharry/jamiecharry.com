var express = require('express');
var router = express.Router();
var projects = require('../projects.json');
var tweets = require('../lib/tweets');
var Sentiment = require('sentiment');
var timeline = require('../timeline.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', {projects: projects});
});

router.get('/about', function(req, res, next) {
  res.render('about', {title:'About.', timeline: timeline});
});

//router.get('/work', function(req, res, next) {
  //res.render('work', {title: 'Work.', projects: projects});
//});

router.get('/work/:projectID', function(req,res) {

  // Get param passed from request
  var projectID = req.params.projectID;

  //// get the project associated with the projectID param
  var project;
  for (var i = 0; i < projects.length; i++) {
    if (projectID === projects[i].id) {
      project = projects[i];
      break;
    }
  }
  console.log(project);

  res.render('project', {project: project});
});

var s;
router.get('/twitterResults', function(req, res) {
  console.log(req.query.str);
  s = Sentiment(req.query.str);
  tweets.fetchTweets(req.query.str, function(data) {
    data.sentiment = s;
    for (var i = 0; i < data.statuses.length; i++) {
        var sent = Sentiment(data.statuses[i].text);
        data.statuses[i].sentiment = sent; 
    }
    var m;
    if (s.score < 0) {
      m = "I'm sorry to hear that. These folks seem to be feeling the same.";	
    } else if (s.score === 0) {
      m = "Feeling pretty neutral, eh?  You're not alone in your neutrality.";
    } else {
      m = "Wonderful! The twitter-verse seems to be feeling the good vibes, too.";
    }
    res.render('tweets', {layout: false, tweets: data.statuses, message: m});
  });
});

router.get('/contact', function(req, res) {
  res.render('contact', {title: 'Contact.'});
});

//router.get('/sentiment', function(req, res) {
  //s = Sentiment(req.query.str);
  //res.send(s);
//});

module.exports = router;
