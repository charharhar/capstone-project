var express 	 = require('express');
var app      	 = express();
var port     	 = process.env.PORT || 8080;
var mongoose 	 = require('mongoose');
var passport 	 = require('passport');
var flash    	 = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ============================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport);

// set up our express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
	secret: 'capstonesecretcapstone12345capstonesecretcapstone',
	resave: false,
	saveUninitialized: false
}))

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

// required for passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes ====================================================
require('./app/routes')(app, passport);

app.listen(port);
console.log('Server is starting on ' + port);