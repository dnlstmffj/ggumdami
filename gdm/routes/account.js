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
  var data_projects = [];
  connection.query('SELECT * FROM projects', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    data_projects = results;
  });
  connection.query('SELECT * FROM settings WHERE id=1', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    res.render('account', {title:results[0].value, project:data_projects});
  });
});

module.exports = router;