var express = require('express');
var router = express.Router();
var projects = require('../projects.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', {projects: projects});
});

router.get('/projectInfo', function(req,res, next) {
    res.send(projects);
});

router.get('/about', function(req, res, next) {
  res.render('about', {title:'About.', timeline: timeline});
});


module.exports = router;
