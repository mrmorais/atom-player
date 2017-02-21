app.controller('LogSigCtrl', function($rootScope, $location, $scope, $http, $cookies, $routeParams, facebookService, userService) {
	if(userService.isLogged()) {
		$location.path("/");
	}

	$scope.signIn = function() {
		if($scope.signinForm.$valid && !$scope.signinForm.$pristine) {
			$scope.cad_success = undefined;
			$scope.cad_error = undefined;

			var cad = $scope.cad;
			$http.post('/api/user', {
				first_name: cad.first_name,
				last_name: cad.last_name,
				email: cad.email,
				pass: cad.pass
			}).then(function(response) {
				if(response.data.success) {
					$scope.logInExec(cad.email, cad.pass);
				} else {
					$scope.cad_error = response.data.response;
				}
			}, function(err) {
				$scope.cad_error = "Erro inesperado ocorreu";
			});
		} else {
			$scope.cad_error = "O formulário possui erros!";
		}
	};

	$scope.logInExec = function(email, pass) {
		$http.post('/api/user/auth', {
			email: email,
			pass: pass
		}).then(function(res) {
			if(res.data.success) {
				$cookies.put('user_token', res.data.response);
				$cookies.put('user_type', 'atom');
				$cookies.put('logged', 'true');

				userService.loadInfos();
				userService.refreshRootScope();

				mixpanel.track("atom login");

				setTimeout(function() {
					$location.path("/");
				}, 1000);
			} else {
				$scope.log_error = res.data.response;
			}
		});
	};

	$scope.logIn = function() {
		if($scope.loginForm.$valid && !$scope.loginForm.$pristine) {
			$scope.log_error = undefined;

			var log = $scope.log;
			$scope.logInExec(log.email, log.pass);

		}
	};

	$scope.logInFb = function() {
		facebookService.login().then(function(res) {

			if(res.status=="connected") {
				$http.post('/api/userfb/auth', {
					fb_id: res.authResponse.userID
				}).then(function(api_res) {
					if(api_res.data.success) {
						$cookies.put('user_token', api_res.data.response);
						$cookies.put('user_type', 'facebook');
						$cookies.put('logged', 'true');

						userService.loadInfos();
						userService.refreshRootScope();

						mixpanel.track("facebook login");

						setTimeout(function() {
							$location.path("/");
						}, 1000);
					} else {
						$scope.log_error = api_res.data.response;
					}
				});
			}
		});
	}

});
