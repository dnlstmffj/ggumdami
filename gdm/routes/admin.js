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
    database : 'ggumdami',
    multipleStatements: true
});
moment.tz.setDefault("Asia/Seoul");

const isEmpty = function(value){
    if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
        return true
    } else return false
};
/* GET home page. */
router.get('/', function(req, res, next) {
   var data_projects, query='', data_session_info, data_unindexteacher=[], data_teachers=[];
  connection.query('SELECT * FROM projects', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    data_projects = results;
    for(var i=0; i<results.length; i++) query += 'SELECT id, name FROM ' + results[i].class + '_session_info;';
    connection.query('SELECT * FROM teachers', function (error, results, fields) {
      if (error) {
          console.log(error);
      }
      for(var i=0; i<results.length; i++) {
        data_teachers[results[i].id] = results[i];
      }
      data_unindexteacher = results;
    });
    connection.query(query, function (error, results, fields) {
      if (error) {
          console.log(error);
      }
      data_session_info = results;
      console.log(results[0]);
      res.render('starter', {project: data_projects, session_info: results, unindexteacher: data_unindexteacher, teacher:data_teachers});
    });
  });
  
  

});
router.post('/home', function(req, res, next) {
  res.render('modules/home');
});
router.get('/edit_programs', function(req, res, next) {
  var data_programs=[], data_groups=[], data_teachers=[], data_period=[], data_indexgroup=[], data_unindexteacher=[], data_course=[];
  for(var i=0; i<10; i++)  data_period[i] = [];

  console.log(req.query.project);
  connection.query('SELECT * FROM ' + req.query.project + '_session_info WHERE id=' + req.query.course, function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    data_course = results;
  });
  connection.query('SELECT * FROM ' + req.query.project + '_programs WHERE lecture=' + req.query.course , function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    data_programs = results;
  });
  connection.query('SELECT * FROM teachers', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    for(var i=0; i<results.length; i++) {
      data_teachers[results[i].id] = results[i];
    }
    data_unindexteacher = results;
    console.log(data_programs);
    

  });
  connection.query('SELECT * FROM ' + req.query.project + '_groups WHERE lecture=' + req.query.course , function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    for(var i=0; i<results.length; i++) {
      data_indexgroup[results[i].id] = results[i];
      
    }
    console.log(data_indexgroup);
    res.render('modules/edit_programs', {course: data_course, program:data_programs, teacher:data_teachers,  group: results, indexGroup:data_indexgroup, unindexteacher: data_unindexteacher, info: req.query.course});
  });

});
router.get('/edit_course', function(req, res, next) {
  var data_course=[], data_period=[];
  for(i=0; i<10; i++)  data_period[i] = [];
  // project, course, program
  
  console.log(req.query.project);

  connection.query('SELECT * FROM ' + req.query.project + '_session_info WHERE id=' + req.query.course, function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    data_course = results;
  });
  connection.query('SELECT * FROM ' + req.query.project + '_period WHERE session=' + req.query.course + ' ORDER BY session', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);

    for(var i=0; i<results.length; i++) {
      data_period[results[i].batch] = results[i].value;
    }
    console.log(data_period);
  });
  connection.query('SELECT * FROM ' + req.query.project + '_programs WHERE lecture=' + req.query.course, function (error, results, fields) {
    if (error) {
     
      console.log(error);
    }
    console.log(results);
    res.render('modules/edit_course', {course: data_course, program: results, period:data_period, project:req.query.project, info: req.query.course});

  });


});
module.exports = router;
