app.controller('NotificationCtrl', function($rootScope, $location, $scope, $http, $routeParams) {
	$rootScope.$on("notification.playing", function(e, data) {
		var options = {
			body: data.episode,
			icon: data.image
		}
		var n = new Notification(data.podcast, options);
	});
});