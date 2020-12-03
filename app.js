var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session')
const hbs = require('express-handlebars');

//routers
var indexRouter = require('./routes/index');
var launchRouter = require('./routes/launch');
var callbackRouter = require('./routes/oauth-callback');
var appIndexRouter = require('./routes/app-index');
var appPage2Router = require('./routes/app-page2');

var app = express();

// view engine setup
app.engine( 'hbs', hbs( {
  extname: 'hbs',
  defaultView: 'index',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'hbs');

app.use(session({
  secret: 'enter your secret here',
  resave: false,
  saveUninitialized: true
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/launch', launchRouter);
app.use('/oauth-callback', callbackRouter);
app.use('/app/index', appIndexRouter);
app.use('/app/page2', appPage2Router);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
