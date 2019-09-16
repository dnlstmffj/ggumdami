const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mysql = require('mysql');
const session = require('express-session');
const moment = require('moment');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const async = require('async');

var app = express();
//const moment_timezone = require('moment-timezone');
const connection = mysql.createConnection({
    host     : 'speakeasy.lucomstudio.com',
    user     : 'drecat',
    password : 'Hello00!',
    database : 'ggumdami'
});
const isEmpty = function(value){
    if( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
        return true
    } else return false
};

moment.tz.setDefault("Asia/Seoul");
connection.connect();

// 로그 함수 - text에 시간을 붙여서 console.log() 합니다.
function console_log(text) {
    console.log('[' + moment().format("YYYY-MM-DD HH:mm:ss") + '] ' + text);

}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
 secret: '@#@$RYCGAR#@$#$',
 resave: false,
 saveUninitialized: true
}));

// post login with name phone birthdate studentid
app.post('/login', function(req, res){
  connection.query('SELECT * FROM students WHERE phone=' + req.body.phone + ' AND birthdate=' + req.body.birthdate + ' AND id=' + req.body.stuid, function (error, results, fields) {
    if (error) {
        console_log(error);
        res.end("500");
    } else { 
        if(req.body.name == results[0].name) {
            console_log("Login Success: (id)" + results[0].id);
            req.session.id = results[0].id;
            res.end("200");
        } else {
            console_log("403! Autification Error: (id)" + results[0].id);
            res.end("403");
        }
    }
  });
});

app.post('/logout', function(req, res){
    req.session.destroy(function(err){
        if(err) {
            console_log(err);
            res.end(403);
        }
        console_log('Logout successed ');
        res.end("200");
    });
});

app.post('/apply', function(req, res){
    connection.query("SELECT EXISTS(SELECT * FROM topic_history WHERE student=" + req.session.id + " AND which=" + req.body.which + ") as value", function (error, results, fields) {
        if (error) {
            console_log(error);
            res.end("500");
        } else if(results[0].value == 0 && !isEmpty(req.body.session)) { 
            connection.query('SELECT COUNT(*) as cnt FROM applications WHERE program=' + req.body.program, function (error, results, fields) {
                if (error) {
                    console_log(error);
                    res.end("500");
                } else { 
                    connection.query('INSERT INTO applications VALUES(NULL, ' + req.session.id + ', ' + req.body.which + ')', function (error, results, fields) {
                        if (error) {
                            console_log(error);
                            res.end("500");
                        } else { 
                            res.end("200");
                        }
                    });
                }
            });
        } else {
            console_log("Service weakness critical error: (id)" + req.session.id);
            res.end("403");
        }
    });
    
});


app.post('/cancel', function(req, res){
  connection.query('SELECT value FROM settings WHERE id=1', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else if(results[0].value == 1 && !isEmpty(req.body.session)){ 
      connection.query('INSERT INTO applications VALUES(NULL, ' + req.session.id + ', ' + req.body.which + ')', function (error, results, fields) {
        if (error) {
        console_log(error);
        res.end("500");
        } else { 
          res.end("200");
        }
      });
    } else {
      res.end("403");
    }
  });
    
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
	
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error	 page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

