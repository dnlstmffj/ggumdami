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
const accountRouter = require('./routes/account');
const adminRouter = require('./routes/admin');

const app = express();
// const moment_timezone = require('moment-timezone');
const connection = mysql.createConnection({
  host:'speakeasy.lucomstudio.com',
  user:'drecat',
  password:'Hello00!',
  database:'ggumdami'
});


function isEmpty(value){
  if ( value == "" || value == null || value == undefined || ( value != null && typeof value == "object" && !Object.keys(value).length ) ){
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
 secret: '@#@$RYCBAR123#@$#$',
 resave: false,
 saveUninitialized: true
}));

// post login with name phone birthdate studentid
app.post('/login', function(req, res){
  connection.query('SELECT * FROM students WHERE phone=' + req.body.phone + ' AND birthdate=' + req.body.birthdate + ' AND id='+req.body.id, function (error, results, fields) {
    if (error) {
        console_log(error);
        res.end("500");
    } else { 
      if(!isEmpty(results)) {
        console_log("Login Success: (id)" + results[0].id);
        req.session.stuid = results[0].id;
        res.end("200");
      } else{
        res.end("403");
      }
    }
  });
});

app.post('/get_application', function(req, res){
  connection.query('SELECT * FROM applications WHERE session=' + req.body.class + ' AND student=' + req.session.stuid, function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      
      res.json(results);
      
    }
  });
  
});

app.post('/get_teachers', function(req, res){
  connection.query('SELECT * FROM teachers', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_programs_incourse', function(req, res){
  connection.query('SELECT * FROM sessions WHERE session=' + req.body.course, function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_programs', function(req, res){
  connection.query('SELECT * FROM sessions WHERE session=' + req.body.session + ' AND batch=' + req.body.batch, function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      console.log(results);
      res.json(results);
    }
  });
});

app.post('/get_programinfo', function(req, res){
  connection.query('SELECT * FROM programs', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_sessioninfo', function(req, res){
  connection.query('SELECT * FROM session_info', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_sessions', function(req, res){
  connection.query('SELECT * FROM sessions', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});
app.post('/get_period', function(req, res){
  connection.query('SELECT * FROM period', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});
app.post('/get_program_insession', function(req, res){
  connection.query('SELECT * FROM sessions WHERE id=' + req.body.id, function (error, results_session, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else {
      connection.query('SELECT * FROM programs WHERE id=' + results_session[0].program, function (error, results, fields) {
        if (error) {
          console_log(error);
          res.end("500");
        } else { 
          connection.query('SELECT * FROM period WHERE session=' + results_session[0].session + ' AND batch=' + results_session[0].batch, function (error, results_period, fields) {
            if (error) {
              console_log(error);
              res.end("500");
            } else { 

              results[0].sessionid = results_session[0].batch;
              results[0].which = results_session[0].id;
              console.log(results);
              res.json(results);

            }
          });

        }
      });
      
      
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



app.post('/cancel', function(req, res){
  connection.query('SELECT EXISTS(SELECT * FROM applications WHERE id=' + req.body.id + ')as value', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else if(results[0].value == 1){ 
      connection.query('DELETE FROM applications WHERE id=' + req.body.id, function (error, results, fields) {
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


app.post('/apply', function(req, res){
  connection.query('INSERT INTO applications (which) SELECT IF((SELECT COUNT(*) FROM applications WHERE which=' + req.body.which + ') >= (SELECT max FROM sessions WHERE id=' + req.body.which + '), 0, ' + req.body.which + ')', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } 
    console.log(results);
    connection.query('UPDATE applications SET student=' + req.session.stuid + ', session=' + req.body.session + ' WHERE id=' + results.insertId, function (error, results, fields) {
      if (error) {
      console_log(error);
      res.end("500");
      } else { 
        res.end("200");
      }
    });

  }); 
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/account', accountRouter);
app.use('/admin', adminRouter);
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

