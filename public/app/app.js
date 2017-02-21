if("Notification" in window) {
    Notification.requestPermission();
}

var app = angular.module('player', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider
	.when('/browse', {
		templateUrl: '/app/views/browse.html',
		controller: 'BrowseCtrl'
	})
	.when('/stack', {
		templateUrl: '/app/views/stack.html',
		controller: 'StackCtrl'
	})
	.when('/podcasts', {
		templateUrl: '/app/views/podcasts.html',
		controller: 'PodcastsCtrl'
	})
	.when('/podcast/:id', {
		templateUrl: '/app/views/podcast.html',
		controller: 'PodcastCtrl'
	})
	.when('/login', {
		templateUrl: '/app/views/login.html',
		controller: 'LogSigCtrl'
	})
	.when('/logout', {
		templateUrl: '/app/views/logout.html',
		controller: 'LogoutCtrl'
	})
  .when('/settings', {
    templateUrl: '/app/views/settings.html',
    controller: 'BrowseCtrl'
  })
  .when('/preferences', {
    templateUrl: '/app/views/preferences.html',
    controller: 'BrowseCtrl'
  })

	.otherwise({redirectTo: '/browse'});
});

app.run(function($rootScope, $window, facebookService) {
	$window.fbAsyncInit = function() {
		FB.init({
			appId: '653393811477462',
			status: true,
			cookie: true,
			xfbml: true,
			version: 'v2.6'
		});
	};
	(function(d){
	    // load the Facebook javascript SDK

	    var js,
	    id = 'facebook-jssdk',
	    ref = d.getElementsByTagName('script')[0];

	    if (d.getElementById(id)) {
	      return;
	    }

	    js = d.createElement('script');
	    js.id = id;
	    js.async = true;
	    js.src = "//connect.facebook.net/en_US/all.js";

	    ref.parentNode.insertBefore(js, ref);

	  }(document));

});

app.factory('facebookService', function($q) {
	return {
		login: function() {
			var deferred = $q.defer();
			FB.login(function(res) {
				if(!res || res.error) {
					deferred.reject({erro: true});
				} else {
					deferred.resolve(res);
				}
			}, {scope: 'public_profile, email, user_friends'});
			return deferred.promise;
		},
		userInfos: function() {
			var deferred = $q.defer();
			FB.api('/me', {fields: 'first_name, last_name, email'}, function(res) {
				if(!res || res.error) {
					deferred.reject({erro: true});
				} else {
					deferred.resolve(res);
				}
			});
			return deferred.promise;
		}
	};
});

app.factory('userService', function($rootScope, $http, $cookies, $q, facebookService) {
	var fac = {
		loadInfos: function() {
			if($cookies.get('user_type') !== undefined) {
				if($cookies.get('user_type')==="atom") {
					$http.get('/api/user/?token='+$cookies.get('user_token')).then(function(res) {
						if(res.data.success) {
							var infos = res.data.response;
              mixpanel.identify(infos._id);
              mixpanel.people.set({
                "source": "atom",
                "$name": infos.first_name+' '+infos.last_name,
                "$email": infos.email,
                "$last_login": new Date()
              });
							$cookies.putObject('user_infos', {
								_id: infos._id,
								first_name: infos.first_name,
								last_name: infos.last_name,
								source: infos.source,
								facebook_id: infos.facebook_id
							});
						}
					});
				} else if($cookies.get('user_type')=="facebook") {
					$http.get('/api/user/?token='+$cookies.get('user_token')).then(function(res) {
						if(res.data.success) {
							var at_id = res.data.response._id;
							var fb_id = res.data.response.facebook_id;
							var source = res.data.response.source;

              mixpanel.identify(at_id);

							facebookService.userInfos().then(function(fbRes) {
								if(!fbRes.erro) {
                  mixpanel.people.set({
                    "source": "facebook",
                    "name": fbRes.first_name+' '+fbRes.last_name,
                    "facebook_id": fb_id,
                    "$email": fbRes.email,
                    "$last_login": new Date()
                  });
									$cookies.putObject('user_infos', {
										_id: at_id,
										first_name: fbRes.first_name,
										last_name: fbRes.last_name,
										source: source,
										facebook_id: fb_id
									});
								}
							});
						}
					});
				}
			}
		},
		isLogged: function() {
			return $cookies.get('logged')==='true';
		},
		getInfos: function() {
			return $cookies.getObject('user_infos');
		},
		refreshRootScope: function() {
			$rootScope.logged = $cookies.get('logged');
			$rootScope.user_infos = $cookies.getObject('user_infos');
			$rootScope.user_type = $cookies.get('user_type');
		},
		subscribe: function(p_id) {
			var deferred = $q.defer();
			$http.post('/api/user/podcast/', {token: $cookies.get('user_token'), p_id: p_id}).then(function(res) {
				if(!res.data.success) {
					deferred.reject({success: false});
				} else {
					deferred.resolve(res);
				}
			});
			return deferred.promise;
		},
		unsubscribe: function(p_id) {
			var deferred = $q.defer();
			$http.delete('/api/user/podcast/?token='+$cookies.get('user_token')+'&p_id='+p_id).then(function(res) {
				if(!res.data.success) {
					deferred.reject({success: false});
				} else {
					deferred.resolve(res);
				}
			});
			return deferred.promise;
		},
		getPodcasts: function() {
			var deferred = $q.defer();
			$http.get('/api/user/podcasts/?token='+$cookies.get('user_token')).then(function(res) {
				if(!res.data.success) {
					deferred.reject({success: false});
				} else {
					deferred.resolve(res);
				}
			});
			return deferred.promise;
		},
		getPodcast: function(p_id) {
			var deferred = $q.defer();
			$http.get('/api/podcast/?id='+p_id).then(function(res) {
				deferred.resolve(res);
			});
			return deferred.promise;
		}
	}
	return fac;
});
