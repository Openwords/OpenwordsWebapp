myNg.controller("CourseStudyControl", function ($scope, $http) {

    $scope.listMyStudy = function (page) {
        $scope.rootMyStudyList.page = page;
        listCourse($scope.rootMyStudyList, $http, function (list) {
            list.forEach(function (c) {
                if (c.json.totalLesson && c.json.totalLessonRight) {
                    c.json.progress = ((c.json.totalLessonRight / c.json.totalLesson) * 100).toFixed(0);
                }
            });
        });
    };

    $scope.courseAction = function (c) {
        getScope("CourseProgressControl").setCourse(c);
        mainView.router.load({pageName: "course_progress"});
    };
});


