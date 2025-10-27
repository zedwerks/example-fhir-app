import { fileURLToPath } from 'url';
import path from 'path';
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import session from 'express-session';

// Fix for __dirname in ES modules 👇
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routers
import indexRouter from './routes/index.js';
import launchRouter from './routes/launch.js';
import callbackRouter from './routes/oauth-callback.js';
import appIndexRouter from './routes/app-index.js';
import appPage2Router from './routes/app-page2.js';

const app = express();

// view engine setup
app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'enter your secret here',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ this now works correctly:
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/launch', launchRouter);
app.use('/oauth-callback', callbackRouter);
app.use('/app/index', appIndexRouter);
app.use('/app/page2', appPage2Router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app; // 👈 ESM syntax