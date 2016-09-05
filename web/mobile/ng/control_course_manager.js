myNg.controller("CourseManagerControl", function($scope, $http) {

    $scope.createCourse = function() {
        myApp.prompt("Please enter a name for the course", "Creating Course", function(v) {
            var name = v;
            myApp.prompt("Please enter a simple description for the course", "Creating Course", function(v) {
                var comment = v;
                $http({
                    url: "createCourse",
                    method: "get",
                    params: {
                        name: name,
                        authorId: userInfo.userId,
                        userName: userInfo.username,
                        comment: comment
                    }
                }).then(function(res) {
                    var r = res.data;
                    if (!r.errorMessage) {
                        myApp.alert(null, "Success");
                        $scope.listMyCourses(1);
                    } else {
                        myApp.alert(null, "Fail");
                    }
                });
            });
        });
    };

    $scope.listMyCourses = function(page) {
        $scope.rootMyCourseList.page = page;
        $scope.rootMyCourseList.authorId = userInfo.userId;
        listCourse($scope.rootMyCourseList, $http);
    };

    var chosenCourse;
    var actionButtons = [
        {
            text: "Edit",
            onClick: function() {
                var copy = JSON.parse(angular.toJson(chosenCourse));
                $scope.rootTargetCourse.target = copy;
                $scope.$apply();
                mainView.router.load({pageName: "course_edit"});
                getScope("CourseEditControl").courseContentChanged[0] = false;
            }
        },
        {
            text: "Delete",
            color: "red",
            onClick: function() {
                myApp.confirm("Are you sure to delete Course \"" + chosenCourse.name + "\"?",
                        "Deleting Course",
                        function() {
                            $http({
                                url: "deleteCourse",
                                method: "get",
                                params: {
                                    pass: "",
                                    makeTime: chosenCourse.makeTime,
                                    userId: chosenCourse.userId,
                                    authorId: chosenCourse.authorId
                                }
                            }).then(function(res) {
                                var r = res.data;
                                if (!r.errorMessage) {
                                    $scope.listMyCourses(1);
                                    myApp.alert(null, "Course deleted");
                                }
                            });
                        }
                );
            }
        },
        {
            text: "Cancel"
        }
    ];

    $scope.courseAction = function(c) {
        chosenCourse = c;
        myApp.actions(actionButtons);
    };
});
