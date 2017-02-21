app.controller('StackCtrl', function($rootScope, $location, $scope, $http, $routeParams) {
	$rootScope.activetab = $location.path();

	$scope.delete = function(position) {
		if(position==$rootScope.playing) {
			if(position==$rootScope.playlist.length-1) {
				$rootScope.$emit('control.prev');
				$rootScope.playlist.splice(position, 1);
			} else {
				$rootScope.$emit('control.next');
				$rootScope.playlist.splice(position, 1);
				$rootScope.playing -= 1;
			}
		} else {
			$rootScope.playlist.splice(position, 1);
			if(position < $rootScope.playing) {
				$rootScope.playing -= 1;
			}
		}
		if($rootScope.playing==-1) {
			$rootScope.playing = undefined;
			$rootScope.$emit('control.init');
		}
	}

	$scope.jump = function(position) {
		if(position!=$rootScope.playing) {
			$rootScope.$emit('episode.play', $rootScope.playlist[position]);
			$rootScope.playing = position;
		}
	}
});