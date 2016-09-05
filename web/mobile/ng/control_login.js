myNg.controller("LoginControl", function($scope, $http) {
    $scope.full = function() {
        var elem = document.getElementById("RootControl");
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    };

    $scope.login = function() {
        
    };
});
