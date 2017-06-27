myNg.controller("LoginControl", function ($scope, $http) {
    $scope.full = function () {
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

    $scope.login = function () {
        var loginData = myApp.formToJSON("#my-login-form");

        var loginOk = false;
        myApp.showPreloader("Connecting to Openwords...");

        $http({
            url: "loginUser",
            method: "get",
            params: {
                username: loginData.username,
                password: loginData.pass
            }
        }).then(function (res) {
            loginOk = true;
            myApp.hidePreloader();

            var r = res.data;
            userInfo = {username: loginData.username};
            if (!r.errorMessage) {
                var CourseManagerControl = getScope("CourseManagerControl");
                CourseManagerControl.listMyCourses(1);

                var LessonManagerControl = getScope("LessonManagerControl");
                LessonManagerControl.listMyLessons(1);

                var CourseListControl = getScope("CourseListControl");
                CourseListControl.listCourses(1, function () {
                    $http({
                        url: "getMyProgress",
                        method: "get",
                        params: {recent: true}
                    }).then(function (res) {
                        var r = res.data;
                        if (r.result.length !== 0) {
                            $scope.rootAllCourse.list.unshift(r.result[0]);
                            //test
                            var i = Math.floor(Math.random() * 9) + 1;
                            $scope.rootAllCourse.list[0].fileCover = "img/test" + i + ".jpg";
                            $scope.rootAllCourse.list[0].json.recent = true;
                        }
                        mainView.router.load({pageName: "course_list"});
                    });
                });

            } else {
                myApp.alert(r.errorMessage, "Login fail");
            }
        });

        setTimeout(function () {
            myApp.hidePreloader();
            if (!loginOk) {
                myApp.alert("No response from server", "Error");
            }
        }, 10000);
    };
});


