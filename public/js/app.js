(function() {

	var app = angular.module('capstoneApp', ['ui.router', 'ui.tinymce']);

// ROUTES ================================================
// =======================================================
	
	app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
		// $locationProvider.html5Mode({
		//   enabled: true,
		//   requireBase: false
		// });
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('home', {
				url:'/',
				templateUrl:'partial/main'
			})
			.state('signup', {
				url:'/signup?error',
				templateUrl:'partial/signup',
				controller:'errorController'
			})
			.state('login', {
				url:'/login?error',
				templateUrl:'partial/login',
				controller:'errorController'
			})
			.state('projects', {
				url:'/projects',
				templateUrl:'partial/projects',
				controller:'projectsController'
			})
			.state('selected', {
				url: '/projects/:projectId',
				controller: 'detailsController',
				templateUrl: 'partial/details'
			})
			.state('newpost', {
				url: '/newpost',
				controller:'postController',
				templateUrl:'partial/newpost'
			})
			.state('account', {
				url: '/account',
				templateUrl:'partial/account',
				controller:'userController'
			})
			.state('edit', {
				url: '/edit/:projectId',
				controller:'detailsController',
				templateUrl:'partial/edit'
			})

	}])

// CONTROLLERS ===========================================
// =======================================================

	app.controller('projectsController', ['$scope', 'projectsFactory', 'usersFactory', function($scope, projectsFactory, usersFactory) {

		// preset sort variables, sorted by most recently modified at the top of the list
		$scope.sortType = 'dateModified';
		$scope.sortReverse = true;
		$scope.sortFunc = function(propertyName) {
			$scope.sortType = propertyName;
			$scope.sortReverse = !$scope.sortReverse;
		}

		projectsFactory.getAll()
			.success(function(data) {
				$scope.allProjects = data;

				// AJAX call within a for loop to iterate through all projects and add a new key (author) with data.username
				$scope.projectOwners = [];

				var getProjectOwners = function(i) {
					usersFactory.getUser(data[i].owner)
						.success(function(data) {
							$scope.allProjects[i].author = data.username
						})
				}

				for (var i = 0; i < data.length; i++) {
					getProjectOwners(i);
				}
			})
	}])

	app.controller('detailsController', ['$scope', '$stateParams', '$window', '$sce', 'projectsFactory', 'usersFactory', 'tinymceFactory', function($scope, $stateParams, $window, $sce, projectsFactory, usersFactory, tinymceFactory) {

		$scope.tinymceOptions = tinymceFactory.tinymceOptions;

		projectsFactory.getProject($stateParams.projectId)
			.success(function(data) {
				$scope.project = data;

				// proper formatting with ng-bind-html to this variable
				$scope.htmlFormat = $sce.trustAsHtml($scope.project.fullContent);

				usersFactory.getUser($scope.project.owner)
					.success(function(data) {
					$scope.projectOwner = data;
				})

			});

		// handling project edits
		$scope.editProject = function() {
			// handling date modified for when a change is made
			$scope.project.dateModified = new Date();

			projectsFactory.update($stateParams.projectId, $scope.project)
				.success(function(data) {
					$window.location.href = "/#/projects/" + $stateParams.projectId;
				})
		}

		// handling comments
		$scope.postComment = function(){
			$scope.project.comments.push($scope.newComment);
			console.log($scope.project.comments.postedBy);

			projectsFactory.update($stateParams.projectId, $scope.project)
				.success(function(data) {

					$scope.newComment = '';
				});
		}

		// handling upvotes - click once to upvote, click again to undo vote
		$scope.upvote = function(userId) {

			// checking to see if the upvotes array contains the logged in user._id
			if ($scope.project.upvotes.indexOf(userId) === -1) {
				$scope.project.upvotes.push(userId)
			} else {
				$scope.project.upvotes.splice(($scope.project.upvotes.indexOf(userId)), 1);
			}

			projectsFactory.update($stateParams.projectId, $scope.project)
				.success(function(data) {
					console.log($scope.project.upvotes);
				});
		}

	}]);

	app.controller('postController', ['$scope', '$window', 'projectsFactory', 'tinymceFactory', function($scope, $window, projectsFactory, tinymceFactory) {

		$scope.saveProject = function() {
			projectsFactory.create($scope.projectData)
				.success(function(data) {

				$window.location.href = "/#/projects/" + data._id;
				$scope.projectData = '';
			})
		};

		projectsFactory.getAll()
			.success(function(data) {
				$scope.allProjects = data;
			});

		$scope.tinymceOptions = tinymceFactory.tinymceOptions;

	}]);

	app.controller('userController', ['$scope', '$window', 'projectsFactory', function($scope, $window, projectsFactory) {

		projectsFactory.getAll()
			.success(function(data) {
				$scope.ownersProjects = [];

				for (var i = 0; i < data.length; i++) {
					var project = data[i];
					for (var property in project) {
						if (property === "owner")
							if(project.owner === $scope.currentLoggedUser)
								$scope.ownersProjects.push(project);
					}
				}
			})

		$scope.clickedDelete = '';
		$scope.deletingProject = function(projectId) {
			if ($scope.clickedDelete !== projectId) {
				$scope.clickedDelete = projectId;
			} else {
				$scope.clickedDelete = ''; 
			}
		}

		$scope.deleteProject = function(projectId) {
			projectsFactory.delete(projectId)
				.success(function(data) {
					$window.location.reload();
				})
		}
	}])

	app.controller('errorController', ['$scope', '$stateParams', function($scope, $stateParams) {

		$scope.errorMessage = $stateParams.error;

	}])

// SERVICES ==============================================
// =======================================================
	
	app.factory('projectsFactory', ['$http', function($http) {
		var projectsFactory = {};

		// get a single project
		projectsFactory.getProject = function(id) {
			return $http.get('/projects/' + id)
		}

		// get all the projects
		projectsFactory.getAll = function() {
			return $http.get('/projects');
		}

		// create a project
		projectsFactory.create = function(projectData) {
			return $http.post('/projects/', projectData);
		}

		// update a project
		projectsFactory.update = function(id, projectData) {
			return $http.put('/projects/' + id, projectData);
		}
		
		// delete a project
		projectsFactory.delete = function(id) {
			return $http.delete('/projects/' + id);
		}

		return projectsFactory;
	}])

	app.factory('usersFactory', ['$http', function($http) {
		var usersFactory = {};

		// get a single user
		usersFactory.getUser = function(id) {
			return $http.get('/users/' + id);
		}

		// get all the users
		usersFactory.getAll = function() {
			return $http.get('/users');
		}

		// create a user
		usersFactory.create = function(userData) {
			return $http.post('/users/', userData);
		}

		// update a user
		usersFactory.update = function(id, userData) {
			return $http.put('/users/' + id, userData);
		}

		// delete a user
		usersFactory.delete = function(id) {
			return $http.delete('/user/' + id);
		}

		return usersFactory;
	}])

	app.factory('tinymceFactory', function() {
		var tinymceFactory = {};

		tinymceFactory.tinymceOptions = {
			selector:'textarea',
			theme:'modern',
			menubar: false,
			statusbar: false,
			plugins: 'print textcolor',
			toolbar: "undo redo bold italic underline forecolor",
			content_css: "/css/styles.css"
		}

		return tinymceFactory;
	})

}())