myNg.controller("CourseProgressControl", function ($scope, $http) {
    $scope.setCourse = function (c) {
        $scope.canSync = false;
        $scope.course = null;
        myApp.showPreloader("Checking progress...");
        $http({
            url: "copyCourse",
            method: "get",
            params: {
                makeTime: c.makeTime,
                authorId: c.authorId
            }
        }).then(function (res) {
            myApp.hidePreloader();
            var r = res.data;
            if (r.errorMessage) {
                myApp.alert(null, "Cannot load course");
                return;
            }
            $scope.course = r.result;
            $scope.canSync = r.canSync;
        });
    };

    $scope.syncCourse = function () {
        myApp.confirm("You can sync this course to the newest version that the course author has made. But please note that this will erase the entire progress of this course you made so far, want to continue?", "Syncing Course", function () {
            myApp.showPreloader("Syncing course...");
            $http({
                url: "syncCourse",
                method: "get",
                params: {
                    makeTime: $scope.course.makeTime,
                    authorId: $scope.course.authorId
                }
            }).then(function (res) {
                myApp.hidePreloader();
                var r = res.data;
                if (r.errorMessage) {
                    myApp.alert(null, "Cannot sync course");
                    return;
                }
                $scope.course.json = r.result.json;
                $scope.course.updated = r.result.updated;
                $scope.canSync = false;
            });
        });
    };

    $scope.learnLesson = function (les) {
        stepRe = true;
        STEPS = les.json.steps;
        if (!STEPS[STEPS.length - 1].final) {
            STEPS.push({final: true});
        }

        var StepsControl = getScope("StepsControl");
        StepsControl.lesson = les;
        StepsControl.mode = "exam";
        StepsControl.studyState.reachFinal = false;
        $$("#back_button_in_steps").once("click", function () {
            stepOn = false;
            mainView.router.load({pageName: "course_progress"});
        });
        mainView.router.load({pageName: "steps"});
        stepOn = true;
    };

    $scope.forfeitCourse = function () {
        myApp.confirm("Are you sure to forfeit this course? Study progress will be discarded.",
                "Forfeit Course",
                function () {
                    $http({
                        url: "deleteCourse",
                        method: "get",
                        params: {
                            makeTime: $scope.course.makeTime,
                            authorId: $scope.course.authorId
                        }
                    }).then(function (res) {
                        var r = res.data;
                        if (!r.errorMessage) {
                            myApp.alert(null, "Course progress deleted");
                            getScope("CourseListControl").listCourses(1);
                            mainView.router.load({pageName: "course_list"});
                        }
                    });
                }
        );
    };
});


