myNg.controller("CourseProgressControl", function($scope, $http) {
    $scope.setCourse = function(c, local) {
        if (local) {
            $scope.course = c;
        } else {
            $scope.course = null;
            myApp.showPreloader("Checking progress...");
            $http({
                url: "copyCourse",
                method: "get",
                params: {
                    makeTime: c.makeTime,
                    userId: userInfo.userId,
                    authorId: c.authorId
                }
            }).then(function(res) {
                myApp.hidePreloader();
                var r = res.data;
                if (r.errorMessage) {
                    myApp.alert(null, "Cannot load course");
                    return;
                }
                $scope.course = r.result;
            });
        }
    };

    $scope.learnLesson = function(les) {
        STEPS = les.json.steps;
        if (!STEPS[STEPS.length - 1].final) {
            STEPS.push({final: true});
        }

        var StepsControl = getScope("StepsControl");
        StepsControl.lesson = les;
        StepsControl.mode = "exam";
        StepsControl.studyState.reachFinal = false;
        $$("#back_button_in_steps").once("click", function() {
            stepOn = false;
            mainView.router.load({pageName: "course_progress"});
        });
        mainView.router.load({pageName: "steps"});
        stepOn = true;
    };

    $scope.forfeitCourse = function() {
        myApp.confirm("Are you sure to forfeit this course? Study progress will be discarded.",
                "Forfeit Course",
                function() {
                    $http({
                        url: "deleteCourse",
                        method: "get",
                        params: {
                            pass: "",
                            makeTime: $scope.course.makeTime,
                            userId: $scope.course.userId,
                            authorId: $scope.course.authorId
                        }
                    }).then(function(res) {
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
