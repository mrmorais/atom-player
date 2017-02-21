app.controller("PlayerCtrl", function($rootScope, $scope, $interval, $document) {
    $rootScope.$on('control.init', function(e) {
        $scope.podcast = {title: "Atom Player", image:"/assets/img/play_image.png"};
        $scope.episode = {title: "Atom Player"};

        $scope.button = "fa-pause";
        $('#audio-src').attr('src', '');
        audio.load();
    });
    $scope.$emit('control.init');

    $rootScope.playlist = [];
    $rootScope.playing;

    $scope.muted = false;
    $scope.lastVolume = 0;

    if(audio.paused) {
        $scope.button = "fa-play";
    } else {
        $scope.button = "fa-pause";
    }

    $interval(function() {
        progress.value = Math.round((audio.currentTime/audio.duration)*100);

        var duration = audio.duration;
        var min_dur = "" + Math.floor(duration/60);
        min_dur = ('00'+min_dur).substring(min_dur.length);
        var sec_dur = "" + Math.floor(duration - (min_dur*60));
        sec_dur = ('00'+sec_dur).substring(sec_dur.length);


        var current = audio.currentTime;
        var min_curr = "" + Math.floor(current/60);
        min_curr = ('00'+min_curr).substring(min_curr.length);
        var sec_curr = "" + Math.floor(current - (min_curr*60));
        sec_curr = ('00'+sec_curr).substring(sec_curr.length);

        $scope.diff = min_curr+':'+sec_curr+' / '+min_dur+':'+sec_dur;

    }, 5);

    $document.bind("keypress", function(e) {
      if(e.target == document.body) {
        switch (e.which) {
          case 32:
            //Space
            $scope.playPause();
            return false;
            break;
          case 109:
            //Mute
            if($scope.muted) {
              $scope.muted = false;
              audio.volume = $scope.lastVolume;
            } else {
              $scope.muted = true;
              $scope.lastVolume = audio.volume;
              audio.volume = 0;
            }
            break;
        }
      }
    });

    $scope.changeTime = function() {
        var newTime = Math.round((progress.value/100)*audio.duration);
        audio.currentTime = newTime;
    }

    $scope.changeVolume = function() {
        audio.volume = volume.value/100;
    };

    $scope.playPause = function() {
        if(audio.paused) {
            audio.play();
            $scope.button = "fa-pause";
        } else {
            audio.pause();
            $scope.button = "fa-play";
        }
    };

    $scope.previous = function() {
        $scope.$emit('control.prev');
    };
    $rootScope.$on('control.prev', function(e) {
        if($rootScope.playing > 0) {
            $rootScope.playing -= 1;
            $scope.$emit('episode.play', $rootScope.playlist[$rootScope.playing]);
        }
    });

    $scope.next = function() {
        $scope.$emit('control.next');
    };
    $rootScope.$on('control.next', function(e) {
        if(($rootScope.playlist.length-1) > $rootScope.playing) {
            $rootScope.playing += 1;
            $scope.$emit('episode.play', $rootScope.playlist[$rootScope.playing]);
        }
    });

    $rootScope.$on('episode.execute', function(e, data) {
        if((audio.ended && ($scope.playlist.length-1 == $rootScope.playing)) || $rootScope.playing==undefined) {
            $rootScope.playlist.push(data);
        } else {
            $rootScope.playing += 1;
            $rootScope.playlist.splice($rootScope.playing, 0, data);
            $scope.$emit('episode.play', data);
        }
    });

    $rootScope.$on('episode.play', function(e, data) {
        $scope.podcast = data.podcast;
        $scope.episode = data.episode;

        audio.pause();
        $scope.button = "fa-pause";
        $('#audio-src').attr('src', data.episode.enclosure.url);
        audio.load();
        audio.play();

        mixpanel.track('episode playing', {
          "podcast title": data.podcast.title,
          "episode title": data.episode.title
        });

        $rootScope.$emit('notification.playing', {
            podcast: data.podcast.title,
            image: data.podcast.image,
            episode: data.episode.title
        });
    });

    $rootScope.$on('episode.add', function(e, data) {
        $rootScope.playlist.push(data);
    });

    $scope.$watch(function(scope) {
        return $rootScope.playlist.length;
    }, function(now, old) {
        if(now>0) {
            if((now==1) && (old==0)) {
                $rootScope.playing = 0;
                $scope.$emit('episode.play', $rootScope.playlist[0]);
            } else {
                if($rootScope.playing==now-2 && audio.ended) {
                    $rootScope.playing = now-1;
                    $scope.$emit('episode.play', $rootScope.playlist[$rootScope.playing]);

                }
            }
        }
    });

    $scope.$watch(function(scope) {
        return audio.ended;
    }, function(stoped, old) {
        if(stoped) {
            if($rootScope.playlist.length-1 > $rootScope.playing) {
                $rootScope.playing += 1;
                $scope.$emit('episode.play', $rootScope.playlist[$rootScope.playing]);

            }
        }
    });


});
