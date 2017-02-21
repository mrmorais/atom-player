app.controller('PodcastCtrl', function($rootScope, $location, $scope, $http, $cookies, $routeParams, userService) {
	$rootScope.activetab = $location.path();
	userService.refreshRootScope();

	$scope.loaded = false;

	var id = $routeParams.id;
	if(!id) {
		$location.path("/");
	}
	var url = '/api/podcast/?id='+id;
	var podcast;
	$http.get(url).then(function(res) {
		console.log(res);
		podcast = res.data;
		podcast.srcId = id;
		var eps_num = podcast.episodes.length;
		if(eps_num > 0) {
			for(var i=0; i<eps_num; i++) {
				var tmp_duration = podcast.episodes[i].duration;
				podcast.episodes[i].duration = Math.round(tmp_duration/60);

				var dt = new Date(podcast.episodes[i].published);
				var srtDt = dt.toLocaleString().split(" ");
				podcast.episodes[i].srtDate = srtDt[0];
			}
		}

		$scope.podcast = podcast;
		$scope.loaded = true;

		mixpanel.track("podcast view", {
			"podcast id": id,
			"podcast title": podcast.title
		});
	});
	if(userService.isLogged()) {
		userService.getPodcasts().then(function(res) {
			if(res.data.success) {
				for(var i=0; i<res.data.response.podcasts.length;i++){
					if(res.data.response.podcasts[i].srcId==id) {
						$scope.signed = true;
					}
				}
			}
		});
	}

	$scope.exec = function(tag, type) {
		for(var i=0; i<podcast.episodes.length; i++) {
			if(podcast.episodes[i].guid==tag) {
				$rootScope.$emit('episode.'+type, {podcast:{
					id: podcast.srcId,
					title: podcast.title,
					image: podcast.image
				}, episode:podcast.episodes[i]});
			}
		}
	}

	$scope.assinar = function() {
		if(userService.isLogged()) {
			userService.subscribe(id).then(function(res) {
				if(res.data.success) {
					$scope.signed = true;
					mixpanel.track("podcast subscribe", {
						"podcast title": podcast.title,
						"podcast id": id
					});
				}
			});
		}
	};

	$scope.desassinar = function() {
		if(userService.isLogged()) {
			userService.unsubscribe(id).then(function(res) {
				if(res.data.success) {
					$scope.signed = false;
					mixpanel.track("podcast unsubscribe", {
						"podcast title": podcast.title,
						"podcast id": id
					});
				}
			});
		}
	};

});
