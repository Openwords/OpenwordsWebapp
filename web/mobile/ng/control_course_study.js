myNg.controller("CourseStudyControl", function($scope, $http) {

    $scope.listMyStudy = function(page) {
        $scope.rootMyStudyList.page = page;
        $scope.rootMyStudyList.userId = userInfo.userId;
        listCourse($scope.rootMyStudyList, $http, function(list) {
            list.forEach(function(c) {
                var total = 0;
                c.json.lessons.forEach(function(les) {
                    if (les.ok) {
                        total += 1;
                    }
                });
                if (total > 0 && c.json.lessons.length > 0) {
                    total = ((total / c.json.lessons.length) * 100).toFixed(0);
                    c.json.progress = total;
                }
            });
        });
    };

    $scope.courseAction = function(c) {
        getScope("CourseProgressControl").setCourse(c, true);
        mainView.router.load({pageName: "course_progress"});
    };
});


