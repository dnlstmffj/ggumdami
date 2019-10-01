var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment = require('moment');
const session = require('express-session');
var moment_timezone = require('moment-timezone');

var connectionRoot = mysql.createConnection({
    host     : 'speakeasy.lucomstudio.com',
    user     : 'drecat',
    password : 'Hello00!',
    database : 'gdmroot'
});
moment.tz.setDefault("Asia/Seoul");

const isEmpty = function(value){
    if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
        return true
    } else return false
};
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('starter');

});
router.post('/home', function(req, res, next) {
  res.render('modules/home');
});
router.get('/edit_programs', function(req, res, next) {
  var data_programs=[], data_groups=[], data_teachers=[];
  // project, course, program
  var connection = mysql.createConnection({
    host     : 'speakeasy.lucomstudio.com',
    user     : 'drecat',
    password : 'Hello00!',
    database : req.query.project
  });
  console.log(req.query.project);
  connection.connect();
  connection.query('SELECT * FROM programs WHERE lecture=' + req.query.course , function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    data_programs = results;
  });
  connection.query('SELECT * FROM groups', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    for(var i=0; i<results.length; i++) {
      data_groups[results[i].id] = results[i];
    }
  });
  connection.query('SELECT * FROM teachers', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    for(var i=0; i<results.length; i++) {
      data_teachers[results[i].id] = results[i];
    }
    console.log(data_programs);
    res.render('modules/edit_programs', {program:data_programs, teacher:data_teachers, group: data_groups});

  });
  
  connection.end();

});
module.exports = router;
