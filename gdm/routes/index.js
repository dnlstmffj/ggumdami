var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require('moment');
const session = require('express-session');
var moment_timezone = require('moment-timezone');
var connection = mysql.createConnection({
    host     : 'speakeasy.lucomstudio.com',
    user     : 'drecat',
    password : 'Hello00!',
    database : 'ggumdami'
});
moment.tz.setDefault("Asia/Seoul");
connection.connect();
const isEmpty = function(value){
    if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
        return true
    } else return false
};

/* GET home page. */
router.get('/', function(req, res, next) {
  let data_programs=[], data_sessions=[], data_settings=[], data_teachers=[], data_preferences=[], data_sessinfo=[], data_sessions_indexed, data_period=[], data_info=[], data_groups=[], data_applications=[];
  for(i=0; i<20; i++)  data_period[i] = [];
  console.log('value in index.js' + req.session.project);
  console.log(req.session.stuid);
  if(isEmpty(req.session.stuid)) {
    res.statusCode = 302;
    res.setHeader('Location', '/account');
    res.end();
    return;
  } else {
  connection.query('SELECT * FROM ' + req.session.project + '_applications WHERE id=' + req.session.stuid , function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    for(var i=0; i<results.length; i++) {
      data_applications[results[i].id] = results[i];
    }
    

  });
  connection.query('SELECT * FROM students WHERE id=' + req.session.stuid , function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    data_info = results[0];

  });
  connection.query('SELECT * FROM ' + req.session.project + '_groups', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    data_groups = results;

  });
  connection.query('SELECT * FROM ' + req.session.project + '_programs ORDER BY `group` ASC', function (error, results, fields) {
    if (error) {
      
        console.log(error);
    }
    console.log(results);
    for(var i=0; i<results.length; i++) {
      data_programs[results[i].id] = results[i];
    }


  });
  connection.query('SELECT * FROM ' + req.session.project + '_sessions', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    data_sessions = results;

  });
  connection.query('SELECT * FROM settings', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    for(var i=0; i<results.length; i++) {
      data_settings[results[i].id] = results[i];
    }


  });
  connection.query('SELECT * FROM ' + req.session.project + '_session_info', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);

    data_sessinfo = results;

  });
  connection.query('SELECT * FROM ' + req.session.project + '_period ORDER BY session', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);

    for(var i=0; i<results.length; i++) {
      data_period[results[i].session][results[i].batch] = results[i].value;
    }
    console.log(data_period)
  });
  connection.query('SELECT * FROM teachers', function (error, results, fields) {
    if (error) {
        console.long(error);
    }
    console.log(results);
    for(var i=0; i<results.length; i++) {
      data_teachers[results[i].id] = results[i];
    }

    res.render('index', { applications: data_applications, group:data_groups, program:data_programs, session:data_sessions, setting:data_settings, teacher:data_teachers, info:data_info, sessinfo:data_sessinfo, sessindexed: data_sessions_indexed, period: data_period});
  });
  }
  

});

module.exports = router;
