myNg.controller("CourseListControl", function ($scope, $http) {

    $scope.listCourses = function (page, done) {
        $scope.rootAllCourse.page = page;
        listCourse($scope.rootAllCourse, $http, function (list) {
            if (done) {
                done();
            }
        });
    };

    $scope.learnCourse = function (c) {
        getScope("CourseProgressControl").setCourse(c);
        mainView.router.load({pageName: "course_progress"});
    };
});


