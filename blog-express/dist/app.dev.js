"use strict";

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var fs = require('fs');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var session = require('express-session');

var RedisStore = require('connect-redis')(session); // var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');


var blogRouter = require('./routes/blog');

var userRouter = require('./routes/user');

var app = express(); // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

var ENV = process.env.NODE_ENV;

if (ENV !== 'production') {
  // 开发环境 / 测试环境
  app.use(logger('dev'));
} else {
  // 线上环境
  var logFileName = path.join(__dirname, 'logs', 'access.log');
  var writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  });
  app.use(logger('combined', {
    stream: writeStream
  }));
}

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser()); // app.use(express.static(path.join(__dirname, 'public')));

var redisClient = require('./db/redis');

var sessionStore = new RedisStore({
  client: redisClient
});
app.use(session({
  secret: 'Wjosl#_4323',
  cookie: {
    // path: '/', //默认配置
    // httpOnly: true, //默认配置
    maxAge: 24 * 60 * 60 * 1000
  },
  store: sessionStore
})); // app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.use('/api/blog', blogRouter);
app.use('/api/user', userRouter); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;