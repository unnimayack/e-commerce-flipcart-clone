var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/userflip');
var adminRouter = require('./routes/adminflip');
var hbs = require('express-handlebars');
var app = express();
var fileUpload = require('express-fileUpload');
var db = require('./configflip/connectionflip');
var session = require('express-session');
var nocache = require('nocache')
require('dotenv').config();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layoutflip', layoutsDir: __dirname + '/views/layoutflip/', partialsDir: path.join(__dirname, '/views/partialsflip/') }));


app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({ secret: "key", cookie: { maxAge: 600000 } }))

db.connect((err) => {
  if (err)
    console.log("database connection error" + err)
  else
    console.log("database connected")
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
