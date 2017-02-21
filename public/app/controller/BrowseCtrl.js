app.controller('BrowseCtrl', function($rootScope, $location, $scope, $http, userService) {
	$rootScope.activetab = $location.path();
	userService.refreshRootScope();

	$scope.search = function(q) {
		if(q.query !== undefined) {
			$http.post('/api/search', {query:q.query}).then(function(response) {
				$scope.search.results = response.data;
				$scope.search_show = true;
			});
		} else {
			$scope.search_show = false;
		}
	}

	$scope.searchClear = function() {
		$scope.search_show = false;
		$scope.query = "";
	};
});