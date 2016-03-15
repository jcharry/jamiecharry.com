var express = require('express');
var router = express.Router();
var projects = require('../projects.json');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.query);
    res.render('home', {projects: projects, pagetitle: 'work.'});
});

router.get('/work', function(req, res, next) {
    res.render('home', {projects: projects, pagetitle: 'work.'});
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

// Project Pages
router.get('/quppled', function(req, res, next) {
    res.render('quppled');
});

router.get('/reflected', function(req, res, next) {
    res.render('reflected');
});
router.get('/qad', function(req, res, next) {
    res.render('qad');
});

module.exports = router;
