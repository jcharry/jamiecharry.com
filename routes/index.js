var express = require('express');
var router = express.Router();
var projects = require('../projects.json');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.query);
    res.render('home', {projects: projects, pagetitle: 'projects.'});
});

router.get('/projects', function(req, res, next) {
    res.render('home', {projects: projects, pagetitle: 'projects.'});
});

router.get('/about', function(req, res, next) {
  res.render('about', {pagetitle: 'about.'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {pagetitle: 'contact.'});
});

// Project Pages
router.get('/quppled', function(req, res, next) {
    res.render('quppled', {pagetitle: 'quppled.'});
});

router.get('/foodapp', function(req, res, next) {
    res.render('foodapp', {pagetitle: 'what\'s in my food?'});
});

router.get('/reflected', function(req, res, next) {
    res.render('reflected', {pagetitle: 'reflected'});
});
router.get('/qad', function(req, res, next) {
    res.render('qad', {pagetitle: 'question a day.'});
});
router.get('/cocoa', function(req, res, next) {
    res.render('cocoa', {pagetitle: 'cocoa bean.'});
});

module.exports = router;
