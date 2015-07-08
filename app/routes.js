// MODELS
var express 		= require('express');
var User 			= require('./models/user');
var Projects 		= require('./models/projects');

module.exports = function(app, passport) {

// HOME PAGE (with login links) ========
// =====================================
	
	app.get('/', function(req, res) {
		res.render('index', {user: req.user});
	})

	app.get('/partial/:viewname', function(req, res) {
		res.render(req.params.viewname, {user: req.user});
	})

// LOGIN ===============================
// =====================================
	
	app.get('/login', function(req, res) {
		res.render('login');
	})

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/#/projects', // redirect to the secure profile section
        failureRedirect : '/#/login?error=Failed to Login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));	

// SIGNUP ==============================
// =====================================

	app.get('/signup', function(req, res) {
		res.render('signup');
	})

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/#/projects', // redirect to the secure profile section
		failureRedirect: '/#/signup?error=Username already exists', // redirect back to the signup if there is an error
		failureFlash: true // allow flash messages
	}))

// // PROFILE SECTION =====================
// // =====================================

	app.get('/account', function(req, res) {
		res.render('account', {
			user: req.user // get the user out of the session and pass to template
		})
		res.send({user: req.user});
	})

// LOGOUT ==============================
// =====================================
	
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// declaring instance of express.Router for projects and users
	var projectsRouter 	= express.Router();
	var userRouter 		= express.Router();


// USER CRUD ROUTES =========================
// ==========================================
	userRouter.get('/', function(req, res) {
		User.find(function(err, users) {
			if (!err) res.json(users);
		})
	})

	userRouter.post('/', function(req, res) {
		var newUser 		= new User();
		newUser.username 	= req.body.username;
		newUser.password 	= req.body.password;

		newUser.save(function(err, user) {
			if (!err) res.json(user)
		})
	})

	userRouter.get('/:userId', function(req, res) {
		User.findById(req.params.userId, function(err, user) {
			if (!err) res.json(user);
		})
	})

	userRouter.put('/:userId', function(req, res) {
		User.findById(req.params.userId, function(err, user) {
			if (err) res.send(err);

			if (req.body.username) user.username = req.body.username;
			if (req.body.password) user.password = req.body.password;

			user.save(function(err, user) {
				if (!err) res.send(user);
			})
		})
	})

	userRouter.delete('/:userId', function(req, res) {
		User.remove({ _id: req.params.userId }, function(err, user) {
			if (err) return res.send(err);

			res.json({ message: 'Successfully deleted user' });
		})
	})

// PROJECTS CRUD ROUTES =====================
// ==========================================
	
	projectsRouter.get('/', function(req, res) {
		Projects.find(function(err, projects) {
			if (!err) res.json(projects);
		})
	})

	projectsRouter.post('/', function(req, res) {
		var newProject 			= new Projects();
		newProject.name 		= req.body.name;
		newProject.title 		= req.body.title;
		newProject.fullContent 	= req.body.fullContent;
		newProject.dateModified = req.body.dateModified;
		newProject.dateCreated	= req.body.dateCreated;
		newProject.upvotes		= req.body.upvotes;
		newProject.owner 		= req.body.owner;

		newProject.save(function(err, project) {
			if (!err) res.redirect('/#/projects/' + project._id)
		})
	})

	projectsRouter.get('/:projectId', function(req, res) {
		Projects.findById(req.params.projectId, function(err, project) {
			if (!err) res.json(project);
		})
	})

	projectsRouter.put('/:projectId', function(req, res) {
		Projects.findById(req.params.projectId, function(err, project) {
			if (err) res.send(err);

			if (req.body.name) project.name 				= req.body.name;
			if (req.body.title) project.title 				= req.body.title;
			if (req.body.fullContent) project.fullContent 	= req.body.fullContent;
			if (req.body.dateModified) project.dateModified = req.body.dateModified;
			if (req.body.dateCreated) project.dateCreated 	= req.body.dateCreated;
			if (req.body.upvotes) project.upvotes 			= req.body.upvotes;
			if (req.body.comments) project.comments 		= req.body.comments;

			project.save(function(err, project) {
				if (!err) res.json(project);
			})
		})
	})

	projectsRouter.delete('/:projectId', function(req, res) {
		Projects.remove({ _id: req.params.projectId }, function(err, project) {
			if (err) res.send(err);

			res.json({ message: 'Project successfully deleted!' });
		})
	})


// registering projects and users routes
app.use('/users', userRouter);
app.use('/projects', projectsRouter);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.user.authenticated)
		return next();

	// if they arent redirect them to the home page
	res.redirect('/');
};

