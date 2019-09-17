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
let data_groups, data_applications;
let data_programs=[], data_sessions=[], data_settings=[], data_teachers=[];
router.get('/', function(req, res, next) {
  console.log(req.session.stuid);
  if(isEmpty(req.session.stuid)) {
    res.statusCode = 302;
    res.setHeader('Location', '/account');
    res.end();
    return;
  } else {
    connection.query('SELECT * FROM applications WHERE id=' + req.session.stuid , function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    data_applications = results;

  });
  connection.query('SELECT * FROM groups', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    data_groups = results;

  });
  connection.query('SELECT * FROM programs ORDER BY `group` ASC', function (error, results, fields) {
    if (error) {
      
        console.log(error);
    }
    console.log(results);
    for(var i=0; i<results.length; i++) {
      data_programs[results[i].id] = results[i];
    }


  });
  connection.query('SELECT * FROM sessions', function (error, results, fields) {
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
    data_settings = results;

  });
  connection.query('SELECT * FROM teachers', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
    for(var i=0; i<results.length; i++) {
      data_teachers[results[i].id] = results[i];
    }
    data_teachers = results;
    res.render('index', { applications: data_applications, group:data_groups, program:data_programs, session:data_sessions, setting:data_settings, teacher:data_teachers});
  });
  }
  

});

module.exports = router;
