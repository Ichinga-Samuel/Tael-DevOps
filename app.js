const createError = require('http-errors');
const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv  = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
const session  = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
const compression = require("compression");

// Database Connection
const connectDB = require('./config/db');

// Authentication
const {local} = require('./config/auth');
local(passport);

// setting up config files
dotenv.config({path:'./config/config.env'});

const {setUser} = require('./routes/helpers/authenticate');

const PORT = process.env.PORT || 5000;

// Routes
const apiRouter = require('./routes/api.js');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');

const app = express();
app.use(compression());
// connecting to Mongo Database
connectDB();
require('./models/Review');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({credentials:true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: false,

  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(setUser);
app.use('/api', apiRouter);
app.use('/', indexRouter);
app.use('/upload', uploadRouter);
app.use('/auth', authRouter);
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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV}  mode on ${PORT}`));
module.exports = app;
