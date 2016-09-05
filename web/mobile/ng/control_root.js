myNg.controller("RootControl", function($scope, $http, $httpParamSerializerJQLike) {
    $scope.logOut = function() {
        mainView.router.load({pageName: "index"});
        myApp.alert("Don't forget to add this web app to your phone's home screen!", "See you^_^");
    };

    $scope.rootMyLessonList = {
        page: 1,
        pageSize: 10000
    };

    $scope.rootMyCourseList = {
        page: 1,
        pageSize: 10000
    };

    $scope.rootAllCourse = {
        page: 1,
        pageSize: 10000,
        all: true
    };

    $scope.rootMyStudyList = {
        page: 1,
        pageSize: 10000
    };

    $scope.goToCourseStudy = function() {
        getScope("CourseStudyControl").listMyStudy(1);
        mainView.router.load({pageName: "course_study"});
    };

    $scope.refreshCourseList = function() {
        listCourse($scope.rootAllCourse, $http);
    };

    $scope.rootTargetCourse = {
        target: null
    };
    $scope.addLessonFromPool = function(les) {
        if ($scope.rootTargetCourse.target) {
            $scope.rootTargetCourse.target.json.lessons.push(JSON.parse(angular.toJson(les)));
        }
    };

    $scope.saveCourse = function() {
        if (!$scope.rootTargetCourse.target.name) {
            myApp.alert(null, "Course must have a name!");
            return;
        }
        $scope.rootTargetCourse.target.content = angular.toJson($scope.rootTargetCourse.target.json);
        $scope.rootTargetCourse.target.json = null;
        
    };

    $scope.goToLessonManager = function() {
        mainView.router.load({pageName: "lesson_manager"});
    };

    $scope.backFromCourseEdit = function() {
        var CourseEditControl = getScope("CourseEditControl");
        if (CourseEditControl.courseContentChanged[0]) {
            myApp.alert(null, "Don't forget to save your intended changes");
            CourseEditControl.courseContentChanged[0] = false;
            return;
        }
        mainView.router.load({pageName: "course_manager"});
    };
});
