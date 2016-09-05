myNg.controller("RegistrationControl", function($scope, $http) {
    $scope.regInfo = {};

    $scope.doReg = function() {
        if ($scope.regInfo.pass !== $scope.regInfo.repass) {
            myApp.alert(null, "Your passwords do not match");
            return;
        }

        var regOk = false;
        myApp.showPreloader("Please wait...");
        setTimeout(function() {
            myApp.hidePreloader();
            if (!regOk) {
                myApp.alert("No response from server", "Error");
            }
        }, 15000);

        $http({
            url: "addUser",
            method: "get",
            params: {
                username: $scope.regInfo.username,
                password: $scope.regInfo.pass,
                email: $scope.regInfo.email
            }
        }).then(function(res) {
            regOk = true;
            myApp.hidePreloader();
            var r = res.data;
            if (!r.errorMessage) {
                myApp.alert(null, "Account created");
                mainView.router.load({pageName: "index"});
            } else {
                myApp.alert(r.errorMessage, "Registration fail");
            }
        });
    };

    $scope.canSubmit = function() {
        if (!$scope.regInfo.username) {
            return false;
        }
        if (!$scope.regInfo.pass) {
            return false;
        }
        if (!$scope.regInfo.email) {
            return false;
        }
        return true;
    };
});


