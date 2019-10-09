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
        res.end(500);
    } else { 
      if(!isEmpty(results)) {
        console_log("Login Success: (id)" + results[0].id);
        req.session.stuid = results[0].id;
        req.session.project = req.body.project;
        console_log('value=' + req.session.project);
        res.end("203");
        
      } else{
        res.end("403");
      }
    }
  });
});

app.post('/get_application', function(req, res){
  console_log('SELECT * FR=' + req.session.stuid);
  connection.query('SELECT * FROM ' + req.session.project + '_applications WHERE session=' + req.body.class + ' AND student=' + req.session.stuid, function (error, results, fields) {
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
  connection.query('SELECT * FROM ' + req.session.project + '_sessions WHERE session=' + req.body.course + ' ORDER BY batch', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_programs', function(req, res){
  connection.query('SELECT s.id as id, session, batch, program, cur, max, `group` FROM ' + req.session.project + '_sessions AS s, ' + req.session.project + '_programs AS p WHERE s.program = p.id AND session=' + req.body.session + ' AND batch=' + req.body.batch + ' ORDER BY p.group ASC;', function (error, results, fields) {
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
  var project;
  if(req.session.isadmin === 1) project=req.body.project;
  else project=req.session.project;
  connection.query('SELECT * FROM ' + project + '_programs', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});


app.post('/get_sessioninfo', function(req, res){
  connection.query('SELECT * FROM ' + req.session.project + '_session_info', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_limits', function(req, res){
  connection.query('SELECT * FROM ' + req.session.project + '_limits', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_groups', function(req, res){
  connection.query('SELECT * FROM student_groups', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});


app.post('/get_programgroups', function(req, res){
  connection.query('SELECT * FROM ' + req.session.project + '_groups', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/get_sessions', function(req, res){
  connection.query('SELECT * FROM ' + req.session.project + '_sessions', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});
app.post('/get_period', function(req, res){
  connection.query('SELECT * FROM ' + req.session.project + '_period', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.json(results);
    }
  });
});

app.post('/add_project', function(req, res){
  var query = 'CREATE TABLE `' + req.body.class +'_applications` LIKE `system_applications`;';
  query += 'CREATE TABLE `' + req.body.class +'_sessions` LIKE `system_sessions`;';
  query += 'CREATE TABLE `' + req.body.class +'_session_info` LIKE `system_session_info`;';
  query += 'CREATE TABLE `' + req.body.class +'_programs` LIKE `system_programs`;';
  query += 'CREATE TABLE `' + req.body.class +'_period` LIKE `system_period`;';
  query += 'CREATE TABLE `' + req.body.class +'_limits` LIKE `system_limits`;';
  query += 'CREATE TABLE `' + req.body.class +'_group` LIKE `system_group`;';
  query += 'INSERT INTO projects (name, class) VALUES (' + req.body.name + ','  + req.body.class +');';
  connection.query(query, function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      res.end("200");
    }
  });
});

app.post('/add_course', function(req, res){
  connection.query('INSERT INTO ' + req.body.project +'_session_info (name, class, batches) VALUES (' + req.body.name + ', ' + req.body.class + ', ' + req.body.batches + ')', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else { 
      var query = 'INSERT INTO ' + req.body.class + '_period (sessions, batch) VALUES ';
      for(i=0; i<req.body.batches; i++) {
        query += '(' + results.insertId + ', ' + i + ')';  
        if(i != req.body.batches-1) query += ', ';
      }
      connection.query(query, function (error, results, fields) {
        if (error) {
          console_log(error);
          res.end("500");
        } else { 
          res.end("200");
        }
      });
    }
  });
});
  


app.post('/get_program_insession', function(req, res){
  connection.query('SELECT * FROM ' + req.session.project + '_sessions WHERE id=' + req.body.id, function (error, results_session, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else {
      connection.query('SELECT * FROM ' + req.session.project + '_programs WHERE id=' + results_session[0].program, function (error, results, fields) {
        if (error) {
          console_log(error);
          res.end("500");
        } else { 
          connection.query('SELECT * FROM ' + req.session.project + '_period WHERE session=' + results_session[0].session + ' AND batch=' + results_session[0].batch, function (error, results_period, fields) {
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

app.post('/editcourseapply', function(req, res){
  console.log(req.body.period);
  var programs = JSON.parse(req.body.programs);
  var maxes = JSON.parse(req.body.maxes)
  var groups = JSON.parse(req.body.group);
  connection.query('UPDATE ' + req.session.project + '_period SET value=\'' + req.body.period + '\' WHERE session=' + req.body.course + ' AND batch=' + req.body.batch, function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else {
      connection.query('DELETE FROM ' + req.session.project + '_sessions WHERE session=' + req.body.course + ' AND batch=' + req.body.batch, function (error, results, fields) {
        if (error) {
          console_log(error);
          res.end("500");
        } else { 
          var query = 'INSERT INTO ' + req.session.project + '_sessions (session, batch, program) VALUES ';
          var queryLimit = 'INSERT INTO ' + req.session.project + '_limits (which, `group`, `max`) VALUES ';
          for(i=0; i<programs.length; i++) {
            query += '(' + req.body.course + ', ' + req.body.batch + ', ' + programs[i] + ')';
            if(i != programs.length-1) query += ', ';
          }
          if(i==0) { 
            res.end("200");
            return;
          }
          console.log(query);
          connection.query(query, function (error, results_insert, fields) {
            if (error) console_log(error);
            console.log(results_insert);
            connection.query('SELECT * FROM ' + req.session.project + '_sessions WHERE id >=' + results_insert.insertId, function (error, results, fields) { 
              if (error) {
                console_log(error);
                res.end("500");
              }
              console.log(maxes);
              for(i=0; i<results.length; i++) {
                for(j=0; j<groups.length; j++) {
                  console.log('log' + results[i].program);
                  queryLimit += '(' + results[i].id + ', ' + groups[j].id + ', ' + maxes[results[i].program][j] + ')';
                  if(!(i==results.length-1 && j == groups.length-1)) queryLimit += ', ';
                  console.log(queryLimit);
                  
                }
              }
              connection.query(queryLimit, function (error, results, fields) {
                if (error) {
                  console_log(error);
                  res.end("500");
                } else {
                  res.end("200");
                }
              });
            });
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
  connection.query('SELECT EXISTS(SELECT * FROM ' + req.session.project + '_applications WHERE id=' + req.body.id + ')as value', function (error, results, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } else if(results[0].value == 1){ 
      connection.query('SELECT * FROM ' + req.session.project + '_applications WHERE id=' + req.body.id, function (error, results_which, fields) {
        if (error) {
          console_log(error);
          res.end("500");
        } else { 
          connection.query('DELETE FROM ' + req.session.project + '_applications WHERE id=' + req.body.id, function (error, results, fields) {
            if (error) {
              console_log(error);
              res.end("500");
            } else { 
              connection.query('UPDATE ' + req.session.project + '_sessions as s SET cur=s.cur-1 WHERE id=' + results_which[0].which, function (error, results, fields) {
                if (error) {
                  console_log(error);
                  res.end("500");
                } else { 
                  res.end("200");
                }
              });

            }
          });
        }
      });
      
    } else {
      res.end("403");
    }
  }); 
});


app.post('/apply', function(req, res){
  // INSERT INTO (student, which, session) VALUES (, , ) 
  connection.query('INSERT INTO ' + req.session.project + '_applications (student, which, session) VALUES (' + req.session.stuid +', ' + req.body.which + ', ' + req.body.session + ')', function (error, results_insert, fields) {
    if (error) {
      console_log(error);
      res.end("500");
    } 

    connection.query('SELECT IF((SELECT max FROM ' + req.session.project + '_limits WHERE which=' + req.body.which +' AND `group`= (SELECT `group` FROM students WHERE id=' + req.session.stuid + ')) < (SELECT COUNT(*) as cnt FROM ' + req.session.project + '_applications as a, students as s WHERE a.student = s.id AND s.group = (SELECT `group` FROM students WHERE id=' + req.session.stuid + ') AND a.which=301), 0, 1) as vaild', function (error, results, fields) {
      if (error) {
        console_log(error);
        res.end("500");
      }
      console.log('result' + results[0].vaild);
      if(results[0].vaild == 0){
        connection.query('DELETE FROM ' + req.session.project + '_applications WHERE id=' + results_insert.insertId, function (error, results, fields) {
          if (error) {
            console_log(error);
            res.end("500");
          } else { 
            res.end("300");
          }
        });
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

