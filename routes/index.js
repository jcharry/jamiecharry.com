var express = require('express');
var router = express.Router();
var projects = require('../projects.json');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home', {projects: projects});
});

router.get('/work', function(req, res, next) {
    res.render('home', {projects: projects, pagetitle: 'projects.'});
});
router.get('all', function(req, res, next) {
    
});

router.get('/projectInfo', function(req,res, next) {
});

router.get('/about', function(req, res, next) {
  res.render('about', {pagetitle: 'about.'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {pagetitle: 'contact.'});
});

module.exports = router;
