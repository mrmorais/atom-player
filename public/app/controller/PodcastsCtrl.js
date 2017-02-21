app.controller('PodcastsCtrl', function($scope, $rootScope, $location, $cookies, userService) {
	if(!userService.isLogged()) {
		$location.path("/");
	}
	
	$rootScope.activetab = $location.path();
	userService.refreshRootScope();

	$scope.podcasts= [];
	if(userService.isLogged()) {
		userService.getPodcasts().then(function(res) {
			if(res.data.success) {
				if(res.data.response.podcasts.length > 0) {
					$scope.podcasts = res.data.response.podcasts;
				} else {
					$scope.empty = true;
				}
			}
		});
	}
});