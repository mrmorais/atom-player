app.controller('LogoutCtrl', function($cookies, $location, userService) {
	$cookies.remove('logged');
	$cookies.remove('user_infos');
	$cookies.remove('user_token');
	$cookies.remove('user_type');
	mixpanel.track('logout');
	setTimeout(function() {
		$location.path('browse');
	}, 1000);
});
